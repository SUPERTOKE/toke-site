<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import Navbar from '../Components/Navbar.vue';
import Footer from '../Components/Footer.vue';
import AOS from 'aos'
import 'aos/dist/aos.css'
import Timeline from '../Components/Home/Timeline.vue'
import GenesisEra from '../Components/Home/GenesisEra.vue'
import EcosystemEra from '../Components/Home/EcosystemEra.vue';
import GreatMcVoteScrolly from '../Components/Home/GreatMcVoteScrolly.vue';
import { fetchLiveStatsPayload, statNum, formatMarketCapDisplay } from '../utils/statsApi';

let heroStatsIntervalId = null;

/** Total supply: grouping + up to 3 decimal places (matches live chain/Jupiter ui amounts). */
const formatSupplyStat = (value) => {
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(value);
};

/** Holder count: integers ≥ 0 (don’t treat API `null` as `Number(null)` → 0 incorrectly). */
const formatHolderStat = (value) => {
  if (!Number.isFinite(value) || value < 0) return null;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
};

const LS_HERO_HOLDERS = 'mctoken.hero.holderCount';

function readHoldersFromStorage() {
  if (typeof localStorage === 'undefined') {
    return { display: '—', last: null };
  }
  try {
    const raw = localStorage.getItem(LS_HERO_HOLDERS);
    if (raw == null || raw === '') return { display: '—', last: null };
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return { display: '—', last: null };
    const fmt = formatHolderStat(n);
    if (!fmt) return { display: '—', last: null };
    return { display: fmt, last: fmt };
  } catch {
    return { display: '—', last: null };
  }
}

function persistHolderCount(n) {
  if (typeof localStorage === 'undefined') return;
  if (!Number.isFinite(n) || n < 0) return;
  try {
    localStorage.setItem(LS_HERO_HOLDERS, String(Math.round(n)));
  } catch {
    /* quota / private mode */
  }
}

const initialHolders = readHoldersFromStorage();

const totalSupplyStat = ref('—');
const holdersStat = ref(initialHolders.display);
const marketCapStat = ref('—');

const lastKnownSupply = ref(null);
const lastKnownHolders = ref(initialHolders.last);
const lastKnownMcap = ref(null);

const fetchHeroStats = async () => {
  try {
    const { data: payload, path } = await fetchLiveStatsPayload([
      '/api/toke-stats',
      '/api/toke-price'
    ]);

    const marketCap = statNum(payload?.marketCap);
    const freshMcap = formatMarketCapDisplay(marketCap);
    if (freshMcap !== '—') {
      marketCapStat.value = freshMcap;
      lastKnownMcap.value = freshMcap;
    } else if (lastKnownMcap.value) {
      marketCapStat.value = lastKnownMcap.value;
    } else {
      marketCapStat.value = '—';
    }

    if (path === '/api/toke-price') {
      if (lastKnownSupply.value) totalSupplyStat.value = lastKnownSupply.value;
      if (lastKnownHolders.value) holdersStat.value = lastKnownHolders.value;
      return;
    }

    const totalSupply = statNum(payload?.totalSupply);
    const supplyFmt = formatSupplyStat(totalSupply);
    if (supplyFmt) {
      totalSupplyStat.value = supplyFmt;
      lastKnownSupply.value = supplyFmt;
    } else if (lastKnownSupply.value) {
      totalSupplyStat.value = lastKnownSupply.value;
    } else {
      totalSupplyStat.value = '—';
    }

    const rawHolders = payload?.holderCount;
    if (rawHolders != null && rawHolders !== '') {
      const n = statNum(rawHolders);
      const holderFmt = formatHolderStat(n);
      if (holderFmt != null) {
        holdersStat.value = holderFmt;
        lastKnownHolders.value = holderFmt;
        persistHolderCount(n);
      } else if (lastKnownHolders.value) {
        holdersStat.value = lastKnownHolders.value;
      } else {
        holdersStat.value = '—';
      }
    } else if (lastKnownHolders.value) {
      holdersStat.value = lastKnownHolders.value;
    } else {
      holdersStat.value = '—';
    }
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    if (lastKnownMcap.value) marketCapStat.value = lastKnownMcap.value;
    if (lastKnownSupply.value) totalSupplyStat.value = lastKnownSupply.value;
    if (lastKnownHolders.value) holdersStat.value = lastKnownHolders.value;
  }
};

onMounted(() => {
  AOS.init();
  fetchHeroStats();
  heroStatsIntervalId = window.setInterval(fetchHeroStats, 5000);
});

onBeforeUnmount(() => {
  if (heroStatsIntervalId) {
    window.clearInterval(heroStatsIntervalId);
  }
});
</script>

