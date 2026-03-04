/**
 * Task World Map Page
 * Shows after battle victories with Guardian message
 * Displays user's progress through the 50-level journey from village to dark castle
 */

class TaskWorldMap {
    constructor() {
        this.isShowing = false;
        this.pathCoordinates = this.initializePathCoordinates();
        console.log('[TaskWorldMap] Task World Map System initialized with 50-position path');
    }
    
    /**
     * Initialize the 50-position path coordinates
     * Path goes from starting village (level 1) to dark castle (level 50)
     * Coordinates are percentages of map dimensions (0-100)
     */
    initializePathCoordinates() {
        return {
            // Starting Village (Levels 1-5)
            1: { x: 10, y: 81 },
            2: { x: 10, y: 75 },
            3: { x: 14, y: 69 },
            4: { x: 18, y: 63 },
            5: { x: 21, y: 56 },
            
            // Green Forest (Levels 6-14)
            6: { x: 25, y: 50 },
            7: { x: 29, y: 44 },
            8: { x: 32, y: 38 },
            9: { x: 36, y: 35 },
            10: { x: 39, y: 38 },
            11: { x: 43, y: 44 },
            12: { x: 46, y: 50 },
            13: { x: 50, y: 56 },
            14: { x: 46, y: 63 },
            
            // Desert Region (Levels 15-26)
            15: { x: 50, y: 44 },
            16: { x: 54, y: 48 },
            17: { x: 57, y: 44 },
            18: { x: 61, y: 50 },
            19: { x: 64, y: 53 },
            20: { x: 68, y: 56 },
            21: { x: 71, y: 60 },
            22: { x: 75, y: 63 },
            23: { x: 79, y: 65 },
            24: { x: 75, y: 69 },
            25: { x: 71, y: 73 },
            26: { x: 68, y: 75 },
            
            // Mountain Approach (Levels 27-39)
            27: { x: 64, y: 69 },
            28: { x: 61, y: 63 },
            29: { x: 64, y: 60 },
            30: { x: 68, y: 58 },
            31: { x: 71, y: 55 },
            32: { x: 75, y: 53 },
            33: { x: 79, y: 50 },
            34: { x: 82, y: 48 },
            35: { x: 86, y: 45 },
            36: { x: 82, y: 43 },
            37: { x: 79, y: 45 },
            38: { x: 75, y: 48 },
            39: { x: 71, y: 45 },
            
            // Dark Castle (Levels 40-50)
            40: { x: 68, y: 43 },
            41: { x: 64, y: 40 },
            42: { x: 61, y: 38 },
            43: { x: 57, y: 35 },
            44: { x: 54, y: 33 },
            45: { x: 50, y: 30 },
            46: { x: 46, y: 28 },
            47: { x: 50, y: 25 },
            48: { x: 54, y: 23 },
            49: { x: 57, y: 20 },
            50: { x: 61, y: 18 }  // Final boss at Dark Castle
        };
    }
    
    /**
     * Get position for a given level
     */
    getPositionForLevel(level) {
        // Clamp level between 1 and 50
        const clampedLevel = Math.max(1, Math.min(50, level));
        return this.pathCoordinates[clampedLevel];
    }
    
