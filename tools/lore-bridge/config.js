// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  LORE BRIDGE CMS — EDIT EVERYTHING HERE (no AI needed for most changes)   ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║  QUICK REFERENCE                                                         ║
// ║  • Text, personas, suggestions     → edit sections below, save, git push ║
// ║  • Background images               → see assets.images + HOW TO below     ║
// ║  • Share tweet / hashtags          → share { ... }                      ║
// ║  • Easter eggs                     → lom.easterEggs / mt.easterEggs       ║
// ║                                                                          ║
// ║  HOW TO UPDATE BACKGROUND IMAGES                                       ║
// ║  1. Replace JPG files in: tools/lore-bridge/public/images/              ║
// ║     - lom-bg.jpg  (Lord of the Mysteries)                              ║
// ║     - mt-bg.jpg   (Mushoku Tensei)                                     ║
// ║  2. Bump assets.imageVersion below (e.g. 2 → 3)                          ║
// ║  3. In terminal:                                                         ║
// ║     cd /home/thierry/grok-anime-lab                                    ║
// ║     git add tools/lore-bridge/public/images/ tools/lore-bridge/config.js║
// ║     git commit -m "update backgrounds"                                   ║
// ║     git push origin main                                                 ║
// ║  4. Wait ~1 min for Vercel, hard-refresh on phone                        ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/** Bump this number whenever you change any image file (clears CDN cache). */
const IMAGE_VERSION = 3;

function imagePath(filename) {
  return `/public/images/${filename}?v=${IMAGE_VERSION}`;
}

