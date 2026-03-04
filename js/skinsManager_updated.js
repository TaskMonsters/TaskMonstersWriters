    /**
     * Update all monster visuals across the app
     */
    updateAllMonsterVisuals() {
        // Use the sprite animation manager for smooth animations
        if (window.spriteAnimationManager) {
            window.spriteAnimationManager.updateAllMonsterVisuals(this.currentBaseMonster, this.equippedSkinId);
        } else {
            console.error('[SkinsManager] Sprite animation manager not loaded');
            // Fallback to basic update
            const appearance = window.getActiveMonsterAppearance(this.currentBaseMonster, this.equippedSkinId);
            const mainHeroSprite = document.getElementById('mainHeroSprite');
            if (mainHeroSprite) {
                mainHeroSprite.src = appearance.animations.idle;
            }
        }
        
        console.log('[SkinsManager] Updated all monster visuals');
    }
