<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import Navbar from '../Components/Navbar.vue';
import Footer from '../Components/Footer.vue';
import AOS from 'aos'
import 'aos/dist/aos.css'
import Timeline from '../Components/Home/Timeline.vue'
import GenesisEra from '../Components/Home/GenesisEra.vue'
import Utility from '../Components/Home/Utility.vue'
import EcosystemEra from '../Components/Home/EcosystemEra.vue';
import GreatMcVoteScrolly from '../Components/Home/GreatMcVoteScrolly.vue';
import jupiterLogo from '../assets/logos/jupiter.png';

const showTerminal = ref(false);
let jupiterInstance = ref(null);

const initJupiter = () => {
  if (window.Jupiter) {
    try {
      // Remove any existing terminal element
      const existingTerminal = document.getElementById('integrated-terminal');
      if (existingTerminal) {
        existingTerminal.innerHTML = '';
      }
      
      // Create new instance
      jupiterInstance.value = window.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        formProps: {
          initialInputMint: "So11111111111111111111111111111111111111112",
          initialOutputMint: "AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo",
          fixedMint: "",
        },
        onSuccess: () => {
          console.log('Jupiter initialized successfully');
        },
        onError: (error) => {
          console.error('Jupiter initialization error:', error);
        }
      });
    } catch (error) {
      console.error('Failed to initialize Jupiter:', error);
    }
  }
};

// Watch for changes in showTerminal
watch(showTerminal, (newValue) => {
  if (newValue) {
    // Wait for the DOM to update
    setTimeout(initJupiter, 100);
  }
});

onMounted(() => {
  AOS.init();
});

onBeforeUnmount(() => {
  // Clean up Jupiter instance when component is unmounted
  if (jupiterInstance.value) {
    jupiterInstance.value.destroy();
  }
});

const toggleTerminal = () => {
  showTerminal.value = !showTerminal.value;
};
</script>

<template>
  <div class="overflow-fix">
    <Navbar />
    <div class="bg-gradient-to-b from-indigo-950/50 to-indigo-950/30 overflow-x-hidden">
      <!-- Hero Section -->
      <div class="relative min-h-[110vh] flex items-center justify-center">
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
        <div class="relative container mx-auto px-6 py-32">
          <div class="flex flex-col items-center text-center space-y-8">
            <!-- Main Title -->
            <h1 class="font-orbitron text-7xl md:text-8xl font-semibold tracking-widest text-transparent bg-clip-text 
                       bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-100
                       [text-shadow:0_0_30px_rgba(255,255,255,0.2)]"
                data-aos="fade-in" 
                data-aos-duration="1000" 
                data-aos-delay="200">
              $TOKE
            </h1>

            <!-- Subtitle -->
            <p class="font-exo text-xl text-neutral-400 max-w-2xl"
               data-aos="fade-up" 
               data-aos-duration="1000" 
               data-aos-delay="400">
               Solana test token turned DePIN's first memecoin. TOKE is a testament to decentralization and community governance. Join us as the next era of TOKE unfolds.            </p>

            <!-- Quick Stats -->
            <div class="grid grid-cols-3 gap-2 md:gap-8 mt-12 max-w-3xl w-full"
                 data-aos="fade-up" 
                 data-aos-duration="1000" 
                 data-aos-delay="600">
              <div class="flex flex-col items-center bg-neutral-900/30 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05]">
                <p class="font-orbitron text-2xl text-white">420M</p>
                <p class="font-exo text-neutral-400 text-sm mt-1">Total Supply</p>
              </div>
              <div class="flex flex-col items-center bg-neutral-900/30 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05]">
                <p class="font-orbitron text-2xl text-white">14K+</p>
                <p class="font-exo text-neutral-400 text-sm mt-1">Holders</p>
              </div>
              <div class="flex flex-col items-center bg-neutral-900/30 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05]">
                <p class="font-orbitron text-2xl text-white">100%</p>
                <p class="font-exo text-neutral-400 text-sm mt-1">Airdropped</p>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex gap-4 mt-8"
                 data-aos="fade-up" 
                 data-aos-duration="1000" 
                 data-aos-delay="800">
              <a href="https://explorer.mctoken.xyz/" target="_blank"
                  class="group relative px-8 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                  <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                  <button class="relative flex items-center justify-center gap-3 w-full">
                      <span class="text-neutral-200 font-orbitron text-sm">EXPLORER</span>
                  </button>
              </a>
              <a href="https://wheel.mctoken.xyz/" target="_blank"
                  class="group relative px-8 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                  <div class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300"></div>
                  <button class="relative flex items-center justify-center gap-3 w-full">
                      <span class="text-neutral-200 font-orbitron text-sm">APP</span>
                  </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Rest of the sections -->
      <div id="Genesis">
        <GenesisEra />
      </div>
      <div id="Vote">
        <GreatMcVoteScrolly />
      </div>
      <div id="Timeline">
        <EcosystemEra />
      </div>
      <Timeline />
      <div id="Utility">
        <Utility />
      </div>
    </div>
    <Footer />

    <!-- Jupiter Terminal Button -->
    <button 
      @click="toggleTerminal"
      class="fixed bottom-6 right-6 z-50 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-105"
    >
      <img :src="jupiterLogo" alt="Jupiter" class="w-10 h-10" />
    </button>

    <!-- Jupiter Terminal Modal -->
    <div 
      v-if="showTerminal"
      class="fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
    >
      <!-- Terminal container -->
      <div class="w-full h-full flex items-center justify-center p-4 md:block md:pointer-events-none">
        <div 
          class="w-full h-[80vh] fixed bottom-0 left-0 right-0 md:w-[400px] md:h-[520px] md:fixed md:bottom-24 md:right-6 md:left-auto md:rounded-2xl md:overflow-hidden md:shadow-2xl md:pointer-events-auto relative pt-16 md:pt-10 bg-neutral-900"
        >
          <!-- Close button inside panel, but outside Jupiter widget -->
          <button 
            @click="toggleTerminal"
            class="absolute top-3 right-3 text-white hover:text-neutral-300 transition-colors z-50 p-2 md:p-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div id="integrated-terminal" class="w-full h-full"></div>
        </div>
      </div>
    </div>
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