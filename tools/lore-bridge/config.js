// config.js - Your CMS - Edit this file to change content
export const siteConfig = {
  // Personal Information
  personal: {
    name: "Your Name",
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourusername",
    email: "your.email@example.com",
    
    // Payment Links
    paymentMethods: {
      buyMeACoffee: "https://www.buymeacoffee.com/yourusername",
      kofi: "https://ko-fi.com/yourusername",
      paypal: "https://paypal.me/yourusername",
      patreon: "https://patreon.com/yourusername"
    }
  },

  // Lord of the Mysteries Content
  lom: {
    oracleName: "The Gray Fog Oracle",
    oracleIcon: "👁️",
    
    // Different messages for Watcher vs Reader
    watcher: {
      welcomeMessage: "Welcome, seeker. The gray fog swirls with your questions. What lore shall we unravel today without spoiling your journey?",
      modeStatus: "Mode: LoM Watcher • Locked to end of Vol 1 • No Spoilers",
      oracleStatus: "Spoiler-free • Up to current anime",
      inputPlaceholder: "Consult the Oracle (Anime-safe)...",
      suggestions: [
        "Who is The Fool?",
        "Explain the Pathways",
        "Mystery of the Gray Fog",
        "What are Sequences?",
        "Tell me about the Tarot Club"
      ]
    },
    
    reader: {
      welcomeMessage: "Welcome, fellow scholar of the mysteries. The gray fog reveals deeper truths to those who seek beyond the veil. What knowledge shall we discuss?",
      modeStatus: "Mode: LoM Reader • Full Lore Access • Spoilers Allowed",
      oracleStatus: "Full Lore Access • Novel Reader Mode",
      inputPlaceholder: "Consult the Oracle (Full Lore)...",
      suggestions: [
        "Explain the Ancient Sun God",
        "What really happened to the Rosago?",
        "Discuss the True Creator",
        "Klein's identity theories",
        "The Hornacis Mountain Range"
      ]
    },
    
    diegeticText: {
      buttonIcon: "🃏",
      buttonText: "Offer a Sacrifice to The Fool",
      modalTitle: "Support the Bridge",
      modalDescription: "Your offering strengthens the veil between worlds. All sacrifices help maintain this connection to the gray fog."
    },
    
    // Images (place these in /public/images/)
    images: {
      logo: "/images/lom-logo.png",
      background: "/images/lom-bg.jpg",
      oracleAvatar: "/images/lom-oracle.png"
    }
  },

  // Mushoku Tensei Content
  mt: {
    oracleName: "Guild Receptionist",
    oracleIcon: "📜",
    
    // Different messages for Watcher vs Reader
    watcher: {
      welcomeMessage: "Welcome to the Adventurer's Guild! I'm here to help you understand the world of Mushoku Tensei without spoiling future adventures. What would you like to know?",
      modeStatus: "Mode: MT Watcher • Locked to end of Season 2 • No Spoilers",
      oracleStatus: "Spoiler-free • Anime Viewer Mode",
      inputPlaceholder: "Ask the Guild (Anime-safe)...",
      suggestions: [
        "How does Magic Work?",
        "Rudeus's Power Level",
        "The Teleportation Incident",
        "Explain the Demon Tongue",
        "What are the Superd?"
      ]
    },
    
    reader: {
      welcomeMessage: "Welcome, seasoned adventurer! You've journeyed far through Rudeus's tale. What deeper lore or future events shall we discuss?",
      modeStatus: "Mode: MT Reader • Full LN Access • Spoilers Allowed",
      oracleStatus: "Full Lore Access • Light Novel Reader Mode",
      inputPlaceholder: "Ask the Guild (Full Lore)...",
      suggestions: [
        "Discuss the Laplace Factor",
        "What happens after Season 2?",
        "Explain the Man-God's plans",
        "Orsted's true role",
        "The Fittoa Region's fate"
      ]
    },
    
    diegeticText: {
      buttonIcon: "🧪",
      buttonText: "Purchase a Healing Potion from the Guild",
      modalTitle: "Guild Donation Box",
      modalDescription: "Your donation helps maintain the Guild's knowledge archives. All contributions ensure the bridge between worlds remains strong."
    },
    
    // Images (place these in /public/images/)
    images: {
      logo: "/images/mt-logo.png",
      background: "/images/mt-bg.jpg",
      oracleAvatar: "/images/mt-oracle.png"
    }
  },

  // About Page Content
  about: {
    title: "About Lore Bridge",
    description: "Lore Bridge is an AI-powered companion for fans of Lord of the Mysteries and Mushoku Tensei. It provides spoiler-free lore explanations tailored to whether you're an anime watcher or novel reader.",
    features: [
      "🎭 Spoiler-Free Mode: Safe for anime-only viewers",
      "📚 Full Lore Mode: Deep dive for novel readers",
      "🤖 AI-Powered: Powered by Grok for accurate lore",
      "🌉 Two Universes: Switch between LoM and MT instantly",
      "💬 Smart Suggestions: Get answers to common questions"
    ],
    techStack: [
      "Built with Next.js",
      "Hosted on Vercel",
      "AI by xAI Grok",
      "Styled with pure CSS"
    ]
  }
};
