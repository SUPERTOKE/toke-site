<script setup>
import { onMounted, ref } from 'vue';
import AOS from 'aos'
import 'aos/dist/aos.css'

onMounted(() => {
  AOS.init({
    duration: 1000,
    once: true,
    mirror: false
  });
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
    </div>
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>

    <div class="relative container mx-auto px-6 py-24 lg:py-32">
      <!-- Header Section -->
      <div class="text-center mb-10" data-aos="fade-down">
        <p class="font-orbitron text-6xl font-semibold text-center pb-3 relative">
          <span class="text-white">UTILITY</span>
        </p>
        <!-- <p class="text-neutral-400 font-exo max-w-md mx-auto" data-aos="fade-up" data-aos-delay="100">
          Introducing DePIN's very own 4/20 memecoin, with deep liquidity and direct integrations with DePIN.
        </p> -->
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- DeFi Section -->
        <div
          class="bg-neutral-900/30 backdrop-blur-xs rounded-2xl p-8 transform hover:scale-105 transition-all duration-300"
          data-aos="fade-right">
          <h2 class="uppercase text-2xl text-neutral-200 font-orbitron mb-8 text-center">
            DeFi Ecosystem
          </h2>
          <div
            class="grid grid-cols-3 gap-6 items-center justify-items-center bg-neutral-900/30 backdrop-blur-xs rounded-2xl md:p-8">
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/coinmc.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/bird.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/jup.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/ray.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/orc.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/met.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/flux.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/defi/dexscreener.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
        </div>

        <!-- Integrations Section -->
        <div
          class="bg-neutral-900/30 backdrop-blur-xs rounded-2xl p-8 transform hover:scale-105 transition-all duration-300"
          data-aos="fade-right">
          <h2 class="uppercase text-2xl text-neutral-200 font-orbitron mb-8 text-center">
            Integrations
          </h2>
          <div
            class="grid grid-cols-3 gap-6 items-center justify-items-center bg-neutral-900/30 backdrop-blur-xs rounded-2xl md:p-8">
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/helio.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/align.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/realms.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/matrica.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <!-- <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/underdog.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div> -->
            <!-- <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/depin1.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div> -->
            <!-- <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/mcdegen.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div> -->
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/solpay.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
        </div>

        <!-- Collaborations Section -->
        <!-- <div
          class="bg-neutral-900/30 backdrop-blur-xs rounded-2xl p-8 transform hover:scale-105 transition-all duration-300"
          data-aos="fade-right">
          <h2 class="uppercase text-2xl text-neutral-200 font-orbitron mb-8 text-center">
            Collaborations
          </h2>
          <div
            class="grid grid-cols-3 gap-6 items-center justify-items-center bg-neutral-900/30 backdrop-blur-xs rounded-2xl md:p-8">
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/collabs/dewicats.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/collabs/entropy.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
        </div> -->

        <!-- Partnerships Section -->
        <!-- <div
          class="bg-neutral-900/30 backdrop-blur-xs rounded-2xl p-8 transform hover:scale-105 transition-all duration-300"
          data-aos="fade-right">
          <h2 class="uppercase text-2xl text-neutral-200 font-orbitron mb-8 text-center">
            Partnerships
          </h2>
          <div
            class="grid grid-cols-3 gap-6 items-center justify-items-center bg-neutral-900/30 backdrop-blur-xs rounded-2xl md:p-8">
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/partnerships/mycelium.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/integrations/pulse.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
            <div
              class="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] rounded-lg transition-all duration-200">
              <img src="../../assets/logos/partnerships/supertoke.png"
                class="w-full h-auto object-contain max-h-12 hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>