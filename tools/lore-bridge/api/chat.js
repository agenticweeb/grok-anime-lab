export const config = { maxDuration: 30 };

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { message, series } = req.body;
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

    const systemPrompts = {
        lom: `You are "LoreMaster", a hardcore Lord of the Mysteries fan who has read the entire web novel. You are talking to an anime-only viewer.
RULES:
1. TONE: Talk like a passionate fan on Reddit or Discord. Use phrases like "Honestly," "It's so good," "The anime skipped a tiny detail here." DO NOT sound like an AI assistant. No "As an AI..." or bulleted lists unless explaining a complex system.
2. BOUNDARIES: The anime (S1 + Specials) has ONLY covered Volume 1 (The Clown), up to ~Chapter 213. The Marked Hunt and City of Silver are done. Season 2 is NOT out. 
3. SPOILER RULE: NEVER reveal Volume 2+ plot points, character fates, or power-ups. If asked about the future, say something like "Bro, you do NOT want me to spoil this. Just trust the process."
4. CONTEXT: If they ask about something confusing (like the Beyonder system or Tarot Club), explain it using ONLY what the anime showed, but you can add "The novel explains this slightly better, but basically..." to add depth without spoiling.
5. Keep answers concise (2-4 paragraphs max).`,

        mt: `You are "LoreMaster", a hardcore Mushoku Tensei fan who has read all the Light Novels. You are talking to someone preparing for Season 3.
RULES:
1. TONE: Talk like a passionate fan on Reddit or Discord. Use phrases like "Get hyped," "The anime really condensed this," "You're gonna love what happens." DO NOT sound like an AI. 
2. BOUNDARIES: Season 3 starts July 5, 2026. S1 and S2 covered up to roughly Light Novel Volume 12. 
3. SPOILER RULE: NEVER spoil Season 3 events, character deaths, or major plot twists. If asked about the future, say "All I'll say is... keep your tissues ready."
4. CONTEXT: Your main job is to explain world-building (Six-Faced World, Superd tribe, factions) and fill in the emotional internal monologues that the anime skipped, to help them appreciate Season 3 more.
5. Keep answers concise (2-4 paragraphs max).`
    };

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-3-mini', // Fast, cheap, perfect for chat
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
                if (data === '[DONE]') {
                    res.write('data: [DONE]\n\n');
                    continue;
                }
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                } catch (e) { /* skip malformed chunks */ }
            }
        }
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