    /**
     * Show map page after battle victory
     */
    show(context) {
        if (this.isShowing) {
            console.log('[TaskWorldMap] Map already showing, skipping');
            return;
        }
        
        this.isShowing = true;
        console.log('[TaskWorldMap] Showing map page with context:', context);
        
        const { level, previousLevel, petName, isFirstBattle, enemyName, justLeveledUp } = context;
        
        // Create map overlay
        const overlay = document.createElement('div');
        overlay.id = 'taskWorldMapOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            animation: fadeIn 0.5s ease;
            overflow-y: auto;
            padding: 20px;
        `;
        
        // Create content container
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 900px;
            width: 100%;
            text-align: center;
            position: relative;
        `;
        
        // Title removed per design — the map image itself is the visual anchor
        
        // Map container (for positioning monster sprite)
        const mapContainer = document.createElement('div');
        mapContainer.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 0 auto 24px auto;
        `;
        
        // Map image
        const mapImg = document.createElement('img');
        mapImg.src = 'assets/task_world_map.png';
        mapImg.alt = 'Task World Map';
        mapImg.style.cssText = `
            width: 100%;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            border: 3px solid rgba(255, 255, 255, 0.3);
            display: block;
        `;
        mapContainer.appendChild(mapImg);
        
        // Add monster sprite at current position
        const position = this.getPositionForLevel(level);
        const monsterSprite = this.createMonsterSprite(position, petName);
        mapContainer.appendChild(monsterSprite);
        
        // Add Continue button — declared HERE so it is available to the level-up block below
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 48px;
            font-size: 20px;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin-top: 24px;
        `;
        continueButton.onmouseover = () => {
            continueButton.style.transform = 'scale(1.05)';
            continueButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        };
        continueButton.onmouseout = () => {
            continueButton.style.transform = 'scale(1)';
            continueButton.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        };
        continueButton.onclick = () => {
            // Stop victory music now that the user has acknowledged the win screen
            if (window.audioManager) {
                window.audioManager.stopBattleOutcomeMusic();
            }
            // Reset isShowing so the map can be shown again in the next battle
            this.isShowing = false;
            // Hide the world map overlay
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            // Call returnToMainApp if it exists
            if (typeof returnToMainApp === 'function') {
                returnToMainApp();
            }
        };

        // If just leveled up, show a "LEVEL UP!" banner and animate the walk to new position
        if (justLeveledUp && previousLevel) {
            const previousPosition = this.getPositionForLevel(previousLevel);

            // "LEVEL UP!" banner above the map
            const levelUpBanner = document.createElement('div');
            levelUpBanner.textContent = `⭐ LEVEL UP! ⭐  Level ${level}`;
            levelUpBanner.style.cssText = `
                color: #fbbf24;
                font-size: 28px;
                font-weight: 900;
                text-shadow: 0 0 16px rgba(251,191,36,0.8), 0 2px 4px rgba(0,0,0,0.6);
                letter-spacing: 2px;
                margin-bottom: 12px;
                animation: levelUpPulse 0.6s ease-in-out infinite alternate;
            `;
            // Insert banner just before the map container
            container.insertBefore(levelUpBanner, mapContainer);

            // Inject the keyframe if not already present
            if (!document.getElementById('levelUpPulseStyle')) {
                const s = document.createElement('style');
                s.id = 'levelUpPulseStyle';
                s.textContent = '@keyframes levelUpPulse { from { transform: scale(1); } to { transform: scale(1.06); } }';
                document.head.appendChild(s);
            }

            // Animate the walk — continueButton is now declared above so this is safe
            this.animateMonsterMovement(monsterSprite, previousPosition, position, continueButton);

            // Dim the Continue button visually while locked
            continueButton.style.opacity = '0.5';
        }
        
        container.appendChild(mapContainer);
        
        // Level indicator
        const levelIndicator = document.createElement('div');
        levelIndicator.style.cssText = `
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            padding: 16px 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        `;
        
        const currentRegion = window.guardianNarrative ? window.guardianNarrative.getCurrentRegion(level) : null;
        const regionText = currentRegion ? currentRegion.name : this.getRegionName(level);
        
        levelIndicator.innerHTML = `
            <div style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                Level ${level} ${petName ? `- ${petName}` : ''}
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 18px;">
                📍 ${regionText}
            </div>
        `;
        container.appendChild(levelIndicator);
        
        // continueButton was declared earlier (before the justLeveledUp block) so it is
        // already in scope here — just append it to the container.
        container.appendChild(continueButton);
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Add animations if not already present
        if (!document.getElementById('taskWorldMapAnimations')) {
            const style = document.createElement('style');
            style.id = 'taskWorldMapAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes monsterBounce {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -60%) scale(1.1); }
                }
                
                @keyframes monsterMove {
                    0% { opacity: 1; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show Guardian message after a brief delay
        setTimeout(() => {
            if (window.guardianNarrative) {
                const message = window.guardianNarrative.getMapMessage(context);
                window.guardianNarrative.showMapMessage(message);
            }
        }, 1500);

        // Monster congratulations dialogue — shown in the taskPalTooltip speech bubble.
        // Fires after the map has faded in so it feels like the monster is reacting.
        // Victory music continues playing; it is only stopped when the user taps Continue.
        // Only shown at level 5+ so early players aren't overwhelmed.
        setTimeout(() => {
            try {
                const _playerLevel = (window.gameState && window.gameState.jerryLevel) || 0;
                const tooltip = document.getElementById('taskPalTooltip');
                if (tooltip && _playerLevel >= 5) {
                    const petName = (window.gameState && window.gameState.rockName) || 'your monster';
                    const currentLevel = (window.gameState && window.gameState.jerryLevel) || 1;
                    const battlesWon = (window.gameState && window.gameState.battlesWon) || 1;

                    // Pool of congratulatory messages that mention Gloom
                    const congrats = [
                        `Amazing! We beat ${context.enemyName || 'that enemy'}! Gloom won't know what hit them! 💪`,
                        `Yes! Another victory! Gloom is getting closer to defeat — keep it up! ⚔️`,
                        `We did it! Every battle brings us one step closer to defeating Gloom! 🔥`,
                        `Incredible work! Gloom's power weakens with every win we get! ✨`,
                        `That's ${battlesWon} battle${battlesWon !== 1 ? 's' : ''} won! Gloom doesn't stand a chance against us! 🌟`,
                        `We're unstoppable! Gloom can feel us coming — we're Level ${currentLevel} strong! 💥`,
                        `Another one down! Gloom is trembling — we're getting so close! 🏆`
                    ];
                    const msg = congrats[Math.floor(Math.random() * congrats.length)];

                    tooltip.textContent = msg;
                    tooltip.classList.add('visible');
                    clearTimeout(window.tooltipTimer);
                    window.tooltipTimer = setTimeout(() => tooltip.classList.remove('visible'), 10000);
                }
            } catch (_) {}
        }, 800);
    }
    
    /**
     * Create monster sprite element at given position
     */
    createMonsterSprite(position, petName) {
        const sprite = document.createElement('img');
        
        // Get the selected monster type
        const selectedMonster = localStorage.getItem('selectedMonster') || 'nova';
        
        // Check if user has equipped skin
        const equippedSkin = localStorage.getItem('equippedSkin');
        
        if (equippedSkin && equippedSkin !== 'none') {
            // Use equipped skin
            sprite.src = `assets/skins/${equippedSkin}.png`;
        } else {
            // Use default monster animation (capitalize first letter)
            const monsterName = selectedMonster.charAt(0).toUpperCase() + selectedMonster.slice(1);
            sprite.src = `assets/heroes/${monsterName}_idle.gif`;
        }
        
        sprite.alt = petName || 'Monster';
        sprite.style.cssText = `
            position: absolute;
            left: ${position.x}%;
            top: ${position.y}%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            image-rendering: pixelated;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
            z-index: 10;
            animation: monsterBounce 1.5s ease-in-out infinite;
        `;
        
        return sprite;
    }
    
    /**
     * Animate monster movement from previous position to new position
     */
    /**
     * Animate monster walking from previousLevel position to currentLevel position.
     * @param {HTMLElement} sprite  - The monster img element
     * @param {Object} fromPosition - { x, y } percentages
     * @param {Object} toPosition   - { x, y } percentages
     * @param {HTMLElement} [continueBtn] - Optional button to disable during walk and re-enable after
     */
    animateMonsterMovement(sprite, fromPosition, toPosition, continueBtn) {
        // Disable the Continue button so the user watches the walk
        if (continueBtn) continueBtn.disabled = true;

        // Remove the idle bounce so it doesn't fight the translate transition
        sprite.style.animation = 'none';

        // Snap to the starting (old) position immediately
        sprite.style.transition = 'none';
        sprite.style.left = `${fromPosition.x}%`;
        sprite.style.top  = `${fromPosition.y}%`;

        // One rAF to ensure the snap is painted before we start the transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Smooth walk to new position over 2 s
                sprite.style.transition = 'left 2s ease-in-out, top 2s ease-in-out';
                sprite.style.left = `${toPosition.x}%`;
                sprite.style.top  = `${toPosition.y}%`;

                // After the walk finishes, restore bounce and re-enable button
                setTimeout(() => {
                    sprite.style.transition = 'none';
                    sprite.style.animation  = 'monsterBounce 1.5s ease-in-out infinite';
                    if (continueBtn) {
                        continueBtn.disabled = false;
                        continueBtn.style.opacity = '1';
                    }
                }, 2200); // slightly longer than the 2 s transition
            });
        });
    }
    
    /**
     * Get region name based on level
     */
    getRegionName(level) {
        if (level >= 1 && level <= 5) return 'Starting Village';
        if (level >= 6 && level <= 14) return 'Green Forest';
        if (level >= 15 && level <= 26) return 'Desert Region';
        if (level >= 27 && level <= 39) return 'Mountain Approach';
        if (level >= 40 && level <= 50) return 'Dark Castle';
        return 'Unknown Region';
    }
    
    /**
     * Hide map page
     */
    hide() {
        const overlay = document.getElementById('taskWorldMapOverlay');
        if (overlay) {
            overlay.remove();
        }
        this.isShowing = false;
        console.log('[TaskWorldMap] Map page hidden');
    }
}

