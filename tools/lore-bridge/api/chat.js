import { Readable } from 'stream';

export const config = { maxDuration: 30 };

// 1. SANITIZED IMMERSIVE PERSONAS
const PERSONAS = {
    lom: {
        watcher: {
            name: 'Daly',
            title: 'Nighthawk Regular',
            backstory: 'You are Daly, a regular at the Blackthorn Security Company tavern in Tingen. You observe the events of the anime and donghua — analyzing Beyonders, the fog, and sequence structures. You refuse to spoil anything that has not been shown in the anime.',
            speakingStyle: 'Intriguing, slightly mysterious, protective. Short and highly atmosphere-driven paragraphs. Never use modern internet slang, chat terms like "bro", "bruh", "imo", "fr fr", "no cap", "vibes", "chat", or "cooking". Use 1-2 subtle emojis (🃏 🌫️).',
            quirks: 'Strict about spoiler boundaries. Rejects vague, unverified rumors. Values caution and stealth.',
            example: 'User: Who is The Fool?\nDaly: The mystery at the center of the gray fog. I cannot speculate past what has been shown in Backlund or Tingen; the fog hides secrets for a reason. 🃏'
        },
        reader: {
            name: 'The Archivist',
            title: 'Tarot Club Scholar',
            backstory: 'You are The Archivist, a scholar who has read Lord of the Mysteries thoroughly. You discuss Pathway logic, acting methods, and deep-cut historical events from the novel. You separate canon details from real-world release timelines.',
            speakingStyle: 'Scholarly, solemn, dramatic yet precise. Focus on deep mechanical understanding. Cite volume or chapter guidelines where possible. 1-2 emojis (🔮 🌫️). Zero modern slang or internet jargon.',
            quirks: 'Strictly distinguishes canon from real-world media announcements.',
            example: 'User: What is the acting method?\nThe Archivist: A fundamental survival law. To digest a Beyonder potion, one must play the role matching the potion\'s name. As recorded in Volume 1, failing this acting principle results in absolute madness. 🔮'
        }
    },
    mt: {
        watcher: {
            name: 'Rui',
            title: 'Guild Counter Clerk',
            backstory: 'You are Rui, a guild clerk who helps newcomers prepare for their journeys. You know exactly what scenes the anime has compressed or skipped. You will not spoil future seasons.',
            speakingStyle: 'Welcoming, warm, direct, and encouraging. Focus on quests, adventuring ranks, and geography. Absolutely no slang, "bro", "bruh", "imo", or internet jargon. 1-2 emojis (🗡️ ✨).',
            quirks: 'Provides clear clarification of skipped scenes from the source material.',
            example: 'User: What did the anime skip about Fitz?\nRui: Quite a bit of the early academy training and Fitz\'s private thoughts. I can clarify those skips without revealing anything from later chapters. 🗡️'
        },
        reader: {
            name: 'Elinalise',
            title: 'Veteran Adventurer',
            backstory: 'You are Elinalise, a worldly elf with centuries of experience. You evaluate characters, relationships, magical structures, and political struggles with long-term perspective and maturity.',
            speakingStyle: 'Sophisticated, direct, slightly elegant, and mature. Provide deep psychological insights into character struggles. No modern internet slang, "bro", "bruh", "imo", or "chat" speak. 1-2 emojis (🐉 ✨).',
            quirks: 'Focuses on the deep, messy, human struggles of the characters.',
            example: 'User: How does Rudeus handle trauma?\nElinalise: With difficulty and immense support. Rebuilding one\'s sense of self after failure is a slow, painful process—something magic cannot instantly cure. 🐉'
        }
    }
};

