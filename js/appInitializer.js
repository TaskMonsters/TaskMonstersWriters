/**
 * App Initializer
 * Manages the correct initialization flow for Task Monsters app
 */

class AppInitializer {
    constructor() {
        this.isFirstTime = false;
        this.questGiverDue = false;
        this.initialized = false;
    }
    
    /**
     * Main initialization method
     * Coordinates the entire app startup sequence
     */
    async initialize() {
        if (this.initialized) {
            console.warn('[AppInit] Already initialized');
            return;
        }
        
        console.log('[AppInit] Starting initialization...');
        
        try {
            // 1. Load game state first
            if (window.loadGameState) {
                window.loadGameState();
            }
            
            // 2. Check if this is first time user
            this.isFirstTime = !localStorage.getItem('hasChosenMonster') || 
                               localStorage.getItem('hasChosenMonster') !== 'true';
            
            console.log('[AppInit] First time:', this.isFirstTime);
            
            // 4. Wait for loading screen to complete (3 seconds)
            await this.waitForLoadingScreen();
            
            // 5. Show appropriate flow based on state
            if (this.isFirstTime) {
                await this.showOnboardingFlow();
            } else {
                // Returning users go straight to main app
                // Quest giver will appear naturally when triggered
                this.showMainApp();
            }
            
            this.initialized = true;
            console.log('[AppInit] Initialization complete');
            
        } catch (error) {
            console.error('[AppInit] Error during initialization:', error);
            // Fallback: just show the main app
            this.showMainApp();
        }
    }
    
    /**
     * Wait for loading screen to finish
     */
    waitForLoadingScreen() {
        return new Promise(resolve => {
            console.log('[AppInit] Waiting for loading screen...');
            setTimeout(() => {
                console.log('[AppInit] Loading screen complete');
                resolve();
            }, 3100); // 3000ms loading screen + 100ms buffer
        });
    }
    
    /**
     * Show onboarding flow for first-time users
     */
    async showOnboardingFlow() {
        console.log('[AppInit] Showing onboarding flow');
        
        // CRITICAL: Make main app visible so onboarding overlay can be seen
        document.documentElement.style.visibility = 'visible';
        document.body.style.visibility = 'visible';
        
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Show onboarding overlay
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex'; // Force display
            console.log('[AppInit] Onboarding overlay displayed');
        } else {
            console.error('[AppInit] Onboarding overlay not found');
            this.showMainApp();
            return;
        }
        
        // Wait for user to complete onboarding
        await this.waitForOnboardingComplete();
        console.log('[AppInit] Onboarding completed');
        
