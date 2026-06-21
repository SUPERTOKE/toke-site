<script setup>
import { computed, onMounted, ref } from 'vue';
import { fetchVrfdTweets } from '../../utils/vrfdApi.js';
import xIcon from '../../assets/x.png';

const VRFD_DASHBOARD_URL =
  'https://verified.jup.ag/dashboard/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';

const tweets = ref([]);
const index = ref(0);
const loading = ref(true);
const error = ref(null);

const current = computed(() => tweets.value[index.value] ?? null);
const hasMultiple = computed(() => tweets.value.length > 1);

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayText(text) {
  if (!text) return '';
  return text.replace(/\s*pic\.twitter\.com\/\S+/gi, '').replace(/\s+/g, ' ').trim();
}

function goPrev() {
  if (!hasMultiple.value) return;
  index.value = (index.value - 1 + tweets.value.length) % tweets.value.length;
}

function goNext() {
  if (!hasMultiple.value) return;
  index.value = (index.value + 1) % tweets.value.length;
}

function onKeydown(e) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goPrev();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    goNext();
  }
}

onMounted(async () => {
  try {
    const data = await fetchVrfdTweets();
    tweets.value = Array.isArray(data?.tweets) ? data.tweets : [];
    index.value = 0;
  } catch (e) {
    error.value = e?.message ?? 'Could not load verified tweets';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section
    class="vrfd-feed relative z-[2] mx-auto w-full max-w-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-2xl"
    tabindex="0"
    role="region"
    aria-label="Jupiter VRFD verified tweets"
    @keydown="onKeydown"
  >
    <article
      class="rounded-2xl border border-white/[0.07] bg-neutral-900/35 px-3.5 py-3 antialiased shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-md sm:px-4 sm:py-3.5"
    >
      <header class="mb-2 flex items-center gap-2">
        <a
          :href="VRFD_DASHBOARD_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pr-1 transition-colors hover:text-sky-200/95"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-neutral-950/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <img :src="xIcon" alt="" class="h-3 w-3 invert opacity-85" />
          </span>
          <span class="truncate font-display text-[0.65rem] uppercase tracking-[0.12em] text-sky-300/90 sm:text-[0.7rem]">
            VRFD
          </span>
        </a>

        <div
          v-if="hasMultiple && !loading && !error && current"
          class="flex shrink-0 items-center gap-0.5"
        >
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-neutral-950/50 text-neutral-400 transition-colors hover:border-white/10 hover:bg-neutral-900/80 hover:text-sky-200"
            aria-label="Previous tweet"
            @click="goPrev"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <span
            class="min-w-[2.25rem] text-center font-display text-[0.6rem] tabular-nums uppercase tracking-wide text-neutral-500"
            aria-live="polite"
          >
            {{ index + 1 }}/{{ tweets.length }}
          </span>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-neutral-950/50 text-neutral-400 transition-colors hover:border-white/10 hover:bg-neutral-900/80 hover:text-sky-200"
            aria-label="Next tweet"
            @click="goNext"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div v-if="loading" class="space-y-2 py-0.5" aria-busy="true" aria-label="Loading tweets">
        <div class="h-3 w-2/5 animate-pulse rounded bg-white/[0.06]" />
        <div class="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
        <div class="h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
      </div>

      <div v-else-if="error" class="py-1 text-center">
        <p class="m-0 font-body text-xs leading-relaxed text-neutral-400">
          {{ error }}
        </p>
        <a
          :href="VRFD_DASHBOARD_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center font-display text-[0.65rem] uppercase tracking-wide text-sky-400/90 hover:text-sky-300"
        >
          Open VRFD
        </a>
      </div>

      <div v-else-if="!current" class="py-1 text-center">
        <p class="m-0 font-body text-xs text-neutral-400">No verified tweets yet.</p>
        <a
          :href="VRFD_DASHBOARD_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center font-display text-[0.65rem] uppercase tracking-wide text-sky-400/90 hover:text-sky-300"
        >
          View on VRFD
        </a>
      </div>

      <template v-else>
        <p
          v-if="current.author || current.postedAt"
          class="m-0 mb-1.5 font-display text-[0.6rem] uppercase tracking-[0.1em] text-sky-400/75 sm:text-[0.65rem]"
        >
          <span v-if="current.author">{{ current.author }}</span>
          <span v-if="current.author && current.postedAt" class="text-neutral-600"> · </span>
          <time v-if="current.postedAt" :datetime="current.postedAt" class="text-neutral-500">
            {{ formatDate(current.postedAt) }}
          </time>
        </p>

        <p
          class="vrfd-feed__body m-0 font-body text-[0.8125rem] leading-snug text-neutral-200/95 [text-wrap:pretty] sm:text-sm"
          aria-live="polite"
        >
          {{ displayText(current.text) }}
        </p>

        <footer class="mt-2 flex items-center justify-end gap-3 border-t border-white/[0.05] pt-2">
          <a
            v-if="current.url"
            :href="current.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 font-display text-[0.6rem] uppercase tracking-[0.08em] text-sky-400/85 transition-colors hover:text-sky-300"
          >
            View on X
            <svg class="h-3 w-3 opacity-70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H9M17 7V15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </footer>
      </template>
    </article>
  </section>
</template>

<style scoped>
.vrfd-feed__body {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

@media (min-width: 640px) {
  .vrfd-feed__body {
    -webkit-line-clamp: 3;
  }
}
</style>