<template>
  <div class="overflow-fix">
    <Navbar />
    <div class="bg-gradient-to-b from-indigo-950/50 to-indigo-950/30 overflow-x-hidden">
      <!-- Hero Section -->
      <div class="relative min-h-screen md:min-h-[110vh] flex items-center justify-center">
        <!-- Background Effects -->
        <div class="absolute inset-0 bg-gradient-to-b from-neutral-900/80 to-neutral-950/80">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
        </div>

        <!-- Stars Animation Container -->
        <div class="fixed top-0 main-container">
          <div class="sub-container">
            <div class="sky">
              <div class="stars"></div>
              <div class="stars2"></div>
              <div class="stars3"></div>
              <div class="comet"></div>
            </div>
          </div>
        </div>

        <!-- Content Container -->
        <div class="relative container mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div class="flex flex-col items-center text-center space-y-8">
            <!-- Main Title -->
            <h1 class="font-orbitron text-4xl sm:text-6xl md:text-8xl font-semibold tracking-widest text-transparent bg-clip-text 
                       bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-100
                       [text-shadow:0_0_30px_rgba(255,255,255,0.2)]"
                data-aos="fade-in" 
                data-aos-duration="1000" 
                data-aos-delay="200">
              TOKE
            </h1>

            <!-- Subtitle -->
            <p class="font-exo text-base sm:text-xl text-neutral-400 max-w-2xl"
               data-aos="fade-up" 
               data-aos-duration="1000" 
               data-aos-delay="400">
               $TOKE is the cannabis-inspired utility token at the center of a decentralized movement — built by engineers, artists, traders, and tokers worldwide.<br><br>Designed for participation, not speculation, $TOKE unlocks governance, powers community-driven initiatives, and connects global cannabis culture to Web3 infrastructure.<br><br>The Tokeverse isn’t controlled by corporations. It’s shaped by holders.<br><br>Vote. Activate. Elevate.            </p>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mt-10 md:mt-12 max-w-4xl w-full items-stretch"
                 data-aos="fade-up" 
                 data-aos-duration="1000" 
                 data-aos-delay="600">
              <div class="flex flex-col items-center justify-between bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] px-4 py-6 md:px-5 md:py-7 min-h-[132px] md:min-h-[148px]">
                <div class="flex min-h-[3.25rem] w-full items-center justify-center px-1">
                  <p class="font-orbitron tabular-nums text-white text-base sm:text-lg md:text-xl leading-tight text-center [overflow-wrap:anywhere]">{{ totalSupplyStat }}</p>
                </div>
                <p class="font-exo text-neutral-400 text-sm mt-3 shrink-0">Total Supply</p>
              </div>
              <div class="flex flex-col items-center justify-between bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] px-4 py-6 md:px-5 md:py-7 min-h-[132px] md:min-h-[148px]">
                <div class="flex min-h-[3.25rem] w-full items-center justify-center px-1">
                  <p class="font-orbitron tabular-nums text-white text-base sm:text-lg md:text-xl leading-tight text-center [overflow-wrap:anywhere]">{{ holdersStat }}</p>
                </div>
                <p class="font-exo text-neutral-400 text-sm mt-3 shrink-0">Holders</p>
              </div>
              <div class="flex flex-col items-center justify-between bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] px-4 py-6 md:px-5 md:py-7 min-h-[132px] md:min-h-[148px]">
                <div class="flex min-h-[3.25rem] w-full items-center justify-center px-1">
                  <p class="font-orbitron tabular-nums text-white text-base sm:text-lg md:text-xl leading-tight text-center [overflow-wrap:anywhere]">{{ marketCapStat }}</p>
                </div>
                <p class="font-exo text-neutral-400 text-sm mt-3 shrink-0">Market Cap</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Rest of the sections: ecosystem first, then foundations → lore → what’s next -->
      <div id="Ecosystem" class="scroll-mt-20">
        <EcosystemEra />
      </div>
      <div id="Genesis" class="scroll-mt-20">
        <GenesisEra />
      </div>
      <div>
        <GreatMcVoteScrolly />
      </div>
      <Timeline />
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
$starFieldWidth: 3500;
$starFieldHeight: 3500;
$starStartOffset: 600px;

$starOneScrollDuration: 150s;
$starTwoScrollDuration: 175s;
$starThreeScrollDuration: 200s;
$numStarOneStars: 800;
$numStarTwoStars: 400;
$numStarThreeStars: 100;
$numComet: 5;

.main-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

@function create-stars($n) {
  $stars: "#{random($starFieldWidth)}px #{random($starFieldHeight)}px #FFF";

  @for $i from 2 through $n {
    $stars: "#{$stars} , #{random($starFieldWidth)}px #{random($starFieldHeight)}px #FFF";
  }

  @return unquote($stars);
}

@mixin star-template($numStars, $starSize, $scrollSpeed) {
  z-index: 10;
  width: $starSize;
  height: $starSize;
  border-radius: 50%;
  background: transparent;
  box-shadow: create-stars($numStars);
  animation: animStar $scrollSpeed linear infinite;

  &:after {
    content: " ";
    top: -$starStartOffset;
    width: $starSize;
    height: $starSize;
    border-radius: 50%;
    position: absolute;
    background: transparent;
    box-shadow: create-stars($numStars);
  }
}

@mixin shooting-star-template($numStars, $starSize, $speed) {
  z-index: 10;
  width: $starSize;
  height: $starSize + 80px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(to top,
      rgba(52, 202, 244, 0),
      rgb(12, 178, 255));
  animation: animShootingStar $speed linear infinite;
}

.stars {
  @include star-template($numStarOneStars, 1px, $starOneScrollDuration);
  will-change: transform;
}

.stars2 {
  @include star-template($numStarTwoStars, 2px, $starTwoScrollDuration);
  will-change: transform;
}

.stars3 {
  @include star-template($numStarThreeStars, 3px, $starThreeScrollDuration);
  will-change: transform;
}

.comet {
  @include shooting-star-template($numComet, 5px, 10s);
  will-change: transform;
}

@keyframes animStar {
  from {
    transform: translateY(0px);
  }

  to {
    transform: translateY(-#{$starFieldHeight}px) translateX(-#{$starFieldWidth}px);
  }
}

@keyframes animShootingStar {
  from {
    transform: translateY(0px) translateX(0px) rotate(-45deg);
    opacity: 1;
    height: 5px;
  }

  to {
    transform: translateY(-#{$starFieldHeight}px) translateX(-#{$starFieldWidth}px) rotate(-45deg);
    opacity: 1;
    height: 800px;
  }
}

.backdrop-blur-md {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.container {
  position: relative;
}
</style>