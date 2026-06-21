<script setup>
import BrandLogoName from './BrandLogoName.vue'
import { footerTradeLinks } from '../data/tradeVenues.js'
import { footerPlatformLinks } from '../data/footerPlatforms.js'
import { footerExplorerLinks } from '../data/footerExplorers.js'
import { footerSocialLinks } from '../data/footerSocials.js'

const linkColumns = [
    {
        title: 'Trade',
        links: footerTradeLinks,
    },
    {
        title: 'Platforms',
        links: footerPlatformLinks,
    },
    {
        title: 'Explorers',
        links: footerExplorerLinks,
    },
    {
        title: 'Socials',
        links: footerSocialLinks,
    },
]
</script>

<template>
    <div class="relative z-50 overflow-hidden" style="background: var(--mc-bg); border-top: 1px solid var(--mc-line);">

        <footer class="relative container mx-auto px-3.5 sm:px-6 pt-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] sm:pt-16 sm:pb-16">
            <div class="footer-shell grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-x-10 lg:gap-y-0">
                <!-- Left side — same brand block as header -->
                <div class="lg:col-span-3">
                    <BrandLogoName variant="footer" />
                </div>

                <!-- Middle: mobile stack; sm+ = grid (even column-gap + row-gap, flush edges) -->
                <div class="lg:col-span-9 min-w-0">
                    <!-- Mobile -->
                    <div class="flex flex-col gap-8 sm:hidden">
                        <div
                            v-for="col in linkColumns"
                            :key="col.title"
                            class="flex flex-col gap-1 items-start"
                        >
                            <h4 class="font-display text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200">
                                {{ col.title }}
                            </h4>
                            <div class="footer-link-icons w-max">
                                <a
                                    v-for="(link, i) in col.links"
                                    :key="i"
                                    v-show="link.logo"
                                    :href="link.href"
                                    target="_blank"
                                    :aria-label="link.label"
                                    class="footer-link-logo touch-manipulation"
                                >
                                    <span
                                        v-if="link.logoTile"
                                        class="footer-link-logo-tile"
                                        :style="{ '--footer-logo-tile-scale': link.logoTileScale ?? 0.68 }"
                                    >
                                        <img :src="link.logo" :alt="link.label" />
                                    </span>
                                    <img v-else :src="link.logo" :alt="link.label" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- sm+: headers + logo grids per column -->
                    <div
                        class="footer-links-matrix hidden w-full min-w-0 sm:grid"
                        role="navigation"
                        aria-label="Official links"
                    >
                        <div
                            v-for="col in linkColumns"
                            :key="'h-' + col.title"
                            class="footer-links-h text-left font-display text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200"
                        >
                            {{ col.title }}
                        </div>
                        <div
                            v-for="col in linkColumns"
                            :key="'c-' + col.title"
                            class="footer-links-cell min-w-0"
                        >
                            <div class="footer-link-icons">
                                <a
                                    v-for="(link, i) in col.links"
                                    :key="col.title + '-' + i"
                                    v-show="link.logo"
                                    :href="link.href"
                                    :aria-label="link.label"
                                    target="_blank"
                                    class="footer-link-logo touch-manipulation"
                                >
                                    <span
                                        v-if="link.logoTile"
                                        class="footer-link-logo-tile"
                                        :style="{ '--footer-logo-tile-scale': link.logoTileScale ?? 0.68 }"
                                    >
                                        <img :src="link.logo" :alt="link.label" />
                                    </span>
                                    <img v-else :src="link.logo" :alt="link.label" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p class="footer-disclaimer mt-10 sm:mt-12 text-center font-body text-xs leading-relaxed text-neutral-500">
                Informational only — not financial advice. $TOKE is a community token; always verify on-chain and do your own research.
            </p>
        </footer>
    </div>
</template>

<style scoped>
.footer-links-matrix {
    --footer-link-lh: 1.25rem;
}

/* Logo grid — same layout for Trade, Platforms, and Explorers */
.footer-link-icons {
    --footer-link-icon-scale: 0.8;
    --footer-link-logo-size: calc(2.25rem * var(--footer-link-icon-scale));
    --footer-link-icon-gap: calc(0.5rem * var(--footer-link-icon-scale));
    --footer-link-hit: calc(44px * var(--footer-link-icon-scale));
    display: grid;
    grid-template-columns: repeat(3, max-content);
    column-gap: var(--footer-link-icon-gap);
    row-gap: var(--footer-link-icon-gap);
    justify-content: start;
    justify-items: start;
    align-items: center;
    margin: 0;
    padding: 0;
}

.footer-link-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-start;
    min-height: var(--footer-link-hit);
    min-width: var(--footer-link-logo-size);
    padding: 0;
    margin: 0;
    border-radius: calc(0.5rem * var(--footer-link-icon-scale));
    background: transparent;
    opacity: 0.92;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.footer-link-logo:hover {
    opacity: 1;
}

.footer-link-logo > img {
    display: block;
    height: var(--footer-link-logo-size);
    width: var(--footer-link-logo-size);
    object-fit: contain;
}

/* White square tile — same footprint as App Store icons in the grid */
.footer-link-logo-tile {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: var(--footer-link-logo-size);
    width: var(--footer-link-logo-size);
    background: #fff;
    border-radius: 0;
    overflow: hidden;
}

.footer-link-logo-tile img {
    display: block;
    height: calc(var(--footer-link-logo-size) * var(--footer-logo-tile-scale, 0.68));
    width: calc(var(--footer-link-logo-size) * var(--footer-logo-tile-scale, 0.68));
    object-fit: contain;
}

@media (min-width: 640px) {
    .footer-links-matrix {
        width: 100%;
        grid-template-columns: repeat(4, max-content);
        justify-content: space-between;
        column-gap: 0;
        row-gap: calc(var(--footer-link-lh) / 2);
        align-items: start;
    }

    .footer-link-icons {
        --footer-link-logo-size: calc(2.375rem * var(--footer-link-icon-scale));
        --footer-link-icon-gap: calc(0.625rem * var(--footer-link-icon-scale));
    }
}

.footer-links-h {
    font-weight: 600;
    padding: 0;
    margin: 0;
    justify-self: start;
}

.footer-links-h,
.footer-links-a {
    line-height: var(--footer-link-lh);
}

.footer-links-cell {
    justify-self: start;
    width: max-content;
    max-width: 100%;
    padding: 0;
    margin: 0;
}

.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