export const siteConfig = {

  // ─── Site-wide UI labels (edit freely) ───────────────────────────────────
  ui: {
    appTitle: "Lore Bridge",
    progressLabel: "Your progress",
    progressPlaceholder: "— Tap to set —",
    shareHint: "💡 Tap Download or Share on any oracle reply",
    inputPlaceholderDefault: "Ask the Oracle...",
    sendButton: "Send",
    menuFooter: "Built with @grok · Edit config.js on GitHub"
  },

  // ─── Images (change filename OR replace file in public/images/) ───────────
  assets: {
    imageVersion: IMAGE_VERSION,
    images: {
      lom: "lom-bg.jpg",
      mt: "mt-bg.jpg"
    }
  },

  personal: {
    name: "agenticweeb",
    siteUrl: "https://lore-bridge.vercel.app",
    github: "https://github.com/agenticweeb/grok-anime-lab",
    configEditUrl: "https://github.com/agenticweeb/grok-anime-lab/edit/main/tools/lore-bridge/config.js",
    twitter: "https://x.com/agenticweeb",
    paymentMethods: {
      buyMeACoffee: "https://github.com/agenticweeb/grok-anime-lab",
      kofi: "",
      paypal: ""
    }
  },

  memory: {
    maxHistoryTurns: 8,
    warmthPerMessage: 1,
    warmthLevels: [
      { at: 0, nickname: "" },
      { at: 3, nickname: "seeker" },
      { at: 6, nickname: "familiar" },
      { at: 10, nickname: "kindred" }
    ]
  },

  lom: {
    backgroundImage: imagePath("lom-bg.jpg"),
    persona: {
      watcher: { name: "Daly", title: "Nighthawk Regular", icon: "🃏" },
      reader: { name: "The Archivist", title: "Tarot Club Scholar", icon: "🔮" }
    },
    progressOptions: {
      watcher: [
        "Anime Ep 1-3",
        "Anime Ep 4-6",
        "Anime Ep 7-9",
        "Anime Ep 10-12",
        "Finished Season 1",
        "Finished S1 + Specials"
      ],
      reader: ["Volume 1", "Volume 2", "Volume 3", "Volume 4+"]
    },
    watcher: {
      welcomeMessage: "Hey — I'm Daly. I haunt the Nighthawk like it's my job (it basically is). Ask me about watch order, Beyonders, or what the anime skipped. I won't spoil past what you've seen. 🃏",
      modeStatus: "🌫️ LoM Watcher • Spoiler Veil Active",
      inputPlaceholder: "e.g., Why did Klein do the tarot trick?",
      messageStyle: "nighthawk",
      suggestions: [
        "Explain the Beyonder system simply",
        "Why is the watch order confusing?",
        "Who is The Fool?"
      ]
    },
    reader: {
      welcomeMessage: "Greetings, fellow scholar. The Archivist here — I've indexed every foreshadowing thread in the texts. Let's theory-craft. 🔮",
      modeStatus: "📖 LoM Reader • Full Archive Access",
      inputPlaceholder: "e.g., Analyze Klein's acting method in Vol 1...",
      messageStyle: "tarot",
      suggestions: [
        "Theorycraft: City of Silver's true purpose",
        "Foreshadowing in Vol 1",
        "Analyze the Tarot Club dynamics"
      ]
    },
    diegeticText: {
      buttonIcon: "🃏",
      buttonText: "Offer a Sacrifice to The Fool",
      modalTitle: "Strengthen the Veil",
      modalDescription: "Your offering fuels the gray fog and keeps the Lore Bridge standing."
    },
    menuHeader: "The Gray Fog",
    supportLinkText: "Offer a Sacrifice",
    easterEggs: [
      { phrase: "amen", response: "Amen. 🌫️ The fog recognizes a fellow believer. Ask your question, seeker.", effect: "fog" },
      { phrase: "above the fog", response: "You speak like someone who's read the later volumes... or like someone who's about to. Careful. 🔮", effect: "fog" },
      { phrase: "klein moretti", response: "You said the name. The coins feel heavier. Let's talk. 🃏", effect: "pulse" }
    ]
  },

  mt: {
    backgroundImage: imagePath("mt-bg.jpg"),
    persona: {
      watcher: { name: "Rui", title: "Guild Counter Clerk", icon: "🗡️" },
      reader: { name: "Elinalise", title: "Veteran Adventurer", icon: "🐉" }
    },
    progressOptions: {
      watcher: [
        "Season 1 only",
        "Season 2 Ep 1-6",
        "Season 2 Ep 7-12",
        "Finished Season 2",
        "Preparing for Season 3"
      ],
      reader: ["Volume 1-3", "Volume 4-7", "Volume 8-12", "Volume 13+"]
    },
    watcher: {
      welcomeMessage: "Yo! Rui at the guild counter. S2 hype is REAL. Ask what got skipped, magic basics, whatever — zero S3 spoilers. 🗡️",
      modeStatus: "🌿 MT Watcher • Pre-S3 • No Spoilers",
      inputPlaceholder: "e.g., What did S2 skip about Sylphie?",
      messageStyle: "guild",
      suggestions: [
        "What did S2 skip about Sylphie?",
        "Explain the Superd tribe stigma",
        "Magic system basics for S3"
      ]
    },
    reader: {
      welcomeMessage: "Welcome back. Elinalise here — I've survived enough arcs to know where the bodies are buried. Let's dive deep. 🐉",
      modeStatus: "📖 MT Reader • Full Lore Access",
      inputPlaceholder: "e.g., Discuss Rudeus's psychological growth...",
      messageStyle: "journal",
      suggestions: [
        "Rudeus's psychological growth",
        "Laplace factor in S3",
        "Orsted's true motives"
      ]
    },
    diegeticText: {
      buttonIcon: "🧪",
      buttonText: "Purchase a Healing Potion from the Guild",
      modalTitle: "Replenish the Wellspring",
      modalDescription: "Donate Guild Marks to keep the lore flowing."
    },
    menuHeader: "The Adventurer's Guild",
    supportLinkText: "Buy a Potion",
    easterEggs: [
      { phrase: "muru muru", response: "Muru Muru! Roxy-sensei would be proud you're studying. ✨", effect: "warm" },
      { phrase: "sylphietta", response: "Ah, a person of culture. Let's talk — respectfully, no fan wars. 💚", effect: "warm" },
      { phrase: "fit to be tied", response: "You know your memes. The guild approves. 🗡️", effect: "pulse" }
    ]
  },

  share: {
    siteUrl: "https://lore-bridge.vercel.app",
    appTweet: "This AI lore companion morphs between LoM & Mushoku Tensei — and literally refuses to spoil you if you're anime-only.",
    hashtags: "#MushokuTensei #LordOfTheMysteries #AnimeAI",
    cardMaxChars: 320
  },

  about: {
    title: "About Lore Bridge",
    description: "An open-source, AI-powered lore companion built for anime-onlys and novel readers. No spoilers, just pure context.",
    features: [
      "Spoiler-free AI chat tailored to your progress",
      "Remembers your session — no login needed",
      "Instantly switches between massive fictional universes",
      "Built live with Grok AI"
    ],
    techStack: [
      "Frontend: HTML / Vanilla JS",
      "AI: xAI Grok + Groq fallback",
      "Hosting: Vercel"
    ],
    editNote: "Want to change text, images, or suggestions? Edit config.js on GitHub — link in the side menu."
  }
};