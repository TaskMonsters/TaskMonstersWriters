/**
 * Mood Tracker System - Tooltip Style
 * Displays a speech bubble tooltip for users to track their mood with emoji buttons
 * Appears every hour and can be triggered by tapping the monster
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
        
        this.autoPopupInterval = 30 * 60 * 1000; // 30 minutes
        this.lastPopupTime = null;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        console.log('[MoodTracker] Initializing...');
        
        // Create tooltip HTML
        this.createTooltip();
        
        // Add monster click listener
        this.addMonsterClickListener();
        
        // Start auto-popup timer
        this.startAutoPopup();
        
        // Load last popup time from localStorage
        const saved = localStorage.getItem('moodTrackerLastPopup');
        if (saved) {
            this.lastPopupTime = parseInt(saved);
        }
        
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
                transform: translateX(-50%);
                margin-bottom: 5px;
                background-color: #2a2a3e;
                border: 2px solid #8b5cf6;
                border-radius: 17px;
                padding: 18px 20px;
                max-width: 320px;
                min-width: 290px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                opacity: 0;
                display: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                transform-origin: bottom center;
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
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    transition: color 0.2s;
                " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ccc'">×</button>
                
                <!-- Title -->
                <h3 style="
                    color: #ffffff;
                    text-align: center;
                    margin: 0 0 14px 0;
                    font-size: 17px;
                    font-weight: 700;
                ">How are you feeling?</h3>
                
                <!-- Emoji Buttons -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 7px;
                    margin-bottom: 10px;
                ">
                    ${this.moods.map(mood => `
                        <button class="mood-btn-tooltip" data-mood="${mood.value}" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: 2px solid rgba(139, 92, 246, 0.3);
                            border-radius: 12px;
                            padding: 14px 8px;
                            font-size: 32px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 6px;
                            min-height: 72px;
                        " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.borderColor='#8b5cf6'; this.style.transform='scale(1.08)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(139, 92, 246, 0.3)'; this.style.transform='scale(1)'">
                            <span>${mood.emoji}</span>
                            <span style="font-size: 11px; color: #ccc; font-weight: 600;">${mood.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Optional Note -->
                <textarea id="moodNoteTooltip" placeholder="Add a note (optional)..." style="
                    width: 100%;
                    min-height: 60px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 10px;
                    padding: 10px 12px;
                    color: #ffffff;
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                    box-sizing: border-box;
                    margin-top: 4px;
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
                tooltip.style.transform = 'translateX(-50%) scale(1)';
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
            tooltip.style.transform = 'translateX(-50%) scale(0.95)';
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
                // Dismiss the "Tap me" mood prompt if it is currently visible
                const moodPrompt = document.getElementById('taskPalTooltip');
                if (moodPrompt && moodPrompt.classList.contains('mood-prompt')) {
                    clearTimeout(window._moodPromptTimer);
                    moodPrompt.classList.remove('visible', 'mood-prompt');
                }
                this.showTooltip();
            });
            console.log('[MoodTracker] Monster click listener added');
        } else {
            console.warn('[MoodTracker] mainHeroSprite not found, retrying in 1s');
            setTimeout(() => this.addMonsterClickListener(), 1000);
        }
    }
    
    startAutoPopup() {
        console.log('[MoodTracker] Starting auto-popup timer (30 minutes)');
        
        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Set up interval
        this.intervalId = setInterval(() => {
            console.log('[MoodTracker] Auto-popup triggered');
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
                
                // Normalize monster name: capitalize first letter for file path
                const monsterName = selectedMonster.charAt(0).toUpperCase() + selectedMonster.slice(1).toLowerCase();
                const jumpGif = `assets/${monsterName}_jump.gif`;
                
                // Preload the jump GIF to prevent broken image display
                const jumpImage = new Image();
                jumpImage.onload = () => {
                    sprite.src = jumpGif;
                    sprite.style.animation = 'none';
                    
                    // Wait a frame for the image to render
                    requestAnimationFrame(() => {
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
                    });
                };
                jumpImage.onerror = () => {
                    console.error('[MoodTracker] Failed to load jump GIF:', jumpGif);
                    // Fallback: just do transform without changing sprite
                    sprite.style.transition = 'transform 0.3s ease';
                    sprite.style.transform = 'scale(4) translateY(-20px)';
                    setTimeout(() => {
                        sprite.style.transform = 'scale(4) translateY(0)';
                    }, 300);
                    setTimeout(() => {
                        sprite.style.transition = '';
                    }, 600);
                };
                jumpImage.src = jumpGif;
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

// Global function to update mood history display
window.updateMoodHistoryDisplay = function() {
    const container = document.getElementById('moodHistoryContainer');
    if (!container) return;
    
    const dateFilter = document.getElementById('moodDateFilter')?.value || 'all';
    const moodFilter = document.getElementById('moodTypeFilter')?.value || 'all';
    
    // Get moods directly from localStorage (more reliable)
    const saved = localStorage.getItem('moodHistory');
    let moods = saved ? JSON.parse(saved) : [];
    
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

// ─── Reset Mood Tracker ────────────────────────────────────────────────────────
window.resetMoodTracker = function() {
    if (!confirm('Are you sure you want to reset all mood tracking data? This cannot be undone.')) return;

    // Clear from localStorage
    localStorage.removeItem('moodHistory');
    console.log('[MoodTracker] Mood history cleared from localStorage');

    // Clear from gameState
    if (window.gameState) {
        window.gameState.moodHistory = [];
    }

    // Refresh the mood history display
    if (typeof window.updateMoodHistoryDisplay === 'function') {
        window.updateMoodHistoryDisplay();
    }

    // Show success notification
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage('🔄 Mood data reset!', 'All mood history has been cleared');
    } else if (typeof showNotification === 'function') {
        showNotification('🔄 Mood history cleared!', 'success');
    } else {
        alert('Mood history has been reset.');
    }
};
