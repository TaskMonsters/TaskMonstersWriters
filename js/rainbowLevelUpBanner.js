// rainbowLevelUpBanner.js
// Golden level-up banner animation for Task Monsters
// Redesigned to match the quest card gold/amber aesthetic

(function() {
    'use strict';

    /**
     * Show a golden level-up banner animation
     * @param {number} level - The new level reached
     */
    function showRainbowLevelUpBanner(level) {
        try {
            // Inject keyframes and styles if not already present
            if (!document.getElementById('goldenBannerStyles')) {
                const style = document.createElement('style');
                style.id = 'goldenBannerStyles';
                style.textContent = `
                    @keyframes goldenBannerSlideIn {
                        from { opacity: 0; transform: translateY(-100%); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes goldenBannerSlideOut {
                        from { opacity: 1; transform: translateY(0); }
                        to   { opacity: 0; transform: translateY(-100%); }
                    }
                    @keyframes goldenShimmer {
                        0%   { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                    @keyframes goldenPulse {
                        0%, 100% { box-shadow: 0 4px 24px rgba(251, 191, 36, 0.5), 0 0 0 0 rgba(251, 191, 36, 0.4); }
                        50%      { box-shadow: 0 4px 32px rgba(251, 191, 36, 0.8), 0 0 0 8px rgba(251, 191, 36, 0); }
                    }
                    #goldenLevelUpBanner {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        z-index: 99999;
                        pointer-events: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        padding: 14px 24px;
                        /* Gold gradient matching quest card header */
                        background: linear-gradient(135deg, #92400e 0%, #d97706 25%, #f59e0b 50%, #fbbf24 75%, #d97706 100%);
                        background-size: 300% auto;
                        border-bottom: 3px solid #fbbf24;
                        box-shadow: 0 4px 24px rgba(251, 191, 36, 0.5);
                        animation:
                            goldenBannerSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                            goldenShimmer 2.5s linear infinite,
                            goldenPulse 1.8s ease-in-out infinite;
                    }
                    #goldenLevelUpBanner .banner-icon {
                        font-size: 26px;
                        line-height: 1;
                        flex-shrink: 0;
                    }
                    #goldenLevelUpBanner .banner-text {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1px;
                    }
                    #goldenLevelUpBanner .banner-title {
                        font-size: 1.15rem;
                        font-weight: 900;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        color: #1a1410;
                        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4), 0 -1px 0 rgba(0, 0, 0, 0.2);
                        line-height: 1.1;
                    }
                    #goldenLevelUpBanner .banner-subtitle {
                        font-size: 0.8rem;
                        font-weight: 700;
                        letter-spacing: 1px;
                        color: #78350f;
                        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
                    }
                    #goldenLevelUpBanner.banner-exit {
                        animation: goldenBannerSlideOut 0.35s ease-in forwards !important;
                    }
                `;
                document.head.appendChild(style);
            }

            // Remove any existing banner
            const existing = document.getElementById('goldenLevelUpBanner');
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            // Build banner
            const banner = document.createElement('div');
            banner.id = 'goldenLevelUpBanner';
            banner.innerHTML = `
                <span class="banner-icon">🏆</span>
                <div class="banner-text">
                    <span class="banner-title">Level Up!</span>
                    <span class="banner-subtitle">You reached Level ${level}</span>
                </div>
                <span class="banner-icon">⭐</span>
            `;

            document.body.appendChild(banner);

            // Auto-remove after 3.5 seconds with slide-out animation
            setTimeout(() => {
                if (banner && banner.parentNode) {
                    banner.classList.add('banner-exit');
                    setTimeout(() => {
                        if (banner && banner.parentNode) {
                            banner.parentNode.removeChild(banner);
                        }
                    }, 380);
                }
            }, 3500);

        } catch (err) {
            console.warn('[GoldenBanner] Could not show level-up banner:', err);
        }
    }

    // Expose globally (keep old name for compatibility)
    window.showRainbowLevelUpBanner = showRainbowLevelUpBanner;

    console.log('[GoldenBanner] Loaded');
})();
