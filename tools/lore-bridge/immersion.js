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

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Background image failed to load'));
        img.src = src.split('?')[0];
    });
}

function getTheme(universe) {
    const isLom = universe === 'lom';
    return {
        isLom,
        accent: isLom ? '#C5A059' : '#50C878',
        primary: isLom ? '#8a2be2' : '#32cd32',
        fallback: isLom ? '#0d0812' : '#08120a',
        label: isLom ? 'Lord of the Mysteries' : 'Mushoku Tensei',
        icon: isLom ? '🃏' : '🗡️',
        font: isLom ? 'Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif'
    };
}

export async function generateShareCard({ text, universe, audience, siteConfig }) {
    const W = 1200;
    const H = 675;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const theme = getTheme(universe);
    const persona = siteConfig[universe]?.persona?.[audience];
    const bgPath = siteConfig[universe]?.backgroundImage || '';
    const maxChars = siteConfig.share?.cardMaxChars || 320;
    const quote = text.replace(/\s+/g, ' ').trim().slice(0, maxChars);

    ctx.fillStyle = theme.fallback;
    ctx.fillRect(0, 0, W, H);

    if (bgPath) {
        try {
            const img = await loadImage(bgPath);
            const scale = Math.max(W / img.width, H / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
        } catch {
            // solid fallback already drawn
        }
    }

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0.72)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0.82)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    ctx.fillStyle = theme.accent;
    ctx.font = `bold 34px ${theme.font}`;
    ctx.fillText(`${theme.icon} LORE BRIDGE`, 64, 88);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '22px sans-serif';
    const modeLabel = audience === 'reader' ? '📖 Reader Mode' : '👁️ Watcher · No Spoilers';
    ctx.fillText(`${theme.label} · ${modeLabel}`, 64, 124);

    if (persona) {
        ctx.fillStyle = theme.primary;
        ctx.font = `italic 20px ${theme.font}`;
        ctx.fillText(`${persona.icon} ${persona.name}`, 64, 158);
    }

    ctx.fillStyle = '#f2eef5';
    ctx.font = `32px ${theme.font}`;
    const lines = wrapText(ctx, `"${quote}"`, W - 128);
    let y = 220;
    for (const line of lines.slice(0, 9)) {
        ctx.fillText(line, 64, y);
        y += 44;
    }

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Ask the oracle →', 64, H - 72);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '20px sans-serif';
    const url = siteConfig.share?.siteUrl || siteConfig.personal?.siteUrl || 'lore-bridge.vercel.app';
    ctx.fillText(url.replace('https://', ''), 64, H - 40);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
    });
}

export function downloadBlob(blob, filename = 'lore-bridge-share.png') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function buildXIntentUrl({ text, url, hashtags }) {
    const params = new URLSearchParams();
    params.set('text', text);
    if (url) params.set('url', url);
    if (hashtags) params.set('hashtags', hashtags.replace(/#/g, '').replace(/\s+/g, ','));
    return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export async function shareOracleTake({ text, universe, audience, siteConfig }) {
    const blob = await generateShareCard({ text, universe, audience, siteConfig });
    const siteUrl = siteConfig.share?.siteUrl || siteConfig.personal?.siteUrl || '';
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 100);
    const tweetText = `${snippet}…\n\n${siteConfig.share?.appTweet || 'Lore Bridge — spoiler-safe AI lore chat'}`;

    const file = new File([blob], 'lore-bridge.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({
                text: tweetText,
                url: siteUrl,
                files: [file]
            });
            return { method: 'native' };
        } catch (err) {
            if (err.name === 'AbortError') return { method: 'cancelled' };
        }
    }

    downloadBlob(blob);
    const tags = (siteConfig.share?.hashtags || '').replace(/#/g, '').trim();
    window.open(buildXIntentUrl({ text: tweetText, url: siteUrl, hashtags: tags }), '_blank', 'noopener');
    return { method: 'download+intent' };
}

/** @deprecated use generateShareCard */
export function generateTheoryCard(text, universe, siteConfig) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    const theme = getTheme(universe);
    ctx.fillStyle = theme.fallback;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 48px ${theme.font}`;
    ctx.fillText(`${theme.icon} LORE BRIDGE`, 100, 140);
    ctx.fillStyle = '#d4c5d9';
    ctx.font = `36px ${theme.font}`;
    const lines = wrapText(ctx, text.replace(/\s+/g, ' ').trim().slice(0, 280), 880);
    let y = 240;
    for (const line of lines.slice(0, 14)) {
        ctx.fillText(line, 100, y);
        y += 52;
    }
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