// Initialize global Task World Map instance
window.taskWorldMap = new TaskWorldMap();

// NOTE: The world map is shown by lootSystem.closeLootModal() via _pendingWorldMapContext.
// The battleVictory event is dispatched for the Guardian narrative system only;
// taskWorldMap.show() must NOT be called here to avoid a double-trigger.
document.addEventListener('battleVictory', (event) => {
    console.log('[TaskWorldMap] Battle victory event received (Guardian only — map shown by lootSystem)');
    // Do NOT call taskWorldMap.show() here — lootSystem.closeLootModal() handles it.
});

// Return to main app function
function returnToMainApp() {
    console.log('[TaskWorldMap] Returning to main app');
    
    // Hide map page
    if (window.taskWorldMap) {
        window.taskWorldMap.hide();
    }
    
    // Hide battle container
    const battleContainer = document.getElementById('battleContainer');
    if (battleContainer) {
        battleContainer.classList.add('hidden');
    }
    
    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    }
    
    // Resume home page music (victory music was already stopped by the Continue button)
    if (window.audioManager && typeof window.audioManager.playMusic === 'function') {
        // Re-start home ambient music if available
        window.audioManager.playMusic();
    }
}

// Make returnToMainApp globally accessible
window.returnToMainApp = returnToMainApp;

console.log('[TaskWorldMap] Task World Map System loaded with 50-position path');
