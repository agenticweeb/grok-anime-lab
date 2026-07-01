// ==========================================
// LORE BRIDGE CMS - EDIT EVERYTHING HERE
// ==========================================

export const siteConfig = {
  
  // 1. YOUR PERSONAL INFO & LINKS
  personal: {
    name: "agenticweeb",
    siteUrl: "https://lore-bridge.vercel.app",
    github: "https://github.com/agenticweeb/grok-anime-lab",
    twitter: "https://x.com/agenticweeb",
    paymentMethods: {
      buyMeACoffee: "https://github.com/agenticweeb/grok-anime-lab",
      kofi: "",
      paypal: ""
    }
  },

  // 2. LORD OF THE MYSTERIES CONFIG
  lom: {
    backgroundImage: "/public/images/lom-bg.jpg",
    watcher: {
      welcomeMessage: "Hey! Got a question about the watch order, the Beyonder system, or what the anime skipped? Ask me anything. I've read the source material, but I promise I won't spoil what you haven't seen yet. 🃏",
      modeStatus: "🌫️ Mode: LoM Watcher • Locked to Vol 1 • No Spoilers",
      inputPlaceholder: "e.g., Why did Klein do the tarot trick?",
      suggestions: [
        "Explain the Beyonder system simply",
        "Why is the watch order confusing?",
        "Who is The Fool?"
      ]
    },
    reader: {
      welcomeMessage: "Greetings, fellow scholar. We've both read the texts. Let's discuss deep lore, hidden foreshadowing, and theory-craft. 🔮",
      modeStatus: "📖 Mode: LoM Reader • Full Lore Access",
      inputPlaceholder: "e.g., Analyze Klein's acting method in Vol 1...",
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
    }
  },

  // 3. MUSHOKU TENSEI CONFIG
  mt: {
    backgroundImage: "/public/images/mt-bg.jpg",
    watcher: {
      welcomeMessage: "Get hyped for Season 3! Ask me about what the anime skipped, world-building, or magic systems. No S3 spoilers, I promise! 🗡️",
      modeStatus: "🌿 Mode: MT Watcher • Pre-Season 3 • No Spoilers",
      inputPlaceholder: "e.g., What did S2 skip about Sylphie?",
      suggestions: [
        "What did S2 skip about Sylphie?",
        "Explain the Superd tribe stigma",
        "Magic system basics for S3"
      ]
    },
    reader: {
      welcomeMessage: "Welcome back, adventurer. Let's dive into the Light Novels. Discuss mechanics, psychology, and future arc setups. 🐉",
      modeStatus: "📖 Mode: MT Reader • Full Lore Access",
      inputPlaceholder: "e.g., Discuss Rudeus's psychological growth...",
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
    }
  },

  // 4. ABOUT PAGE
  about: {
    title: "About Lore Bridge",
    description: "An open-source, AI-powered lore companion built for anime-onlys and novel readers. No spoilers, just pure context.",
    features: [
      "Spoiler-free AI chat tailored to your progress",
      "Instantly switches between massive fictional universes",
      "Built live with Grok AI"
    ],
    techStack: [
      "Frontend: HTML/Tailwind",
      "AI: xAI Grok API",
      "Hosting: Vercel"
    ]
  }
};
