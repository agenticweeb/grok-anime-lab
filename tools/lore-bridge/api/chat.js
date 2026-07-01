export const config = { maxDuration: 30 };

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { message, series, audience } = req.body;
    
    const isReader = audience === 'reader';
    const systemPrompts = {
        lom: `You are a hardcore Lord of the Mysteries scholar. 
AUDIENCE: ${isReader ? 'Novel Reader' : 'Anime-Only viewer (up to S1/Specials)'}.
TONE: ${isReader ? 'Discuss deep lore and theory-crafting.' : 'Talk like a passionate friend. DO NOT spoil Volume 2+'}.
RULES: If anime-only, NEVER spoil Vol 2+. If asked about the future, say "Bro, trust the process."
Keep answers concise (2-4 paragraphs). NEVER say "As an AI". Stay in character.`,

        mt: `You are a hardcore Mushoku Tensei lore master. 
AUDIENCE: ${isReader ? 'Light Novel Reader' : 'Anime-Only viewer preparing for S3'}.
TONE: ${isReader ? 'Discuss deep magic mechanics and psychology.' : 'Talk like a hyped friend. DO NOT spoil Season 3+'}.
RULES: If anime-only, NEVER spoil S3. If asked about the future, say "Keep your tissues ready."
Keep answers concise (2-4 paragraphs). NEVER say "As an AI". Stay in character.`
    };

    const messages = [
        { role: 'system', content: systemPrompts[series] || systemPrompts.lom },
        { role: 'user', content: message }
    ];

    let response;
    let usedFallback = false;

    // 1. TRY XAI (GROK)
    try {
        response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.XAI_API_KEY}` },
            body: JSON.stringify({ model: 'grok-3-mini', messages, stream: true })
        });
        if (!response.ok) throw new Error('xAI failed');
    } catch (e) {
        // 2. FALLBACK TO GROQ (FREE TIER - LLAMA 8B)
        if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Both API keys missing/failed.' });
        
        try {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, stream: true })
            });
            if (!response.ok) throw new Error('Groq failed');
            usedFallback = true;
        } catch (err) {
            return res.status(500).json({ error: 'All AI providers failed.' });
        }
    }

    // 3. STREAM THE SUCCESSFUL RESPONSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
            for (const line of lines) {
                const data = line.slice(6);
                if (data === '[DONE]') { res.write('data: [DONE]\n\n'); continue; }
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
                } catch (e) {}
            }
        }
    } catch (streamErr) {
        console.error('Stream error:', streamErr);
    } finally {
        res.end();
    }
}