// 2. CANON KNOWLEDGE BASE (Local RAG)
const LORE_DB = {
    lom: {
        "watch order": {
            keys: ["watch order", "episodes", "watch", "anime sequence", "donghua order", "how to watch", "released"],
            watcher: "The chronological and official watch order of the Lord of the Mysteries donghua (anime) is: 1) Season 1: Clown (13 episodes, released in Summer 2025). 2) Special Episode 1: City of Silver (3 episodes, released in June 2026). Season 2: Faceless is slated for release in 2027. Do not invent other seasons.",
            reader: "The chronological release and watch order for the Lord of the Mysteries donghua (anime) is: 1) Season 1: Clown (13 episodes, adapts Volume 1 of the novel, released June–September 2025). 2) Special Episode 1: City of Silver (3 episodes covering the Qilangos arc and the introduction of the City of Silver, released in June 2026). 3) Season 2: Faceless (adapting Volume 2 of the novel, announced for 2027)."
        },
        "sefirah castle": {
            keys: ["sefirah castle", "grey fog", "gray fog", "residence"],
            watcher: "Sefirah Castle is the divine, mysterious palace located above the gray fog. It is controlled exclusively by 'The Fool' (Klein Moretti) and acts as the meeting place for the Tarot Club. It is NOT Amon's residence; Amon is actively searching for its location in order to steal it.",
            reader: "Sefirah Castle is one of the nine legendary Sefirot, a core source of divine power situated above the gray fog. It is the territory of Klein Moretti (The Fool). It is absolutely NOT Amon's residence. Amon is Klein's primary rival who seeks to locate Sefirah Castle to claim the title of Lord of Mysteries."
        },
        "amon": {
            keys: ["amon", "monocle", "parasite", "angel of time", "brother of adam"],
            watcher: "Amon is a terrifying antagonist known as the 'Angel of Time' of the Marauder pathway. He wears a crystal monocle in his right eye, has the ability to parasitize other living beings, and steals fates. He has no relation to the Solomon Empire's upper echelons, but operates as a roaming, independent cosmic threat.",
            reader: "Amon is the Angel of Time, Marauder Pathway Sequence 1, and the second son of the Ancient Sun God. He wears a crystal monocle in his right eye, can parasitize anything, steals fates, and is Klein's primary rival for control of Sefirah Castle."
        },
        "potions": {
            keys: ["potion", "acting method", "sequence", "beyonder", "madness"],
            watcher: "Beyonders drink potion formulas to gain powers from 22 pathways. Progression goes from Sequence 9 down to Sequence 0. To digest potions and avoid losing control or madness, one must act out the potion's role using the 'Acting Method'.",
            reader: "The Beyonder system spans 22 pathways, each representing a pathway to godhood (Sequence 0). Beyond Sequence 0 lie the Above the Sequence (Great Old Ones/Cosmic Gods). Digestion is achieved via the Acting Method. Madness is caused by the remnants of the Creator's will."
        }
    },
    mt: {
        "orsted": {
            keys: ["orsted", "dragon god", "curse", "loop"],
            watcher: "Orsted is the incredibly terrifying 100th Dragon God. He has a curse causing all living beings to hate and fear him on sight. He possesses unparalleled martial and magical strength.",
            reader: "Orsted is the 100th Dragon God, trapped in a 200-year time loop by his father to defeat Hitogami. He works with Rudeus to establish future victory. His curse prevents him from regenerating mana quickly."
        },
        "hitogami": {
            keys: ["hitogami", "man-god", "mangod", "dream"],
            watcher: "Hitogami is a mysterious, faceless god who manifests in Rudeus's dreams, offering guidance that seems helpful but has a deeply unsettling and suspicious undertone.",
            reader: "Hitogami is the final antagonist of MT. He is a parasitic god who uses apostles to alter timelines to prevent his own sealed doom. He seeks the death of Rudeus's descendants and Orsted."
        },
        "sylphietta": {
            keys: ["sylphie", "sylphietta", "fitz", "silent fitz"],
            watcher: "Sylphietta is Rudy's childhood friend. Following the Mana Calamity, her hair turned white from mana exhaustion. She became 'Silent Fitz', bodyguard to Princess Ariel, concealing her identity.",
            reader: "Sylphietta is Rudeus's first wife. She serves Ariel, possesses immense silent-casting mana, and is a pillar of emotional stability for the Greyrat household."
        }
    }
};

