/**
 * Mood Tracker System - Tooltip Style
 * Displays a speech bubble tooltip for users to track their mood with emoji buttons
 * Appears every 30 minutes and can be triggered by tapping the monster
 * Saves mood history to localStorage and displays on Habits page with filters
 */

class MoodTracker {
    constructor() {
        this.moods = [
            { emoji: '😊', name: 'Happy', value: 'happy' },
            { emoji: '😢', name: 'Sad', value: 'sad' },
            { emoji: '🫤', name: 'Meh', value: 'meh' },
            { emoji: '😡', name: 'Angry', value: 'angry' }
        ];
        
        this.autoPopupInterval = 60 * 60 * 1000; // 1 hour (60 minutes)
        this.lastPopupTime = null;
        this.intervalId = null;
        this.initialPopupShown = false;
        
        this.init();
    }
    
    init() {
        console.log('[MoodTracker] Initializing...');
        
        // Create tooltip HTML
        this.createTooltip();
        
        // Add monster click listener
        this.addMonsterClickListener();
        
        // Load last popup time from localStorage
        const saved = localStorage.getItem('moodTrackerLastPopup');
        if (saved) {
            this.lastPopupTime = parseInt(saved);
        }
        
        // Show mood tracker on page load after modals (wait 3 seconds for modals to complete)
        setTimeout(() => {
            this.showInitialMoodTracker();
        }, 3000);
        
        // Start hourly auto-popup timer
        this.startAutoPopup();
        
        console.log('[MoodTracker] Initialized successfully');
    }
    
