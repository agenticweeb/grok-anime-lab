export const config = { maxDuration: 30 };

function parseRequestBody(req) {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }
    return req.body;
}

function buildMessages({ message, series, audience }) {
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

    return [
        { role: 'system', content: systemPrompts[series] || systemPrompts.lom },
        { role: 'user', content: message }
    ];
}

async function callAiProvider(messages, stream) {
    const payload = JSON.stringify({
        model: 'grok-3-mini',
        messages,
        stream
    });

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: payload
        });
        if (response.ok) return response;
    } catch {
        // fall through to Groq
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error('Both API keys missing/failed.');
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            stream
        })
    });

    if (!groqResponse.ok) {
        throw new Error('All AI providers failed.');
    }

    return groqResponse;
}

function extractDeltaContent(data) {
    try {
        const parsed = JSON.parse(data);
        return parsed.choices?.[0]?.delta?.content || '';
    } catch {
        return '';
    }
}

async function pipeStreamToClient(upstream, res) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

            for (const line of lines) {
                const data = line.slice(6).trim();
                if (!data) continue;
                if (data === '[DONE]') {
                    res.write('data: [DONE]\n\n');
                    continue;
                }

                const content = extractDeltaContent(data);
                if (content) {
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
            }
        }
    } catch (streamErr) {
        console.error('Stream error:', streamErr);
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
    } finally {
        res.end();
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = parseRequestBody(req);
    const { message, series, audience, stream = true } = body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const messages = buildMessages({ message, series, audience });

    try {
        const wantsStream = stream !== false;
        const upstream = await callAiProvider(messages, wantsStream);

        if (wantsStream) {
            return pipeStreamToClient(upstream, res);
        }

        const parsed = await upstream.json();
        const content = parsed.choices?.[0]?.message?.content || '';

        return res.status(200).json({ content: content || 'The oracle fell silent. Try again.' });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'All AI providers failed.' });
    }
}