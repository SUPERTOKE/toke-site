<script setup>
import { defineAsyncComponent } from 'vue';
import Hero from '../Components/Home/Hero.vue';
import Receipts from '../Components/Home/Receipts.vue';
import CommunityX from '../Components/Home/CommunityX.vue';
const Footer = defineAsyncComponent(() => import('../Components/Footer.vue'));
</script>

<template>
  <div class="overflow-fix">
    <Hero />
    <div class="home-scroll-surface relative overflow-x-hidden">
      <div class="relative z-10">

      <Receipts />
      <CommunityX />
      </div>
    </div>
    <Footer />
  </div>
</template>