        // After onboarding, go straight to main app
        // Quest giver will appear naturally when triggered by task completion
        this.showMainApp();
    }
    
    /**
     * Wait for onboarding to be completed
     */
    waitForOnboardingComplete() {
        return new Promise(resolve => {
            console.log('[AppInit] Waiting for onboarding completion...');
            
            // Poll for onboarding completion
            const checkInterval = setInterval(() => {
                const hasChosen = localStorage.getItem('hasChosenMonster');
                if (hasChosen === 'true') {
                    clearInterval(checkInterval);
                    console.log('[AppInit] Onboarding completion detected');
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 minutes (user might have left)
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('[AppInit] Onboarding timeout - showing main app anyway');
                resolve();
            }, 300000);
        });
    }
    
    /**
     * Show quest giver flow
     */
    async showQuestGiverFlow() {
        console.log('[AppInit] Showing quest giver flow');
        
        // CRITICAL: Make main app visible
        document.documentElement.style.visibility = 'visible';
        
        // Check if quest giver onboarding should be shown first
        if (window.questGiverOnboarding && window.QuestGiverOnboarding && window.QuestGiverOnboarding.shouldShow()) {
            console.log('[AppInit] Showing quest giver onboarding first');
            window.questGiverOnboarding.start();
            
            // Wait for quest giver onboarding to complete
            await this.waitForQuestGiverOnboardingComplete();
            console.log('[AppInit] Quest giver onboarding completed');
        }
        
        // Show quest giver modal (the prompt asking if user wants a quest)
        if (window.questGiver) {
            window.questGiver.show();
            console.log('[AppInit] Quest giver modal displayed');
        } else {
            console.error('[AppInit] Quest giver not available');
            this.showMainApp();
        }
        
        // Note: Quest giver will handle:
        // - Showing the quest UI when user clicks "Yes"
        // - Revealing main app when dismissed or "No" is clicked
    }
    
    /**
     * Wait for quest giver onboarding to be completed
     */
    waitForQuestGiverOnboardingComplete() {
        return new Promise(resolve => {
            console.log('[AppInit] Waiting for quest giver onboarding completion...');
            
            // Poll for quest giver onboarding completion
            const checkInterval = setInterval(() => {
                const completed = localStorage.getItem('questGiverOnboardingCompleted');
                if (completed === 'true') {
                    clearInterval(checkInterval);
                    console.log('[AppInit] Quest giver onboarding completion detected');
                    resolve();
                }
            }, 100);
            
            // Timeout after 2 minutes
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('[AppInit] Quest giver onboarding timeout - proceeding anyway');
                resolve();
            }, 120000);
        });
    }
    
    /**
     * Show main app (final step)
     */
    showMainApp() {
        console.log('[AppInit] Showing main app');
        
        // Reveal the main app UI
        document.documentElement.style.visibility = 'visible';
        
        // Initialize skins manager to ensure monster is visible
        // CRITICAL: Only run skinsManager visuals if monster is NOT in egg form
        if (window.skinsManager) {
            window.skinsManager.init();
            // Force a second update after a short delay to ensure DOM is fully settled
            // But ONLY if the monster has hatched - egg state takes priority
            setTimeout(() => {
                const isEgg = window.gameState && window.gameState.isEgg;
                if (isEgg) {
                    // Monster is in egg form - restore egg sprite (skinsManager may have overwritten it)
                    const selectedMonster = localStorage.getItem('selectedMonster');
                    if (selectedMonster) {
                        const mainHeroSprite = document.getElementById('mainHeroSprite');
                        if (mainHeroSprite) {
                            mainHeroSprite.src = `assets/eggs/${selectedMonster}_egg.gif`;
                            mainHeroSprite.classList.add('egg-sprite');
                            mainHeroSprite.style.setProperty('animation', 'none', 'important');
                            mainHeroSprite.style.setProperty('object-fit', 'contain', 'important');
                            mainHeroSprite.style.setProperty('object-position', 'center', 'important');
                            mainHeroSprite.style.setProperty('width', 'auto', 'important');
                            mainHeroSprite.style.setProperty('height', 'auto', 'important');
                            mainHeroSprite.style.setProperty('max-width', '100%', 'important');
                            mainHeroSprite.style.setProperty('max-height', '100%', 'important');
                            mainHeroSprite.style.setProperty('transform', 'scale(2)', 'important');
                            mainHeroSprite.style.setProperty('opacity', '1', 'important');
                            console.log('[AppInit] Egg sprite restored for:', selectedMonster);
                        }
                    }
                } else {
                    window.skinsManager.updateAllMonsterVisuals();
                }
            }, 500);
        }
        
        // Generate daily challenge if not already done
        if (window.generateDailyChallenge) {
            window.generateDailyChallenge();
        }
        
        // Show mood tracker prompt on every app open (all levels).
        // Displayed in the monster's dialogue tooltip so users know they can tap the monster.
        // Waits 4 seconds after app is visible to avoid overlapping with other startup messages.
        setTimeout(() => {
            const tooltip = document.getElementById('taskPalTooltip');
            if (tooltip) {
                tooltip.textContent = '\uD83D\uDE0A Tap me to open your mood tracker!';
                tooltip.classList.add('visible', 'mood-prompt');
                
                // Clicking the tooltip itself also opens the mood tracker
                const openMoodOnClick = () => {
                    tooltip.classList.remove('visible', 'mood-prompt');
                    tooltip.removeEventListener('click', openMoodOnClick);
                    if (window.moodTracker) {
                        window.moodTracker.showTooltip();
                    }
                };
                tooltip.addEventListener('click', openMoodOnClick);
                
                // Auto-hide after 20 seconds
                clearTimeout(window._moodPromptTimer);
                window._moodPromptTimer = setTimeout(() => {
                    tooltip.classList.remove('visible', 'mood-prompt');
                    tooltip.removeEventListener('click', openMoodOnClick);
                }, 20000);
            }
            console.log('[AppInit] Mood tracker prompt shown');
        }, 4000);
        
        console.log('[AppInit] Main app visible');
    }
    
    /**
     * Reset initialization state (for testing/debugging)
     */
    reset() {
        this.initialized = false;
        this.isFirstTime = false;
        this.questGiverDue = false;
        console.log('[AppInit] Reset complete');
    }
}

// Create global instance
window.appInitializer = new AppInitializer();

// Export for debugging
window.resetAppInitializer = () => {
    window.appInitializer.reset();
    console.log('[AppInit] Initializer reset - reload page to test');
};

console.log('[AppInit] AppInitializer loaded and ready');