    createTooltip() {
        // Check if tooltip already exists
        if (document.getElementById('moodTrackerTooltip')) {
            console.log('[MoodTracker] Tooltip already exists');
            return;
        }
        
        const tooltipHTML = `
            <div id="moodTrackerTooltip" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) scale(0.75);
                margin-bottom: 5px;
                background-color: #2a2a3e;
                border: 3px solid #8b5cf6;
                border-radius: 25px;
                padding: 20px 24px;
                max-width: 360px;
                min-width: 280px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                opacity: 0;
                display: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                transform-origin: top center;
                z-index: 10000;
                word-wrap: break-word;
                overflow-wrap: break-word;
            ">

                
                <!-- Close Button -->
                <button id="moodTrackerCloseBtn" style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    transition: color 0.2s;
                " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ccc'">×</button>
                
                <!-- Title -->
                <h3 style="
                    color: #ffffff;
                    text-align: center;
                    margin: 0 0 15px 0;
                    font-size: 18px;
                    font-weight: 600;
                ">How are you feeling?</h3>
                
                <!-- Emoji Buttons -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                ">
                    ${this.moods.map(mood => `
                        <button class="mood-btn-tooltip" data-mood="${mood.value}" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: 2px solid rgba(139, 92, 246, 0.3);
                            border-radius: 12px;
                            padding: 12px 8px;
                            font-size: 32px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 4px;
                        " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.borderColor='#8b5cf6'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(139, 92, 246, 0.3)'; this.style.transform='scale(1)'">
                            <span>${mood.emoji}</span>
                            <span style="font-size: 10px; color: #ccc;">${mood.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Optional Note -->
                <textarea id="moodNoteTooltip" placeholder="Add a note (optional)..." style="
                    width: 100%;
                    min-height: 60px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    padding: 10px;
                    color: #ffffff;
                    font-size: 13px;
                    resize: vertical;
                    font-family: inherit;
                    box-sizing: border-box;
                "></textarea>
            </div>
        `;
        
        // Find monster container and append tooltip
        const monsterContainer = document.querySelector('.monster-container');
        if (monsterContainer) {
            monsterContainer.insertAdjacentHTML('beforeend', tooltipHTML);
            
            // Add event listeners
            document.getElementById('moodTrackerCloseBtn').addEventListener('click', () => this.hideTooltip());
            
            // Add mood button listeners
            document.querySelectorAll('.mood-btn-tooltip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mood = e.currentTarget.dataset.mood;
                    this.saveMood(mood);
                });
            });
            
            console.log('[MoodTracker] Tooltip created and attached to monster container');
        } else {
            console.warn('[MoodTracker] Monster container not found, retrying in 1s');
            setTimeout(() => this.createTooltip(), 1000);
        }
    }
    
    showTooltip() {
        console.log('[MoodTracker] Showing tooltip');
        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.display = 'block';
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) scale(0.75)';
            }, 10);
            
            // Clear previous note
            const noteField = document.getElementById('moodNoteTooltip');
            if (noteField) {
                noteField.value = '';
            }
            
            // Update last popup time
            this.lastPopupTime = Date.now();
            localStorage.setItem('moodTrackerLastPopup', this.lastPopupTime.toString());
        }
    }
    
    hideTooltip() {
        console.log('[MoodTracker] Hiding tooltip');
        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateX(-50%) scale(0.7)';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 300);
        }
    }
    
    saveMood(moodValue) {
        console.log('[MoodTracker] Saving mood:', moodValue);
        
        const note = document.getElementById('moodNoteTooltip')?.value || '';
        const moodData = this.moods.find(m => m.value === moodValue);
        
        const entry = {
            mood: moodValue,
            emoji: moodData.emoji,
            name: moodData.name,
            note: note,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        // Get existing moods
        const moods = this.getMoodHistory();
        moods.unshift(entry); // Add to beginning
        
        // Keep only last 100 entries
        if (moods.length > 100) {
            moods.length = 100;
        }
        
        // Save to localStorage
        localStorage.setItem('moodHistory', JSON.stringify(moods));
        
        // Hide tooltip
        this.hideTooltip();
        
        // Trigger mood history update on Habits page
        if (typeof window.updateMoodHistoryDisplay === 'function') {
            window.updateMoodHistoryDisplay();
        }
        
        // Play monster animation based on mood
        this.playMoodAnimation(moodValue);
        
        // Show confirmation message
        this.showConfirmation(moodData.emoji, moodData.name);
        
        console.log('[MoodTracker] Mood saved successfully');
    }
    
    showConfirmation(emoji, name) {
        // Show a brief confirmation message
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(167, 139, 250, 0.95) 100%);
            color: #fff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 15px;
            z-index: 10001;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: slideDown 0.3s ease-out;
            font-weight: 500;
        `;
        confirmation.textContent = `${emoji} Mood tracked: ${name}`;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => confirmation.remove(), 300);
        }, 2000);
    }
    
    getMoodHistory() {
        const saved = localStorage.getItem('moodHistory');
        return saved ? JSON.parse(saved) : [];
    }
    
    addMonsterClickListener() {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            mainHeroSprite.style.cursor = 'pointer';
            mainHeroSprite.addEventListener('click', () => {
                console.log('[MoodTracker] Monster clicked, showing tooltip');
                this.showTooltip();
            });
            console.log('[MoodTracker] Monster click listener attached');
        } else {
            console.warn('[MoodTracker] mainHeroSprite not found, retrying in 1 second');
            setTimeout(() => this.addMonsterClickListener(), 1000);
        }
    }
    
    showInitialMoodTracker() {
        // Check if onboarding is complete
        const onboardingComplete = localStorage.getItem('simpleOnboardingCompleted') === 'true' || 
                                   localStorage.getItem('onboardingCompleted') === 'true' ||
                                   localStorage.getItem('onboardingComplete') === 'true';
        
        if (!onboardingComplete) {
            console.log('[MoodTracker] Skipping initial popup - onboarding not complete');
            // Retry after onboarding might complete
            setTimeout(() => this.showInitialMoodTracker(), 2000);
            return;
        }
        
        // Check if user is on home page (not in battle or other modals)
        const isBattleActive = document.getElementById('battleContainer')?.style.display !== 'none';
        const isModalOpen = document.querySelector('.modal-overlay:not([style*="display: none"])');
        
        if (isBattleActive || isModalOpen) {
            console.log('[MoodTracker] Skipping popup - battle or modal is active');
            // Retry after modals close
            setTimeout(() => this.showInitialMoodTracker(), 2000);
            return;
        }
        
        console.log('[MoodTracker] Showing mood tracker on app open/refresh');
        this.showTooltip();
        this.initialPopupShown = true;
        
        // Update last popup time
        this.lastPopupTime = Date.now();
        localStorage.setItem('moodTrackerLastPopup', this.lastPopupTime.toString());
    }
    
    startAutoPopup() {
        console.log('[MoodTracker] Starting auto-popup timer (1 hour)');
        
        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Set up hourly interval
        this.intervalId = setInterval(() => {
            console.log('[MoodTracker] Hourly auto-popup triggered');
            
            // Check if user is on home page (not in battle or other modals)
            const isBattleActive = document.getElementById('battleContainer')?.style.display !== 'none';
            const isModalOpen = document.querySelector('.modal-overlay:not([style*="display: none"])');
            
            if (isBattleActive || isModalOpen) {
                console.log('[MoodTracker] Skipping hourly popup - battle or modal is active');
                return;
            }
            
            // Check if on home page
            const isOnHomePage = document.getElementById('homeTab')?.classList.contains('active') || 
                                document.getElementById('homeTab')?.style.display !== 'none';
            
            if (!isOnHomePage) {
                console.log('[MoodTracker] Skipping hourly popup - not on home page');
                return;
            }
            
            console.log('[MoodTracker] Showing hourly mood tracker popup');
            this.showTooltip();
        }, this.autoPopupInterval);
    }
    
    stopAutoPopup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[MoodTracker] Auto-popup stopped');
        }
    }
    
    playMoodAnimation(moodValue) {
        console.log('[MoodTracker] Playing animation for mood:', moodValue);
        
        const sprite = document.getElementById('mainHeroSprite');
        if (!sprite) {
            console.warn('[MoodTracker] Main hero sprite not found');
            return;
        }
        
        // Get current monster and skin info
        const selectedMonster = localStorage.getItem('selectedMonster') || 'Pink_Monster';
        const equippedSkinId = window.gameState?.equippedSkinId || null;
        const isEgg = window.gameState?.isEgg || false;
        
        // Store original state
        const originalSrc = sprite.src;
        const originalAnimation = sprite.style.animation;
        const originalTransform = sprite.style.transform;
        
        // HAPPY MOOD: Jump animation
        if (moodValue === 'happy') {
            console.log('[MoodTracker] Playing JUMP animation for happy mood');
            console.log('[MoodTracker] Equipped skin:', equippedSkinId);
            console.log('[MoodTracker] Is egg:', isEgg);
            
            if (equippedSkinId || isEgg) {
                // SKIN EQUIPPED OR EGG FORM: Keep current visual, just add jump transform
                const visualType = equippedSkinId ? 'skin' : 'egg';
                console.log(`[MoodTracker] ${visualType} equipped - applying jump transform only`);
                
                // Add jump transform effect WITHOUT changing sprite src
                sprite.style.setProperty('transition', 'transform 0.3s ease', 'important');
                sprite.style.setProperty('transform', 'scale(4) translateY(-20px)', 'important');
                
                setTimeout(() => {
                    sprite.style.setProperty('transform', 'scale(4) translateY(0)', 'important');
                }, 300);
                
                // Restore transform after animation
                setTimeout(() => {
                    sprite.style.setProperty('transform', originalTransform || 'scale(4)', 'important');
                    sprite.style.setProperty('transition', '', 'important');
                    console.log(`[MoodTracker] Jump animation complete - ${visualType} maintained`);
                }, 600);
            } else {
                // NO SKIN AND NOT EGG: Use default monster jump GIF
                console.log('[MoodTracker] No skin/egg - using default monster jump GIF');
                const jumpGif = `assets/${selectedMonster}_jump.gif`;
                sprite.src = jumpGif;
                sprite.style.animation = 'none';
                
                // Add jump transform effect
                sprite.style.transition = 'transform 0.3s ease';
                sprite.style.transform = 'scale(4) translateY(-20px)';
                
                setTimeout(() => {
                    sprite.style.transform = 'scale(4) translateY(0)';
                }, 300);
                
                setTimeout(() => {
                    sprite.src = originalSrc;
                    sprite.style.animation = originalAnimation;
                    sprite.style.transition = '';
                    console.log('[MoodTracker] Jump GIF animation complete');
                }, 2000);
            }
        } 
        // OTHER MOODS: Flicker/fade effect
        else {
            console.log('[MoodTracker] Playing FLICKER animation for', moodValue, 'mood');
            
            // Create flicker effect using opacity
            let flickerCount = 0;
            const maxFlickers = 6; // 3 full cycles (on/off) over 2 seconds
            const flickerInterval = 333; // ~333ms per flicker
            
            const flickerEffect = setInterval(() => {
                if (flickerCount >= maxFlickers) {
                    clearInterval(flickerEffect);
                    // CRITICAL: Always restore to full opacity
                    sprite.style.setProperty('opacity', '1', 'important');
                    console.log('[MoodTracker] Flicker animation complete, opacity restored to 1');
                    return;
                }
                
                // Toggle opacity between 0.3 and 1
                sprite.style.opacity = (flickerCount % 2 === 0) ? '0.3' : '1';
                flickerCount++;
            }, flickerInterval);
            
            // Safety timeout: Force opacity back to 1 after 3 seconds
            setTimeout(() => {
                if (sprite) {
                    sprite.style.setProperty('opacity', '1', 'important');
                    console.log('[MoodTracker] Safety timeout: opacity forced to 1');
                }
            }, 3000);
        }
    }
}

