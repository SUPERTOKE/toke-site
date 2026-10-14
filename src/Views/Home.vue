<script setup>
import { defineAsyncComponent } from 'vue';
import Hero from '../Components/Home/Hero.vue';
import WhatIsToke from '../Components/Home/WhatIsToke.vue';
import HowToBuy from '../Components/Home/HowToBuy.vue';
import CommunityX from '../Components/Home/CommunityX.vue';
const Footer = defineAsyncComponent(() => import('../Components/Footer.vue'));
</script>

<template>
  <div class="overflow-fix">
    <Hero />
    <div class="home-scroll-surface relative overflow-x-hidden">
      <div class="relative z-10">

      <WhatIsToke />

      <HowToBuy />

      <CommunityX />
      </div>
    </div>
    <Footer />
  </div>
</template>
