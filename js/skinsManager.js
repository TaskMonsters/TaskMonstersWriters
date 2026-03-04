/**
 * Skins Manager
 * Handles skin purchasing, equipping, and rendering across the app
 * REFACTORED: 100% GIF-based animations only. No sprite sheets.
 */

class SkinsManager {
    constructor() {
        this.ownedSkins = [];
        this.equippedSkinId = null;
        this.currentBaseMonster = null;
    }
    
    /**
     * Initialize skins system from saved state
     */
    init() {
        // Load from gameState
        if (window.gameState) {
            this.ownedSkins = window.gameState.ownedSkins || [];
            this.equippedSkinId = window.gameState.equippedSkinId || null;
        }
        
        // Get current base monster
        this.currentBaseMonster = localStorage.getItem('selectedMonster') || 'nova';
        
        console.log('[SkinsManager] Initialized (GIF-ONLY MODE):', {
            ownedSkins: this.ownedSkins,
            equippedSkinId: this.equippedSkinId,
            baseMonster: this.currentBaseMonster
        });
        
        // CRITICAL: Ensure DOM is ready before updating visuals
        // But ONLY update visuals if monster has hatched - egg state takes priority
        if (window.gameState && window.gameState.isEgg) {
            console.log('[SkinsManager] Monster is in egg form - skipping init visual update');
            return;
        }
        this.ensureSpriteReady(() => {
            this.updateAllMonsterVisuals();
        });
    }
    
    /**
     * Ensure sprite element exists and is ready (with retry mechanism)
     */
    ensureSpriteReady(callback, retries = 10) {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        
        if (mainHeroSprite) {
            callback();
        } else if (retries > 0) {
            setTimeout(() => {
                this.ensureSpriteReady(callback, retries - 1);
            }, 100);
        } else {
            console.error('[SkinsManager] Failed to find mainHeroSprite');
        }
    }
    
    /**
     * Update all monster visuals across the app - GIF ONLY
     */
    updateAllMonsterVisuals() {
        console.log('[SkinsManager] Updating visuals (GIF-ONLY)');
        
        // Sync state
        this.equippedSkinId = window.gameState?.equippedSkinId || null;
        
        // CRITICAL: Do not overwrite egg sprite while monster is still in egg form
        if (window.gameState && window.gameState.isEgg) {
            console.log('[SkinsManager] Monster is in egg form - skipping visual update');
            return;
        }
        
        // Get appearance (should return GIF paths)
        const appearance = window.getActiveMonsterAppearance(this.currentBaseMonster, this.equippedSkinId);
        const idleGif = appearance.animations.idle;
        const isSkin = appearance.isSkin || false;
        
        // Determine scales based on whether it's a skin or default monster
        // Skins are 1x larger (scale 5 vs 4 for main, 4 vs 3 for focus timer)
        const mainScale = isSkin ? 5 : 4;
        const focusScale = isSkin ? 4 : 3;
        const battleScale = 3.5; // Battle mode keeps same scale
        
        // 1. Update Main Hero Sprite
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            this.applyGifToElement(mainHeroSprite, idleGif, mainScale);
        }
        
        // 2. Update Focus Timer Sprite
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        if (focusTimerSprite) {
            this.applyGifToElement(focusTimerSprite, idleGif, focusScale);
        }
        