// 30 Encouraging messages for when user has majority sad/meh moods
const ENCOURAGING_MESSAGES = [
    "You're doing better than you think. Every small step counts! 🌟",
    "Tough times don't last, but tough people do. You've got this! 💪",
    "Remember: storms don't last forever. Brighter days are ahead! ☀️",
    "You're stronger than any challenge you're facing right now. 🔥",
    "It's okay to have difficult days. Tomorrow is a fresh start! 🌅",
    "Your feelings are valid, and you're not alone in this journey. 🤝",
    "Small progress is still progress. Be proud of yourself! 🎉",
    "You've overcome challenges before, and you'll overcome this too. 🎯",
    "Taking care of yourself isn't selfish—it's essential. You matter! 💚",
    "Every day may not be good, but there's good in every day. ✨",
    "You're braver than you believe and stronger than you seem. 🦁",
    "This feeling is temporary. You're on a journey to better days! 🚀",
    "Be gentle with yourself. You're doing the best you can. 🌸",
    "Your story isn't over yet. Keep writing those next chapters! 📖",
    "You've survived 100% of your worst days. That's impressive! 🏆",
    "It's okay to rest. You don't have to be productive all the time. 😌",
    "You're not falling behind. You're exactly where you need to be. 🌿",
    "Healing isn't linear. Be patient with your progress. 🌱",
    "You deserve kindness, especially from yourself. 💕",
    "Your feelings don't define you. You're so much more! 🌈",
    "One step at a time. You don't have to climb the whole mountain today. ⛰️",
    "You're allowed to be both a masterpiece and a work in progress. 🎨",
    "Difficult roads often lead to beautiful destinations. Keep going! 🚶",
    "You're not alone. Reach out if you need support—people care! 🤗",
    "Your mental health matters. It's okay to prioritize it. 🧠",
    "You're resilient. Look how far you've already come! 🌟",
    "Bad days don't mean a bad life. This too shall pass. 🍃",
    "You're worthy of love, happiness, and all good things. 💖",
    "Give yourself credit for showing up today. That takes courage! ⭐",
    "You're not broken. You're human, and that's perfectly okay. 💛"
];

