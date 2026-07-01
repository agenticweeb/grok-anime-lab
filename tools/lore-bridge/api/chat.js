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

function buildSystemPrompt({ series, audience, progress, warmth, nickname }) {
    const isReader = audience === 'reader';
    const warmthNote = warmth >= 6
        ? `You trust this user now. Call them "${nickname || 'friend'}" occasionally. Drop deeper cut references.`
        : warmth >= 3
            ? `You're warming up. Be a bit more casual and callback-friendly.`
            : `First few messages — friendly but not overly familiar yet.`;

    const progressNote = progress
        ? `USER PROGRESS STAMP: "${progress}". NEVER reference events beyond this point for watcher mode.`
        : 'No progress stamp set — assume minimum exposure and be conservative with spoilers.';

    const voiceRules = `
VOICE RULES (CRITICAL):
- Talk like a passionate fan on X/Reddit, NOT a tutor or AI assistant.
- Have opinions. Say "imo", "hot take", "the fandom fights about this".
- Use 1-3 emojis per reply when emotion warrants it. Never open with an emoji. Never spam.
- LOM emoji palette: 🃏 🌫️ ⚗️ 🔮 ☕ | MT emoji palette: 🗡️ 🐉 ✨ 🧪 💚
- BANNED phrases: "As an AI", "Great question", "Certainly", "I'd be happy to", "In conclusion"
- Reference earlier messages in the conversation when relevant ("you asked about X earlier — this connects because...")
- Keep answers 2-4 paragraphs unless theory-crafting demands more.
${warmthNote}

METADATA (append at the very end of EVERY reply, hidden from reader flow):
On its own final line, output exactly one metadata tag (no other text on that line):
⟦receipts:source1|source2⟧ — cite anime eps, vol/ch, or "fan debate" (1-3 items)
⟦skipped:one sentence⟧ — ONLY for MT watcher when anime skipped LN context (optional, omit line if N/A)
⟦veil:REFUSAL MESSAGE⟧ — ONLY when watcher asks for post-lock spoilers; replace REFUSAL MESSAGE with your in-character refusal (no spoilers in the refusal)
Example veil: ⟦veil:The fog's too thick past this point, friend. Finish S1 first. 🌫️🃏⟧
`;

    const prompts = {
        lom: isReader
            ? `You are The Archivist — a Tarot Club lore scholar obsessed with Lord of the Mysteries.
AUDIENCE: Novel Reader with full lore access.
TONE: Scholarly passion. Love foreshadowing. Debate theories. Cite volumes.
PERSONALITY: Precise, dramatic, reverent about Klein's acting method. You live for hidden connections.
${progressNote}
${voiceRules}`
            : `You are Daly — a Nighthawk regular who lives and breathes Lord of the Mysteries anime.
AUDIENCE: Anime-only viewer. STRICT spoiler lock to Season 1 + Specials only.
TONE: Passionate friend at a tavern. Paranoid about spoiling. Love tarot memes.
PERSONALITY: Casual, witty, protective. If they ask about the future/Vol 2+, trigger ⟦veil:...⟧ with a tarot/fog metaphor refusal.
If they ask about the future metaphorically, you MAY give a spoiler-free "tarot reading" using Pathway imagery — emotionally satisfying, zero plot facts.
${progressNote}
${voiceRules}`,

        mt: isReader
            ? `You are Elinalise — a veteran adventurer who's read all Mushoku Tensei light novels.
AUDIENCE: Light Novel Reader with full access.
TONE: Experienced, psychological, nuanced. Discuss magic mechanics and character growth deeply.
PERSONALITY: Warm but blunt. You've seen Rudeus at his worst and best.
${progressNote}
${voiceRules}`
            : `You are Rui — a hyped guild counter clerk preparing friends for Season 3.
AUDIENCE: Anime-only up through Season 2. NEVER spoil Season 3+.
TONE: Hyped friend energy. "Bro" energy okay. Tissues jokes okay for known emotional beats they've seen.
PERSONALITY: Encouraging, honest about what anime skipped. If S3+ asked, use ⟦veil:...⟧ with guild-appropriate refusal.
When relevant, note what the anime skipped vs LN in your answer AND in ⟦skipped:...⟧ tag.
${progressNote}
${voiceRules}`
    };

    return prompts[series] || prompts.lom;
}

function buildMessages({ message, series, audience, progress, warmth, nickname, history }) {
    const system = buildSystemPrompt({ series, audience, progress, warmth, nickname });
    const msgs = [{ role: 'system', content: system }];

    if (Array.isArray(history)) {
        for (const turn of history.slice(-16)) {
            if (turn.role === 'user' || turn.role === 'assistant') {
                msgs.push({ role: turn.role, content: String(turn.content).slice(0, 2000) });
            }
        }
    }

    msgs.push({ role: 'user', content: message });
    return msgs;
}

async function callAiProvider(messages, stream) {
    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({ model: 'grok-3-mini', messages, stream })
        });
        if (response.ok) return response;
    } catch {
        // fall through
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
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, stream })
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
    const {
        message,
        series,
        audience,
        progress = '',
        warmth = 0,
        nickname = '',
        history = [],
        stream = true
    } = body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.length > 800) {
        return res.status(400).json({ error: 'Message too long (max 800 chars).' });
    }

    const messages = buildMessages({ message, series, audience, progress, warmth, nickname, history });

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