<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import BrandLogoName from './BrandLogoName.vue'
import {
  applyTokePriceFromPayload,
  applyTokePriceOnError,
  isTokePriceStale,
  tokePriceDisplay
} from '../utils/tokePriceDisplay'
import { subscribeLiveStats } from '../utils/liveStatsPoll'

const tokePrice = tokePriceDisplay
const isPriceStale = isTokePriceStale
const isNavbarVisible = ref(true)
let lastScrollPosition = 0
let unsubscribeLiveStats = null
let scrollRaf = 0

const applyPriceFromPayload = (payload) => {
    applyTokePriceFromPayload(payload)
}

onMounted(() => {
    unsubscribeLiveStats = subscribeLiveStats(({ data, error }) => {
        if (error) {
            console.error('Error fetching live stats:', error)
            applyTokePriceOnError()
            return
        }
        if (!data) return
        try {
            applyPriceFromPayload(data)
        } catch (err) {
            console.error('Error fetching live stats:', err)
            applyTokePriceOnError()
        }
    })
    window.addEventListener('scroll', scheduleScroll, { passive: true })
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', scheduleScroll, { passive: true })
    if (scrollRaf) cancelAnimationFrame(scrollRaf)
    if (unsubscribeLiveStats) {
        unsubscribeLiveStats()
        unsubscribeLiveStats = null
    }
})

const handleScroll = () => {
    scrollRaf = 0
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
    if (currentScrollPosition < 0) {
        return
    }
    // Show navbar if scrolling up or at the top
    if (currentScrollPosition < lastScrollPosition || currentScrollPosition < 50) {
        isNavbarVisible.value = true
    } else {
        isNavbarVisible.value = false
    }
    lastScrollPosition = currentScrollPosition
}

function scheduleScroll() {
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(handleScroll)
}

</script>

<template>
    <div class="fixed top-0 left-0 right-0 bg-neutral-900/30 font-orbitron z-50 text-neutral-300 transition-all duration-300 backdrop-blur-xl flex min-h-[calc(5.25rem+env(safe-area-inset-top,0px))] items-center justify-between px-3 pt-[env(safe-area-inset-top,0px)] pb-2 md:px-10 md:pb-2"
         :class="{ 'translate-y-0': isNavbarVisible, '-translate-y-full': !isNavbarVisible }">
        <!-- Background decoration -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>

        <!-- Left: BrandLogoName (moonman + TOKE in header) -->
        <div class="flex min-h-12 items-center md:min-h-[3.5rem]">
            <BrandLogoName />
        </div>

        <!-- Right: live price pill — token (small slot, same footprint as moonman) | price -->
        <div class="flex min-h-12 items-center md:min-h-[3.5rem]">
            <div class="flex h-12 max-w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-neutral-900/35 px-3 py-0.5 md:h-[3.5rem] md:gap-4 md:px-4 hover:bg-white/[0.03] transition-all duration-200"
                 :title="isPriceStale ? 'Showing last known price (refreshing)' : 'Live price'">
                <div class="navbar-pill-token-wrap shrink-0" aria-hidden="true">
                    <img
                        src="../assets/logo.png"
                        alt=""
                        class="navbar-pill-token-img"
                        draggable="false"
                    />
                </div>
                <div class="hidden h-10 w-px shrink-0 bg-gradient-to-b from-transparent via-neutral-700 to-transparent md:block md:h-11"></div>
                <div class="navbar-pill-price flex min-w-[6.5rem] flex-1 items-center justify-center md:min-w-[7.75rem]">
                    <p class="navbar-pill-price__text font-orbitron text-base leading-none tracking-wider text-white tabular-nums md:text-xl">
                        {{ tokePrice }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

/* Token in pill: same box as former moonman slot (layout unchanged) */
.navbar-pill-token-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(1.75rem * 1.25);
    height: calc(1.75rem * 1.25);
}

@media (min-width: 768px) {
    .navbar-pill-token-wrap {
        width: calc(2rem * 1.25);
        height: calc(2rem * 1.25);
    }
}

.navbar-pill-token-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 9999px;
}

.navbar-pill-price {
    min-height: 2.75rem;
    padding-inline: 0.25rem;
}

@media (min-width: 768px) {
    .navbar-pill-price {
        min-height: 3rem;
    }
}
</style>