let lastEncouragementIndex = -1;

// Global function to update mood history display
window.updateMoodHistoryDisplay = function() {
    const container = document.getElementById('moodHistoryContainer');
    if (!container) return;
    
    const dateFilter = document.getElementById('moodDateFilter')?.value || 'all';
    const moodFilter = document.getElementById('moodTypeFilter')?.value || 'all';
    
    // Get moods directly from localStorage (more reliable)
    const saved = localStorage.getItem('moodHistory');
    let moods = saved ? JSON.parse(saved) : [];
    let allMoods = [...moods]; // Keep unfiltered copy for encouragement check
    
    console.log('[MoodTracker] Filtering moods - Date:', dateFilter, 'Mood:', moodFilter, 'Total:', moods.length);
    
    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        moods = moods.filter(entry => {
            if (!entry.timestamp) return false;
            
            if (dateFilter === 'today') {
                return entry.timestamp >= todayTimestamp;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entry.timestamp >= weekAgo.getTime();
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                return entry.timestamp >= monthAgo.getTime();
            }
            return true;
        });
        console.log('[MoodTracker] After date filter:', moods.length);
    }
    
    // Apply mood type filter
    if (moodFilter !== 'all') {
        moods = moods.filter(entry => {
            return entry.mood && entry.mood.toLowerCase() === moodFilter.toLowerCase();
        });
        console.log('[MoodTracker] After mood filter:', moods.length);
    }
    
    // Check if majority of moods are sad/meh and show encouragement
    const encouragementContainer = document.getElementById('moodEncouragementContainer');
    if (encouragementContainer && allMoods.length >= 3) {
        const sadMehCount = allMoods.filter(m => m.mood === 'sad' || m.mood === 'meh').length;
        const percentage = (sadMehCount / allMoods.length) * 100;
        
        if (percentage > 50) {
            // Show encouraging message
            const dismissedKey = 'moodEncouragementDismissed_' + Date.now();
            const lastDismissed = localStorage.getItem('lastMoodEncouragementDismissed');
            const now = Date.now();
            
            // Only show if not dismissed in the last hour
            if (!lastDismissed || (now - parseInt(lastDismissed)) > 3600000) {
                // Get next message (rotate through all 30)
                lastEncouragementIndex = (lastEncouragementIndex + 1) % ENCOURAGING_MESSAGES.length;
                const message = ENCOURAGING_MESSAGES[lastEncouragementIndex];
                
                encouragementContainer.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15));
                        border: 2px solid rgba(139, 92, 246, 0.4);
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 20px;
                        position: relative;
                    ">
                        <button onclick="window.dismissMoodEncouragement()" style="
                            position: absolute;
                            top: 12px;
                            right: 12px;
                            background: transparent;
                            border: none;
                            color: #fff;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 4px 8px;
                            line-height: 1;
                            transition: color 0.2s;
                        " onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#fff'">×</button>
                        <div style="font-size: 32px; text-align: center; margin-bottom: 12px;">💜</div>
                        <p style="
                            color: #fff;
                            text-align: center;
                            font-size: 15px;
                            line-height: 1.6;
                            margin: 0;
                            padding-right: 20px;
                        ">${message}</p>
                    </div>
                `;
                encouragementContainer.style.display = 'block';
            } else {
                encouragementContainer.style.display = 'none';
            }
        } else {
            encouragementContainer.style.display = 'none';
        }
    }
    
    // Render mood history
    if (moods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <p>No mood entries found</p>
                <p style="font-size: 13px; margin-top: 8px;">Start tracking your mood to see your history here</p>
            </div>
        `;
        return;
    }
    
    console.log('[MoodTracker] Rendering', moods.length, 'mood entries');
    
    container.innerHTML = moods.map(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        return `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 32px;">${entry.emoji}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${entry.name}</div>
                        <div style="font-size: 12px; color: #999;">${dateStr} at ${timeStr}</div>
                    </div>
                </div>
                ${entry.note ? `
                    <div style="
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 12px;
                        color: #ccc;
                        font-size: 13px;
                        line-height: 1.5;
                    ">${entry.note}</div>
                ` : ''}
            </div>
        `;
    }).join('');
};

