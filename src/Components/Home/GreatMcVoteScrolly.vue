<script setup>
import { STEPS, FINALE } from '../../data/greatMcVoteStory.js';
</script>

<template>
  <section class="relative" aria-labelledby="great-mcvote-scrolly-title">
    <div class="absolute -top-16 right-0 md:left-auto md:right-8 h-16 bg-neutral-900/90 backdrop-blur-md rounded-t-2xl border-t border-l border-r border-white/[0.05] px-6 [border-bottom:none] z-20">
      <div class="relative">
        <div class="absolute -top-8 right-12 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div class="absolute -bottom-8 left-12 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl"></div>

        <div class="flex items-center justify-center gap-4">
          <div class="relative w-12 h-12 flex items-center justify-center z-10 hidden md:flex">
            <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
            <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 11H18C19.1046 11 20 11.8954 20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13C4 11.8954 4.89543 11 6 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
          </div>
          <p class="font-orbitron text-6xl font-semibold text-start md:text-center pt-1 relative">
            <span class="text-white">T<span class="text-5xl">HE</span> G<span class="text-5xl">REAT</span> M<span class="text-5xl">C</span>V<span class="text-5xl">OTE</span></span>
          </p>
        </div>
      </div>
    </div>

    <div
      class="relative bg-neutral-900/35 backdrop-blur-md border border-white/[0.05] md:rounded-tl-3xl rounded-tr-md rounded-b-3xl overflow-hidden z-10"
    >
      <div class="container mx-auto px-6 py-20 md:py-28 space-y-16 max-w-3xl">
        <h2 id="great-mcvote-scrolly-title" class="sr-only">Great McVote</h2>
        <article
          v-for="step in STEPS"
          :key="step.id"
          class="space-y-4 border-b border-white/[0.06] pb-12 last:border-0"
        >
          <p class="font-orbitron text-xs uppercase tracking-[0.2em] text-sky-400/90">
            {{ step.label }}
          </p>
          <h3 class="font-orbitron text-3xl md:text-4xl text-white">{{ step.headline }}</h3>
          <p
            v-if="step.subheadline"
            class="font-orbitron text-sm uppercase tracking-[0.14em] text-sky-400/90"
          >
            {{ step.subheadline }}
          </p>
          <img
            :src="step.image"
            :alt="step.headline"
            class="w-full max-w-md mx-auto md:mx-0 rounded-xl opacity-90"
          />
          <p
            v-for="(line, j) in step.body"
            :key="j"
            class="font-exo text-neutral-300 text-lg leading-relaxed"
          >
            {{ line }}
          </p>
          <p
            v-if="step.emphasisLine"
            class="font-orbitron text-sm md:text-base uppercase tracking-[0.12em] text-sky-200 border-l-2 border-sky-400/70 pl-4 py-1"
          >
            {{ step.emphasisLine }}
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <div
              v-if="step.metricValue"
              class="inline-flex items-center rounded-lg border border-white/[0.12] bg-neutral-900/60 px-4 py-2"
            >
              <span class="font-orbitron text-xs uppercase tracking-[0.14em] text-neutral-400">
                {{ step.metricLabel || 'Unique Voters:' }}
              </span>
              <span class="ml-2 font-orbitron text-sm text-white">{{ step.metricValue }}</span>
            </div>
            <a
              :href="step.actionHref || step.resultsHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-xs uppercase tracking-[0.12em] hover:bg-sky-500/15 hover:border-sky-400/60 transition-all"
            >
              {{ step.actionLabel || 'Results' }}
            </a>
          </div>
        </article>
        <article class="space-y-6 pt-4">
          <h3 class="font-orbitron text-3xl md:text-4xl text-white text-balance">
            {{ FINALE.headline }}
          </h3>
          <a
            :href="FINALE.ctaHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900/80 border border-sky-500/30 text-sky-200 font-orbitron text-sm hover:bg-sky-500/10 transition-colors"
          >
            {{ FINALE.ctaLabel }}
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
