// Client-side immersion: memory, parsing, effects (no login required)

const SESSION_KEY = 'lore-bridge-session';
const PROGRESS_KEY = 'lore-bridge-progress';

export function getSessionKey(universe, audience) {
    return `${universe}-${audience}`;
}

export function loadSession(universe, audience) {
    try {
        const all = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        return all[getSessionKey(universe, audience)] || { history: [], warmth: 0, eggs: [] };
    } catch {
        return { history: [], warmth: 0, eggs: [] };
    }
}

export function saveSession(universe, audience, session) {
    try {
        const all = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        all[getSessionKey(universe, audience)] = session;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(all));
    } catch {
        // private browsing / storage full
    }
}

export function loadProgress(universe, audience) {
    try {
        const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        return all[getSessionKey(universe, audience)] || '';
    } catch {
        return '';
    }
}

export function saveProgress(universe, audience, value) {
    try {
        const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        all[getSessionKey(universe, audience)] = value;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    } catch {
        // ignore
    }
}

export function getNickname(siteConfig, warmth) {
    const levels = siteConfig.memory?.warmthLevels || [];
    let nick = '';
    for (const lvl of levels) {
        if (warmth >= lvl.at) nick = lvl.nickname;
    }
    return nick;
}

export function trimHistory(history, maxTurns = 8) {
    return history.slice(-maxTurns * 2);
}

export function parseMetadata(raw) {
    const result = { text: raw, receipts: [], skipped: '', veil: '' };

    const veilMatch = raw.match(/⟦veil:(.+?)⟧/s);
    if (veilMatch) {
        result.veil = veilMatch[1].trim();
        result.text = raw.replace(/⟦veil:.+?⟧/s, '').trim();
    }

    const receiptsMatch = raw.match(/⟦receipts:(.+?)⟧/);
    if (receiptsMatch) {
        result.receipts = receiptsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
        result.text = result.text.replace(/⟦receipts:.+?⟧/, '').trim();
    }

    const skippedMatch = raw.match(/⟦skipped:(.+?)⟧/);
    if (skippedMatch) {
        result.skipped = skippedMatch[1].trim();
        result.text = result.text.replace(/⟦skipped:.+?⟧/, '').trim();
    }

    return result;
}

export function checkEasterEgg(message, siteConfig, universe) {
    const eggs = siteConfig[universe]?.easterEggs || [];
    const lower = message.toLowerCase().trim();
    for (const egg of eggs) {
        if (lower.includes(egg.phrase.toLowerCase())) {
            return egg;
        }
    }
    return null;
}

export function playUniverseSound(universe) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (universe === 'lom') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 1.2);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 0.8);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        }

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.3);
        setTimeout(() => ctx.close(), 1500);
    } catch {
        // audio blocked or unsupported
    }
}

export function triggerSpoilerVeil() {
    document.body.classList.add('spoiler-veil-active');
    const scrim = document.getElementById('bg-scrim');
    if (scrim) scrim.style.background = 'rgba(0, 0, 0, 0.75)';
    setTimeout(() => {
        document.body.classList.remove('spoiler-veil-active');
        if (scrim) scrim.style.background = '';
    }, 2800);
}

export function triggerEggEffect(effect) {
    if (effect === 'fog') triggerSpoilerVeil();
    if (effect === 'pulse') {
        document.body.classList.add('egg-pulse');
        setTimeout(() => document.body.classList.remove('egg-pulse'), 1200);
    }
    if (effect === 'warm') {
        const scrim = document.getElementById('bg-scrim');
        if (scrim) {
            scrim.style.filter = 'brightness(1.15)';
            setTimeout(() => { scrim.style.filter = ''; }, 1500);
        }
    }
}

export function generateTheoryCard(text, universe, siteConfig) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    const isLom = universe === 'lom';
    const bg = isLom ? '#0d0812' : '#08120a';
    const accent = isLom ? '#C5A059' : '#50C878';
    const primary = isLom ? '#8a2be2' : '#32cd32';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.strokeStyle = primary;
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 960);

    ctx.fillStyle = accent;
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(isLom ? '🃏 LORE BRIDGE' : '🗡️ LORE BRIDGE', 100, 140);

    ctx.fillStyle = '#d4c5d9';
    ctx.font = '36px Georgia, serif';

    const words = text.replace(/\s+/g, ' ').trim().slice(0, 280);
    const lines = wrapText(ctx, words, 880);
    let y = 240;
    for (const line of lines.slice(0, 14)) {
        ctx.fillText(line, 100, y);
        y += 52;
    }

    ctx.fillStyle = '#9a8c9e';
    ctx.font = '28px sans-serif';
    ctx.fillText(siteConfig.personal?.siteUrl || 'lore-bridge.vercel.app', 100, 980);

    return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

export function getMessageStyleClass(universe, audience, siteConfig) {
    const style = siteConfig[universe]?.[audience]?.messageStyle || 'default';
    return `msg-style-${style}`;
}

export function getPersonaLabel(universe, audience, siteConfig) {
    const p = siteConfig[universe]?.persona?.[audience];
    if (!p) return '';
    return `${p.icon} ${p.name} · ${p.title}`;
}