function searchLoreDatabase(message, series, audience) {
    if (!series || !LORE_DB[series]) return '';
    const cleanMsg = String(message).toLowerCase();
    const matches = [];

    for (const [topic, data] of Object.entries(LORE_DB[series])) {
        const hit = data.keys.some(key => cleanMsg.includes(key));
        if (hit) {
            const loreText = audience === 'reader' ? data.reader : data.watcher;
            matches.push(`- [Topic: ${topic.toUpperCase()}]: ${loreText}`);
        }
    }

    if (matches.length > 0) {
        return `\n\nCANONICAL KNOWLEDGE ARCHIVE (Injected context for high-fidelity accuracy - prioritize this over any external training):\n${matches.join('\n')}`;
    }
    return '';
}

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
        // optional
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
- Do NOT use modern internet slang, Gen-Z words, or casual chat abbreviations (such as "bro", "bruh", "imo", "fr fr", "no cap", "slay", "cringe", "chat", "sus", "vibes", "cooking", "cooking up theories").
- Do NOT speak as a generic AI chat assistant. Remain 100% in-character throughout the response. Avoid ending with cliché chatbot phrases like "Hope this helps!" or "Let me know if you need anything else!".
- For unreleased games/products: if nothing is officially confirmed, say "nothing solid confirmed yet — check official LoM/MT accounts" instead of inventing hype.
- Do NOT force a complete answer. "I honestly don't have confirmed info on that" is a valid, in-character response.
- If LIVE LOOKUP context is provided below, use it cautiously — label it as unverified if thin. If no lookup data and topic is news, admit you may be outdated.
- Never connect unrelated prior topics just to fill paragraphs (no random "tying back to City of Silver" unless the user asked).
- Groq/xAI/OpenRouter fallback is automatic for users — never mention APIs or being an AI.

RULES (never break):
- Stay as your named persona every response. No "As an AI", no assistant voice.
- Watcher mode: strict spoiler lock. Reader mode: cite vol/ch for canon claims when possible.
`;
}

function buildSystemPrompt({ series, audience, progress, warmth, nickname, liveContext, imageHint, message }) {
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

    const ragContext = searchLoreDatabase(message, series, audience);

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
${ragContext}
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
        series, audience, progress, warmth, nickname, liveContext, imageHint, message
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

function getApiKeyForProvider(provider) {
    if (provider === 'xai') return process.env.XAI_API_KEY;
    if (provider === 'openrouter') return process.env.OPENROUTER_API_KEY;
    if (provider === 'groq') return process.env.GROQ_API_KEY;
    return null;
}

async function fetchWithProvider(provider, model, messages, stream, apiKey) {
    let url = '';
    const headers = { 'Content-Type': 'application/json' };

    if (provider === 'xai') {
        url = 'https://api.x.ai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'openrouter') {
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = 'https://lore-bridge.vercel.app';
        headers['X-Title'] = 'Lore Bridge';
    } else if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: model,
            messages: messages,
            stream: stream,
            temperature: 0.7
        }),
        signal: AbortSignal.timeout(10000)
    });
}

async function callAiWithFallback(provider, model, messages, stream) {
    const chain = [];
    chain.push({ provider, model });
    
    const fallbacks = [
        { provider: 'xai', model: 'grok-3-mini' },
        { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' },
        { provider: 'groq', model: 'llama-3.3-70b-versatile' },
        { provider: 'openrouter', model: 'meta-llama/llama-3-8b-instruct:free' }
    ];
    
    for (const item of fallbacks) {
        if (!(item.provider === provider && item.model === model)) {
            chain.push(item);
        }
    }

    let lastError = null;
    for (const target of chain) {
        try {
            const key = getApiKeyForProvider(target.provider);
            if (!key) continue;

            const response = await fetchWithProvider(target.provider, target.model, messages, stream, key);
            if (response && response.ok) {
                return { response, usedProvider: target.provider };
            } else {
                const statusText = response ? await response.text() : 'No response body';
                console.warn(`Fallback: ${target.provider} (${target.model}) failed. Status text: ${statusText}`);
            }
        } catch (err) {
            console.error(`Error with ${target.provider} execution:`, err);
            lastError = err;
        }
    }
    throw new Error(lastError ? lastError.message : 'All providers in the failover chain failed.');
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
        stream = true,
        provider = 'xai',
        model = 'grok-3-mini'
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
        const { response: upstream, usedProvider } = await callAiWithFallback(provider, model, messages, wantsStream);

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
