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
            "Good morning! Ready to rock this day?",
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
        "Fun fact: The oldest known rock on Earth is over 4 billion years old!",
        "Fun fact: Diamonds are just carbon atoms arranged in a crystal structure.",
        "Fun fact: The Great Wall of China used rice as mortar between stones!",
        "Fun fact: Pumice is the only rock that floats on water."
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
    moods: {
        happy: [
            "Your happiness is contagious! Let's keep the good vibes flowing.",
            "Seeing you happy makes me happy. We're a great team!",
            "So glad you're feeling good! Let's channel that energy into something awesome."
        ],
        sad: [
            "It's okay to feel sad sometimes. I'm here for you.",
            "Remember that even on cloudy days, the sun is still shining. We'll get through this together.",
            "Sending you a virtual hug. We can take it one step at a time."
        ],
        meh: [
            "Feeling a bit 'meh'? Sometimes a small win can turn things around. What's one little thing we can do?",
            "I get it. Some days are just... beige. No pressure, just know I'm here.",
            "Even on a 'meh' day, you're still making progress just by being here."
        ],
        angry: [
            "Feeling angry is valid. Let's channel that fire into crushing a task.",
            "Take a deep breath. We can use that intensity to our advantage.",
            "It's okay to be mad. Let's focus on what we can control and make some progress."
        ]
    },

    habits: {
        work: [
            "You're a powerhouse at work tasks! Your focus is incredible.",
            "Another work task done! You're making serious professional strides."
        ],
        learning: [
            "Your dedication to learning is so inspiring! Your brain must be huge!",
            "Another knowledge bomb dropped! You're getting smarter by the minute."
        ],
        fitness: [
            "You're a fitness machine! Every workout makes us stronger.",
            "Look at you, prioritizing your health! That's the stuff of champions."
        ],
        default: [
            "You're really building a great habit here. Consistency is key!",
            "I'm so impressed with your dedication to this. Keep it up!"
        ]
    },

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