// Function to dismiss mood encouragement message
window.dismissMoodEncouragement = function() {
    const container = document.getElementById('moodEncouragementContainer');
    if (container) {
        container.style.display = 'none';
        localStorage.setItem('lastMoodEncouragementDismissed', Date.now().toString());
        console.log('[MoodTracker] Encouragement message dismissed');
    }
};

// Initialize mood tracker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moodTracker = new MoodTracker();
    });
} else {
    window.moodTracker = new MoodTracker();
}

// Initialize mood history display when Habits tab is shown
window.initMoodHistoryFilters = function() {
    console.log('[MoodTracker] Initializing mood history filters');
    
    // Add event listeners to filters
    const dateFilter = document.getElementById('moodDateFilter');
    const moodFilter = document.getElementById('moodTypeFilter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            console.log('[MoodTracker] Date filter changed:', dateFilter.value);
            window.updateMoodHistoryDisplay();
        });
    }
    
    if (moodFilter) {
        moodFilter.addEventListener('change', () => {
            console.log('[MoodTracker] Mood filter changed:', moodFilter.value);
            window.updateMoodHistoryDisplay();
        });
    }
    
    // Initial display
    window.updateMoodHistoryDisplay();
    console.log('[MoodTracker] Filters initialized and display updated');
};

// Auto-initialize when switching to Habits tab
const originalShowPage = window.showPage;
if (typeof originalShowPage === 'function') {
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        
        // If switching to habits page, initialize mood display
        if (pageId === 'habits') {
            setTimeout(() => {
                window.initMoodHistoryFilters();
            }, 100);
        }
    };
}

// Also initialize if already on habits page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const habitsPage = document.getElementById('habits');
            if (habitsPage && habitsPage.style.display !== 'none') {
                window.initMoodHistoryFilters();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        const habitsPage = document.getElementById('habits');
        if (habitsPage && habitsPage.style.display !== 'none') {
            window.initMoodHistoryFilters();
        }
    }, 500);
}