        // 3. Update Battle Sprite (if battle is active)
        const battleHeroSprite = document.getElementById('heroSprite');
        if (battleHeroSprite) {
            this.applyGifToElement(battleHeroSprite, idleGif, battleScale);
        }
    }
    
    /**
     * Helper to apply GIF styling to an element
     */
    applyGifToElement(element, gifPath, scale) {
        // Force reload to ensure animation starts
        element.src = gifPath + '?t=' + Date.now();
        
        // Reset all sprite-sheet related styles
        element.style.setProperty('width', '32px', 'important');
        element.style.setProperty('height', '32px', 'important');
        element.style.setProperty('object-fit', 'contain', 'important');
        element.style.setProperty('object-position', 'center', 'important');
        element.style.setProperty('image-rendering', 'pixelated', 'important');
        
        // Apply scaling
        element.style.setProperty('transform', `scale(${scale})`, 'important');
        element.style.setProperty('transform-origin', 'bottom center', 'important');
        
        // Ensure visibility
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('display', 'block', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        
        // REMOVE ALL CSS ANIMATIONS - The GIF handles its own animation
        element.style.setProperty('animation', 'none', 'important');
        element.style.setProperty('transition', 'none', 'important');
        
        console.log(`[SkinsManager] Applied GIF: ${gifPath} to ${element.id}`);
    }

    /**
     * Render the skins shop UI
     */
    renderSkinsShop() {
        const grid = document.getElementById('skinsShopGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // Use getAllSkins() function from skinsConfig
        const allSkins = window.getAllSkins ? window.getAllSkins() : [];
        const userLevel = window.gameState.jerryLevel || 1;
        const userXP = window.gameState.jerryXP || 0;
        const isEgg = window.gameState && window.gameState.isEgg;
        
        if (allSkins.length === 0) {
            grid.innerHTML = '<div class="no-skins">No skins available in the shop.</div>';
            return;
        }
        
        // If monster is still in egg form, show locked banner and disable all skins
        if (isEgg) {
            grid.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 16px;color:#aaa;width:100%;grid-column:1/-1;">
                <div style="font-size:3rem;margin-bottom:12px;">🥚</div>
                <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:8px;">Skins Locked</div>
                <div style="font-size:0.9rem;line-height:1.6;">Your monster must hatch first!<br>Reach <strong style="color:#fff;">Level 5</strong> to unlock skins.</div>
            </div>`;
            return;
        }
        
        // Sort skins by level requirement (lowest to highest)
        allSkins.sort((a, b) => {
            const levelA = a.levelRequired || 1;
            const levelB = b.levelRequired || 1;
            return levelA - levelB;
        });

        allSkins.forEach(skin => {
            const isOwned = this.ownedSkins.includes(skin.id);
            const isEquipped = this.equippedSkinId === skin.id;
            const isLocked = !isOwned && (userLevel < (skin.levelRequired || 1));
            
            // Basic purchase check
            const canPurchase = userXP >= skin.price && !isLocked;
            
            const card = document.createElement('div');
            card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`;
            
            // Thumbnail display logic
            let thumbnailHTML = '';
            if (isLocked) {
                // Show question mark for locked skins (GREEN)
                thumbnailHTML = `<div class="skin-thumbnail locked-thumbnail"><div class="locked-icon" style="font-size: 4rem; color: #10b981; text-shadow: 0 0 15px #10b981, 0 0 30px rgba(16, 185, 129, 0.8); font-weight: bold; font-family: Arial, sans-serif;">?</div></div>`;
            } else {
                // Show actual skin image (unlocked skins only)
                const skinImage = skin.thumbnail || skin.animations?.idle || `assets/skins/${skin.id}/thumbnail.png`;
                thumbnailHTML = `<div class="skin-thumbnail"><img src="${skinImage}" class="skin-img" onerror="this.style.display='none'"></div>`;
            }
            
            // Button logic
            let buttonHTML = '';
            if (isEquipped) {
                buttonHTML = `<button class="skin-btn-new equipped" onclick="window.skinsManager.unequipSkin()">✓ Equipped</button>`;
            } else if (isOwned) {
                buttonHTML = `<button class="skin-btn-new equip" onclick="window.skinsManager.equipSkin('${skin.id}')">EQUIP</button>`;
            } else if (isLocked) {
                buttonHTML = `<div class="skin-locked-text">🔒 Level ${skin.levelRequired || 1}</div>`;
            } else if (canPurchase) {
                // BUG FIX: Button correctly says BUY (not EQUIP) for unowned purchasable skins
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new buy" onclick="window.skinsManager.buySkin('${skin.id}', ${skin.price})">BUY</button>`;
            } else {
                // Not enough XP — show price and disabled BUY button (tapping shows toast)
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new locked" onclick="window.skinsManager.showInsufficientFundsToast(${skin.price})">BUY</button>`;
            }
            
            card.innerHTML = `
                ${thumbnailHTML}
                <div class="skin-name-new">${skin.name}</div>
                ${buttonHTML}
            `;
            
            grid.appendChild(card);
        });
    }

    /**
     * Buy a skin
     */
    /**
     * Show insufficient funds toast
     */
    showInsufficientFundsToast(price) {
        const current = window.gameState ? (window.gameState.jerryXP || 0) : 0;
        const needed = price - current;
        if (window.showInsufficientFundsMessage) {
            window.showInsufficientFundsMessage(price, current);
        } else if (window.showSuccessMessage) {
            window.showSuccessMessage('❌ Not Enough XP Coins', `You need ${needed} more XP Coins (have ${current}, need ${price})`);
        }
    }

    buySkin(skinId, price) {
        // Block purchasing/equipping skins while monster is in egg form (pre-level 5)
        if (window.gameState && window.gameState.isEgg) {
            if (window.showSuccessMessage) {
                window.showSuccessMessage('\uD83D\uDD12 Skins Locked', 'Reach Level 5 to equip skins!');
            }
            return;
        }
        
        if (window.gameState.jerryXP < price) {
            this.showInsufficientFundsToast(price);
            return;
        }
        
        window.gameState.jerryXP -= price;
        this.ownedSkins.push(skinId);
        window.gameState.ownedSkins = this.ownedSkins;
        
        window.saveGameState();
        window.updateAllDisplays();
        this.renderSkinsShop();
        
        // Play sound if available
        if (window.audioManager) window.audioManager.playSound('buy');
    }

    /**
     * Equip a skin
     */
    equipSkin(skinId) {
        if (!this.ownedSkins.includes(skinId)) return { success: false };
        
        // Block equipping skins while monster is in egg form (pre-level 5)
        if (window.gameState && window.gameState.isEgg) {
            if (window.showSuccessMessage) {
                window.showSuccessMessage('\uD83D\uDD12 Skins Locked', 'Reach Level 5 to equip skins!');
            }
            return { success: false };
        }
        this.equippedSkinId = skinId;
        window.gameState.equippedSkinId = skinId;
        window.saveGameState();
        
        // Play equip sound (same as theme equip)
        if (window.audioManager) {
            window.audioManager.playSound('skin_theme_equip', 0.8);
        }
        
        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }

    /**
     * Unequip a skin
     */
    unequipSkin() {
        this.equippedSkinId = null;
        window.gameState.equippedSkinId = null;
        window.saveGameState();
        
        // Play unequip sound (same as theme equip)
        if (window.audioManager) {
            window.audioManager.playSound('skin_theme_equip', 0.8);
        }
        
        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }
}

// Global instance
window.skinsManager = new SkinsManager();
