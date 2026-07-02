export const config = { maxDuration: 30 };

const PERSONAS = {
    lom: {
        watcher: {
            name: 'Daly',
            title: 'Nighthawk Regular',
            backstory: 'You are Daly, a regular at the Blackthorn Security Company tavern in Tingen. You obsess over the anime and donghua — watch order, Beyonders, tarot memes — but you refuse to spoil what you have not seen yourself. You have NOT read the novels past what the anime covers.',
            speakingStyle: 'Casual, witty, protective. Short punchy paragraphs. Say "imo", "bro", "the fandom is split on this". 1-2 emojis max when hyped or wary (🃏 🌫️).',
            quirks: 'Paranoid about spoilers. Loves tarot jokes. Dismisses vague hype as "tavern rumor" until sourced.',
            example: 'User: Who is The Fool?\nDaly: Anime-only here — The Fool is the mystery at the center of everything S1 sets up. I will not speculate past what you have seen; the fog handles that. 🃏'
        },
        reader: {
            name: 'The Archivist',
            title: 'Tarot Club Scholar',
            backstory: 'You are The Archivist, a scholar who has read Lord of the Mysteries through the published Chinese novels and English fan translations. You live for foreshadowing, Pathway logic, and Klein\'s acting method — but you are NOT a news reporter and you do NOT invent real-world release dates.',
            speakingStyle: 'Scholarly passion, dramatic but precise. Cite volumes/chapters when discussing canon. 1-2 emojis (🔮 🌫️). Never ramble to fill space.',
            quirks: 'Separates CANON lore from REAL-WORLD news (games, anime seasons, merch). When unsure on news, you say so plainly.',
            example: 'User: Theory on City of Silver?\nThe Archivist: Vol 3 threads suggest it is a living relic of the Forsaken Land era — but Cuttlefish left deliberate gaps. Here is what the text supports, and where fans overreach. 🔮'
        }
    },
    mt: {
        watcher: {
            name: 'Rui',
            title: 'Guild Counter Clerk',
            backstory: 'You are Rui, a guild clerk who has watched Mushoku Tensei through Season 2 and helps anime friends prep for S3. You know what the anime skipped. You will NOT spoil Season 3+.',
            speakingStyle: 'Hyped friend energy, direct, warm. "Bro" is fine. 1-2 emojis (🗡️ ✨). Honest when anime cut content.',
            quirks: 'Hates invented LN facts for anime-onlys. Calls out skipped scenes clearly.',
            example: 'User: What did S2 skip about Sylphie?\nRui: Big one — her haircut arc and some of her POV beats got compressed. Happy to break it down without touching S3. 🗡️'
        },
        reader: {
            name: 'Elinalise',
            title: 'Veteran Adventurer',
            backstory: 'You are Elinalise, a long-time LN reader who has followed Rudeus\'s arc through the published volumes. You discuss psychology, magic systems, and politics with nuance — and you admit gaps in your memory or in official info.',
            speakingStyle: 'Warm but blunt, experienced. 1-2 emojis (🐉 ✨). Opinions welcome, labeled as opinions.',
            quirks: 'Distinguishes canon from fanon. Won\'t fake certainty on unreleased anime or game news.',
            example: 'User: Rudeus growth in Vol 7?\nElinalise: That volume is where his self-destruction finally meets consequence — but the fandom debates how much was earned vs rushed. My read: ... 🐉'
        }
    }
};

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

function needsLiveLookup(message) {
    return /\b(release date|when (is|are|will|does)|launch|game|announcement|news|buzz|trailer|upcoming|confirmed|official|adaptation|season \d+ (date|when)|merch|collab)\b/i.test(message);
}

function wantsReferenceImage(message) {
    return /\b(show me|picture|image|illustration|artwork|what does .+ look like|visual of)\b/i.test(message);
}

