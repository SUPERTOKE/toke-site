<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { fetchLiveStatsPayload, statNum } from '../utils/statsApi'

const tokePrice = ref('—')
const lastKnownPrice = ref(null)
const tokeMarketCap = ref('—')
const lastKnownMarketCap = ref(null)
const isPriceStale = ref(false)
const isNavbarVisible = ref(true)
let lastScrollPosition = 0
let priceIntervalId = null

const formatPrice = (priceNumber) => {
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) return '$0'

    if (priceNumber >= 1) return `$${priceNumber.toFixed(2)}`
    if (priceNumber >= 0.01) return `$${priceNumber.toFixed(4)}`
    if (priceNumber >= 0.0001) return `$${priceNumber.toFixed(6)}`
    if (priceNumber >= 0.000001) return `$${priceNumber.toFixed(8)}`

    return `$${priceNumber.toExponential(2)}`
}

const formatMarketCap = (marketCapNumber) => {
    if (!Number.isFinite(marketCapNumber) || marketCapNumber <= 0) return '—'

    const formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(marketCapNumber)

    return `$${formattedValue}`
}

/** Prefer `/api/toke-stats`; fall back to `/api/toke-price` (same numeric snapshot, no holder RPC). */
const fetchLiveStats = async () => {
    try {
        const { data: payload } = await fetchLiveStatsPayload([
            '/api/toke-stats',
            '/api/toke-price'
        ])

        const priceNumber = statNum(payload?.price)
        const marketCapNumber = statNum(payload?.marketCap)
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
            throw new Error('Received invalid price payload')
        }

        const formattedPrice = formatPrice(priceNumber)
        const formattedMarketCap = formatMarketCap(marketCapNumber)
        tokePrice.value = formattedPrice
        tokeMarketCap.value = formattedMarketCap
        lastKnownPrice.value = formattedPrice
        lastKnownMarketCap.value = formattedMarketCap
        isPriceStale.value = false
    } catch (error) {
        console.error('Error fetching live stats:', error);

        if (lastKnownPrice.value) {
            tokePrice.value = lastKnownPrice.value
        } else {
            tokePrice.value = '—'
        }
        if (lastKnownMarketCap.value) {
            tokeMarketCap.value = lastKnownMarketCap.value
        } else {
            tokeMarketCap.value = '—'
        }

        isPriceStale.value = true
    }
}

onMounted(async () => {
    await fetchLiveStats()
    priceIntervalId = window.setInterval(fetchLiveStats, 5000)
    window.addEventListener('scroll', handleScroll)
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
    if (priceIntervalId) {
        window.clearInterval(priceIntervalId)
    }
})

const handleScroll = () => {
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

</script>

<template>
    <div class="fixed top-0 left-0 right-0 bg-neutral-900/30 font-orbitron px-2 md:px-10 z-50 text-neutral-300 transition-all duration-300 backdrop-blur-xl h-20 py-2 flex items-center justify-between"
         :class="{ 'translate-y-0': isNavbarVisible, '-translate-y-full': !isNavbarVisible }">
        <!-- Background decoration -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        
        <!-- Left Section -->
        <div class="flex items-center">
            <!-- Logo and Brand -->
            <div class="flex items-center space-x-2 md:space-x-4">
                <img src="../assets/logo.png" class="h-10 md:h-12 rounded-full hover:scale-105 transition-transform duration-300" />
                <div class="h-9 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent hidden md:block"></div>
                <div class="hidden md:flex flex-col">
                    <p class="text-xl tracking-wider text-white">TOKE</p>
                    <p class="text-xs tracking-wider -mt-1 text-neutral-400">McToken</p>
                </div>
            </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center">
            <div class="flex items-center space-x-2 md:space-x-4 bg-neutral-900/35 border border-white/[0.06] px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
                 :title="isPriceStale ? 'Showing last known price (refreshing)' : 'Live price'">
                <img src="../assets/solana.png" class="h-5 md:h-6 rounded-full" />
                <div class="h-9 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent hidden md:block"></div>
                <div class="flex flex-col">
                    <p class="text-base md:text-xl tracking-wider text-white leading-tight tabular-nums">{{ tokePrice }}</p>
                    <p class="text-[10px] md:text-xs tracking-wider text-neutral-400 tabular-nums">{{ tokeMarketCap }}</p>
                </div>
            </div>
            <!-- <div>
                <wallet-multi-button dark></wallet-multi-button>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
