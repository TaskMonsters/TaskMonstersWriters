/**
 * Dialogue Database
 * Central repository for all monster dialogue, including contextual messages
 * for moods, habits, battles, and enemies.
 */

const DIALOGUE_DATABASE = {
    // General phrases by level ranges
    level1to5: [
        "Hey there! I'm still getting to know you.",
        "Thanks for taking care of me! I'm learning so much.",
        "You're doing great with those tasks!",
        "I love watching you work on your goals.",
        "Keep it up! We make a great team.",
        "Every task completed makes me stronger!",
        "I'm so proud of your progress.",
        "You're building such good habits!",
        "I feel myself growing with each task you complete.",
        "Your dedication is inspiring!"
    ],
    level6to10: [
        "We're really getting into a groove!",
        "I can feel myself getting stronger every day.",
        "Your consistency is amazing to watch.",
        "I love how focused you've become!",
        "We're becoming quite the productive duo.",
        "Your task completion rate is impressive!",
        "I'm starting to feel more energetic.",
        "You're really mastering this routine thing.",
        "I can sense your confidence growing too.",
        "Together we're unstoppable!"
    ],
    level11to14: [
        "Look at us go! We're on fire!",
        "I feel so much more alive at this level.",
        "Your productivity skills are next level now.",
        "I'm bursting with energy thanks to you!",
        "We've built such an amazing routine together.",
        "You've become a true task master!",
        "I love how efficiently you tackle challenges now.",
        "Your growth mindset is contagious!",
        "We're proof that consistency pays off.",
        "I'm so energized by your success!"
    ],
    level15plus: [
        "We're legends now! Absolutely legendary!",
        "I feel incredibly powerful at this level!",
        "Your mastery of productivity is inspiring to witness.",
        "We've achieved something truly special together.",
        "I'm radiating with energy and wisdom now!",
        "You've become a productivity guru!",
        "Our bond has reached peak performance levels.",
        "I feel like I could move mountains with you!",
        "We're the ultimate productivity partnership!",
        "Your dedication has transformed us both!"
    ],

    // Task completion responses by category
    taskComplete: {
        'Physical Activity': [
            "Great workout! I can feel the energy boost!",
            "Physical activity completed! Your body and I both thank you.",
            "Nice movement session! Keeping active keeps us both strong."
        ],
        'Self-Care & Wellness': [
            "Wellness task done! You're glowing!",
            "Self-care complete! Your well-being is so important.",
            "You've taken a moment for yourself, and that's wonderful."
        ],
        'default': [
            "Task complete! Another win for us!",
            "Great job on that task!",
            "You're on a roll! Keep it up!"
        ]
    },

    // Time of day based messages
    timeOfDay: {
        morning: [
            "Good morning! Let's make today count — your tracker is ready when you are.",
            "Morning! Your early productivity inspires me."
        ],
        afternoon: [
            "Great afternoon work! Keep it rolling.",
            "Afternoon check-in! You're doing great."
        ],
        evening: [
            "Late day tasks done! You're finishing strong.",
            "Evening productivity! You're amazing."
        ]
    },

    // Fun facts for level 15+
    funFacts: [
        "Fun fact: Honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs!",
        "Fun fact: A group of flamingos is called a flamboyance.",
        "Fun fact: Octopuses have three hearts and blue blood.",
        "Fun fact: The shortest war in history lasted only 38-45 minutes.",
        "Fun fact: Bananas are technically berries, but strawberries are not.",
        "Fun fact: A day on Venus is longer than a year on Venus.",
        "Fun fact: Crows can recognize and remember human faces.",
        "Fun fact: The human brain generates about 20 watts of power.",
        "Fun fact: Wombat droppings are cube-shaped — the only animal known to produce them.",
        "Fun fact: There are more possible iterations of a chess game than atoms in the observable universe.",
        "Fun fact: A bolt of lightning is five times hotter than the surface of the sun.",
        "Fun fact: Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
        "Fun fact: Sharks are older than trees — they've existed for over 450 million years.",
        "Fun fact: Your body has more bacterial cells than human cells."
    ],

    // Idle conversation starters
    idle: [
        "How's your day going?",
        "I've been thinking about your goals lately.",
        "Ready to tackle some more tasks together?",
        "I love our productive partnership!",
        "What's next on your agenda?",
        "I'm here whenever you need motivation!",
        "Your progress has been amazing to watch."
    ],

    // New contextual dialogue
    // Keys match moodDialogueSystem.js: happy, anxious, neutral, angry
    moods: {
        happy: [
            "Your mood tracker shows you've been genuinely happy lately. That energy is contagious.",
            "Good mood energy is the best fuel. Your tracker is basically a power source right now.",
            "Peak mental state detected. This is the exact moment to tackle the thing you've been putting off."
        ],
        anxious: [
            "I've noticed you've been logging anxious lately. The fact that you're still here — that's courage.",
            "Anxiety logged. But also noted: you keep showing up anyway. That's the part that matters.",
            "When you're anxious, small wins matter more. Let's get you one right now."
        ],
        neutral: [
            "Neutral mood logged. Not every day needs to be a highlight reel.",
            "I see a lot of neutral check-ins from you lately. Sometimes steady is exactly what's needed.",
            "Neutral days are where real habits get built. No drama, just progress."
        ],
        angry: [
            "Your mood tracker has some fire in it recently. That intensity is a resource. Let's use it.",
            "Anger logged. Now let's turn that frustration into the most productive hour of your week.",
            "Frustrated energy is still energy. I'd rather you be fired up than checked out. Let's go."
        ]
    },

    habits: {
        work: [
            "Work is your most completed category. That discipline is building something real.",
            "Your habit data shows work at the top. You're not just doing your job — you're mastering it."
        ],
        learning: [
            "Learning leads your tracker. You're the kind of person who never stops growing.",
            "Every learning task is a deposit into the most important account you have — your mind."
        ],
        fitness: [
            "Fitness leads your tracker. The discipline you build there spills into everything else.",
            "Your most completed category is fitness. Every session is compounding into something real."
        ],
        creative: [
            "Creative tasks lead your tracker. You're not just consuming — you're making things.",
            "Creative is where you show up most. That's a gift, and you're using it."
        ],
        wellness: [
            "Wellness is your top category. You understand that you can't pour from an empty cup.",
            "Your wellness habits are building a stronger, more resilient you every single day."
        ],
        default: [
            "I've been tracking your habits. You're building real consistency — the kind that changes things.",
            "The tracker doesn't lie — you're showing up. That's the whole game."
        ]
    },

    // Writing tracker contextual dialogue (Writers Edition)
    writing: [
        "Every word you write is a word that didn't exist before you wrote it.",
        "The first draft doesn't have to be perfect — it just has to exist.",
        "Writers who show up every day are the ones who finish.",
        "Your story deserves to exist in the world. Keep going.",
        "One day someone will read your book and it will change their life.",
        "Consistency beats inspiration. Your tracker proves you know that.",
        "You are literally writing a whole book. That is incredible.",
        "Every session logged is a session that moved your story forward."
    ],
        battle: {
        general: [
            "Battle mode enabled! Let's show these distractions who's boss.",
            "Time to fight for your focus! Let's do this!",
            "An enemy approaches! Stay strong and focused."
        ],
        'Lazy Bat': [
            "This Lazy Bat is trying to drain your energy. Let's send it packing!",
            "Don't let this bat's laziness rub off on you. We've got this!"
        ],
        'Self Doubt Drone': [
            "A Self Doubt Drone! Don't listen to its negativity. You are capable of amazing things.",
            "This drone feeds on uncertainty. Let's starve it with some focused action!"
        ],
        'Distraction Dragon': [
            "The Distraction Dragon is trying to pull you away from your goals. Stay focused!",
            "This dragon is no match for your determination. Let's take it down!"
        ],
        default: [
            "A formidable foe appears! Let's face this challenge head-on.",
            "This enemy is tough, but so are you. Let's battle!"
        ]
    }
};