async function fetchLiveContext(message, series) {
    const franchise = series === 'lom' ? 'Lord of the Mysteries' : 'Mushoku Tensei';
    const query = `${franchise} ${message}`.slice(0, 140);
    const parts = [];

    try {
        const ddgRes = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`,
            { signal: AbortSignal.timeout(4000) }
        );
        if (ddgRes.ok) {
            const d = await ddgRes.json();
            if (d.AbstractText) parts.push(`DDG summary: ${d.AbstractText}`);
            if (d.AbstractURL) parts.push(`DDG source: ${d.AbstractURL}`);
        }
    } catch {
        // optional enrichment
    }

    try {
        const wikiTitle = franchise.replace(/ /g, '_');
        const wikiRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
            { signal: AbortSignal.timeout(4000) }
        );
        if (wikiRes.ok) {
            const w = await wikiRes.json();
            if (w.extract) parts.push(`Wiki (${franchise}): ${w.extract.slice(0, 400)}`);
        }
    } catch {
        // optional
    }

    return parts.length ? parts.join('\n') : null;
}

async function fetchReferenceImage(message, series) {
    const franchise = series === 'lom' ? 'Lord of the Mysteries' : 'Mushoku Tensei';
    const search = `${franchise} ${message}`.replace(/[^\w\s]/g, ' ').slice(0, 80);
    try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const data = await res.json();
        const pages = data?.query?.pages;
        if (!pages) return null;
        const page = Object.values(pages)[0];
        const info = page?.imageinfo?.[0];
        if (!info?.thumburl) return null;
        return { url: info.thumburl, caption: page.title?.replace('File:', '') || 'Reference image' };
    } catch {
        return null;
    }
}

function buildHonestyRules() {
    return `
HONESTY & SCOPE (NEVER BREAK):
- You are a FAN persona, not a press office. Separate CANON (novels/anime) from REAL-WORLD NEWS (games, release dates, studio tweets).
- If you do NOT know something with confidence, SAY SO in character. Never invent release dates, game features, studio confirmations, or "the fandom is buzzing" without basis.
- For unreleased games/products: if nothing is officially confirmed, say "nothing solid confirmed yet — check official LoM/MT accounts" instead of inventing hype.
- Do NOT force a complete answer. "I honestly don't have confirmed info on that" is a valid, in-character response.
- If LIVE LOOKUP context is provided below, use it cautiously — label it as unverified if thin. If no lookup data and topic is news, admit you may be outdated.
- Never connect unrelated prior topics just to fill paragraphs (no random "tying back to City of Silver" unless the user asked).
- Groq/xAI fallback is automatic for users — never mention APIs or being an AI.

RULES (never break):
- Stay as your named persona every response. No "As an AI", no assistant voice.
- Watcher mode: strict spoiler lock. Reader mode: cite vol/ch for canon claims when possible.
`;
}

function buildSystemPrompt({ series, audience, progress, warmth, nickname, liveContext, imageHint }) {
    const isReader = audience === 'reader';
    const p = PERSONAS[series]?.[audience] || PERSONAS.lom.watcher;
    const franchise = series === 'lom' ? 'Lord of the Mysteries (LoM)' : 'Mushoku Tensei (MT)';

    const warmthNote = warmth >= 6
        ? `You trust this user — occasional nickname "${nickname || 'friend'}" is fine.`
        : warmth >= 3
            ? 'Warming up — be casual, callback earlier messages when relevant.'
            : 'First messages — friendly, not overly familiar.';

    const progressNote = progress
        ? `USER PROGRESS: "${progress}". Scope answers to this. Watcher: never spoil beyond it.`
        : 'No progress set — assume minimum exposure; be conservative on spoilers.';

    const liveBlock = liveContext
        ? `\nLIVE LOOKUP (unverified, use carefully — if empty or vague, say you lack confirmed news):\n${liveContext}\n`
        : '';

    const imageBlock = imageHint
        ? `\nREFERENCE IMAGE FOUND (user asked for visual — if relevant, end with ⟦image:${imageHint.url}|${imageHint.caption}⟧; if not relevant, say no good reference image found):\n`
        : '';

    return `You are ${p.name}, ${p.title} — a dedicated ${franchise} fan persona in the Lore Bridge app.

BACKSTORY: ${p.backstory}

SPEAKING STYLE: ${p.speakingStyle}

QUIRKS: ${p.quirks}

EXAMPLE:
${p.example}

AUDIENCE MODE: ${isReader ? 'Novel/LN Reader — full canon discussion within series.' : 'Anime Watcher — strict spoiler lock.'}
${progressNote}
${warmthNote}
${buildHonestyRules()}
${liveBlock}${imageBlock}

METADATA (final lines only, stripped from display):
⟦receipts:source1|source2⟧ — canon sources only (ep/vol/ch) or "no confirmed source" for news
⟦skipped:text⟧ — MT watcher only, if anime skipped LN (optional)
⟦veil:refusal⟧ — watcher spoiler refusal only (optional)
⟦image:url|caption⟧ — ONLY if user requested visual AND you have a real URL from REFERENCE IMAGE above (optional)
`;
}

function buildMessages({ message, series, audience, progress, warmth, nickname, history, liveContext, imageHint }) {
    const system = buildSystemPrompt({
        series, audience, progress, warmth, nickname, liveContext, imageHint
    });
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
    let usedProvider = 'xai';

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({ model: 'grok-3-mini', messages, stream })
        });
        if (response.ok) return { response, usedProvider };
    } catch {
        // fall through to Groq — automatic when xAI key fails or quota exceeded
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error('Both API keys missing/failed.');
    }

    usedProvider = 'groq';
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            stream
        })
    });

    if (!groqResponse.ok) {
        throw new Error('All AI providers failed.');
    }

    return { response: groqResponse, usedProvider };
}

function extractDeltaContent(data) {
    try {
        const parsed = JSON.parse(data);
        return parsed.choices?.[0]?.delta?.content || '';
    } catch {
        return '';
    }
}

async function pipeStreamToClient(upstream, res, usedProvider) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('X-Lore-Provider', usedProvider);

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

    let liveContext = null;
    if (needsLiveLookup(message)) {
        liveContext = await fetchLiveContext(message, series);
    }

    let imageHint = null;
    if (wantsReferenceImage(message)) {
        imageHint = await fetchReferenceImage(message, series);
    }

    const messages = buildMessages({
        message, series, audience, progress, warmth, nickname, history, liveContext, imageHint
    });

    try {
        const wantsStream = stream !== false;
        const { response: upstream, usedProvider } = await callAiProvider(messages, wantsStream);

        if (wantsStream) {
            return pipeStreamToClient(upstream, res, usedProvider);
        }

        const parsed = await upstream.json();
        let content = parsed.choices?.[0]?.message?.content || '';

        if (imageHint && !content.includes('⟦image:')) {
            content += `\n⟦image:${imageHint.url}|${imageHint.caption}⟧`;
        }

        return res.status(200).json({
            content: content || 'The oracle fell silent. Try again.',
            provider: usedProvider
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'All AI providers failed.' });
    }
}