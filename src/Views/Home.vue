<script setup>
import { defineAsyncComponent } from 'vue';
import Hero from '../Components/Home/Hero.vue';
import WhatIsToke from '../Components/Home/WhatIsToke.vue';
import MoonWorld from '../Components/Home/MoonWorld.vue';
import HowToBuy from '../Components/Home/HowToBuy.vue';
const VrfdTweetFeed = defineAsyncComponent(() => import('../Components/Home/VrfdTweetFeed.vue'));
const McVoteEraTimeline = defineAsyncComponent(() => import('../Components/Home/McVoteEraTimeline.vue'));
const Footer = defineAsyncComponent(() => import('../Components/Footer.vue'));
</script>

<template>
  <div class="overflow-fix">
    <Hero />
    <div class="home-scroll-surface relative overflow-x-hidden">
      <div class="relative z-10">

      <WhatIsToke />
      <MoonWorld />

      <HowToBuy />

      <div
        class="relative container mx-auto max-w-7xl px-3.5 py-12 sm:px-6 sm:py-16 md:py-20"
        style="border-top: 1px solid var(--mc-line);"
      >
        <p style="font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 12px; text-align: center;">Verified on X</p>
        <h2 style="font-family: var(--mc-display); font-weight: 700; font-size: clamp(26px, 4vw, 40px); letter-spacing: -1px; text-align: center; margin: 0 0 28px; color: var(--mc-text);">Straight from the community.</h2>
        <VrfdTweetFeed />
      </div>

      <McVoteEraTimeline />
      </div>
    </div>
    <Footer />
  </div>
</template>
