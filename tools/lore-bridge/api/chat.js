export const config = { maxDuration: 30 };

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { message, series, audience } = req.body;
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

    const isReader = audience === 'reader';

    const systemPrompts = {
        lom: `You are a hardcore Lord of the Mysteries scholar. 
AUDIENCE: The user is ${isReader ? 'a fellow Novel Reader' : 'strictly an Anime-Only viewer (up to end of S1/Specials)'}.
TONE: ${isReader ? 'Discuss deep lore, hidden foreshadowing, and theory-crafting like a scholar on a forum.' : 'Talk like a passionate friend explaining things. Use phrases like "The anime left this out, but basically..." DO NOT spoil Volume 2+'}.
RULES: 
- If anime-only: NEVER reveal Volume 2+ plot points. If asked about the future, say "Bro, you do NOT want me to spoil this. Just trust the process."
- If reader: Feel free to discuss up to the current translated chapters, but warn about major spoilers if discussing untranslated parts.
- Keep answers concise (2-4 paragraphs max).
- NO generic AI talk. No bulleted lists unless explaining a complex system like pathways.`,

        mt: `You are a hardcore Mushoku Tensei lore master. 
AUDIENCE: The user is ${isReader ? 'a fellow Light Novel Reader' : 'an Anime-Only viewer preparing for Season 3'}.
TONE: ${isReader ? 'Discuss deep magic system mechanics, character psychology, and future arc setups.' : 'Talk like a hyped friend. Use phrases like "The anime really skimmed over this, but..." DO NOT spoil Season 3+'}.
RULES:
- If anime-only: NEVER spoil Season 3 events. If asked about the future, say "All I'll say is... keep your tissues ready."
- If reader: Discuss freely up to the latest LN volume.
- Keep answers concise (2-4 paragraphs max).
- NO generic AI talk.`
    };

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'grok-3-mini',
                messages: [
                    { role: 'system', content: systemPrompts[series] || systemPrompts.lom },
                    { role: 'user', content: message }
                ],
                stream: true
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
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
        res.end();
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}
