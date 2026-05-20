<script setup>
import BrandLogoName from './BrandLogoName.vue'

const linkColumns = [
    {
        title: 'Trade',
        links: [
            { label: 'Coinbase', href: 'https://www.coinbase.com/price/mctoken-solana-amgumqeqw8h74trc8ukkjzzwtxbdps496wh4gly2mcpo-token' },
            { label: 'Jupiter', href: 'https://jup.ag/tokens/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
        ],
    },
    {
        title: 'Platforms',
        links: [
            { label: 'CoinMarketCap', href: 'https://coinmarketcap.com/currencies/mctoken' },
            { label: 'Dexscreener', href: 'https://dexscreener.com/solana/ad6negrxhsbagwfsttbshmkqgedhotcjzyfwcgrraxc9' },
            { label: 'Birdeye', href: 'https://birdeye.so/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo?chain=solana' },
        ],
    },
    {
        title: 'Explorers',
        links: [
            { label: 'Solscan', href: 'https://solscan.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
            { label: 'Orb', href: 'https://orbmarkets.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
        ],
    },
]

const linkRowCount = Math.max(...linkColumns.map((c) => c.links.length))
</script>

<template>
    <div class="relative bg-neutral-950 z-50 overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>

        <footer class="relative container mx-auto px-3.5 sm:px-6 pt-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] sm:pt-16 sm:pb-16">
            <div class="footer-shell grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-x-10 lg:gap-y-0">
                <!-- Left side — same brand block as header -->
                <div class="lg:col-span-3">
                    <BrandLogoName variant="footer" />
                </div>

                <!-- Middle: mobile stack; sm+ = grid (even column-gap + row-gap, flush edges) -->
                <div class="lg:col-span-6 min-w-0">
                    <!-- Mobile -->
                    <div class="flex flex-col gap-8 sm:hidden">
                        <div v-for="col in linkColumns" :key="col.title" class="flex flex-col gap-1">
                            <h4 class="font-orbitron text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200">
                                {{ col.title }}
                            </h4>
                            <a
                                v-for="(link, i) in col.links"
                                :key="i"
                                :href="link.href"
                                target="_blank"
                                class="flex min-h-[44px] items-center text-sm text-neutral-400 hover:text-white transition-colors duration-300 py-1 touch-manipulation"
                            >
                                {{ link.label }}
                            </a>
                        </div>
                    </div>

                    <!-- sm+: 3×N grid — gutters only between tracks (flush to content box, straight verticals) -->
                    <div
                        class="footer-links-matrix hidden w-full min-w-0 sm:grid"
                        role="navigation"
                        aria-label="Official links"
                    >
                        <div
                            v-for="col in linkColumns"
                            :key="'h-' + col.title"
                            class="footer-links-h text-left font-orbitron text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200"
                        >
                            {{ col.title }}
                        </div>
                        <template v-for="row in linkRowCount" :key="'r-' + row">
                            <div
                                v-for="col in linkColumns"
                                :key="col.title + '-' + row"
                                class="footer-links-cell min-w-0"
                            >
                                <a
                                    v-if="col.links[row - 1]"
                                    :href="col.links[row - 1].href"
                                    target="_blank"
                                    class="footer-links-a block text-sm text-neutral-400 hover:text-white transition-colors duration-300"
                                >
                                    {{ col.links[row - 1].label }}
                                </a>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Right side - Social and Copyright -->
                <div class="lg:col-span-3 flex h-full flex-col items-start gap-6 lg:items-end lg:justify-end">
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <a href="https://verified.jup.ag/dashboard/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" 
                           target="_blank"
                           class="group relative flex min-h-[44px] min-w-[44px] items-center justify-center p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300 touch-manipulation">
                            <div class="absolute inset-0 bg-blue-500/10 rounded-xl blur-md group-hover:bg-blue-500/20 transition-all duration-300"></div>
                            <img src="../assets/x.png" class="relative h-5 invert" />
                        </a>
                        <a href="https://discord.com/invite/gTYuUCthvC" 
                           target="_blank"
                           class="group relative flex min-h-[44px] min-w-[44px] items-center justify-center p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300 touch-manipulation">
                            <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                            <img src="../assets/discord.webp" class="relative h-5" />
                        </a>
                    </div>

                    <p class="text-neutral-500 font-exo text-sm text-left lg:text-right">
                        Copyright © 2026 - All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.footer-links-matrix {
    --footer-link-lh: 1.25rem;
}

@media (min-width: 640px) {
    .footer-links-matrix {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        column-gap: 2.5rem;
        row-gap: calc(var(--footer-link-lh) / 2);
        align-items: start;
    }

    .footer-links-a {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.footer-links-h {
    font-weight: 600;
    padding: 0;
    margin: 0;
}

.footer-links-h,
.footer-links-a {
    line-height: var(--footer-link-lh);
}

.footer-links-cell {
    padding: 0;
    margin: 0;
}

.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
