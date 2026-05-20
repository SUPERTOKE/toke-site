<script setup>
import { computed } from 'vue';

/** Full bar = 100% supply (matches McVote economics copy). */
const QUORUM = 60;
const VAULT = 7;
const VAULT_START = 100 - VAULT;

const props = defineProps({
  yesPercent: {
    type: Number,
    required: true,
  },
  notVotedPercent: {
    type: Number,
    required: true,
  },
  emeraldMcVault: {
    type: Boolean,
    default: false,
  },
  /** `stacked`: legends under the track (timeline cards on mobile). `inline`: default desktop-style labels. */
  layout: {
    type: String,
    default: 'inline',
    validator: (v) => v === 'inline' || v === 'stacked',
  },
});

const yesClamped = computed(() => Math.min(100, Math.max(0, props.yesPercent)));

const yesWidth = computed(() => `${yesClamped.value}%`);

const yesRoundedFull = computed(() => yesClamped.value >= 99.5);

const quorumMet = computed(() => props.yesPercent >= QUORUM);

/** First digit centered on marker; remainder + "%" follows (e.g. 60 → "6" + "0%"). */
const quorumLabelParts = computed(() => {
  const s = String(QUORUM);
  return { first: s[0] ?? '', rest: s.slice(1) };
});

const ariaLabel = computed(() => {
  const q = quorumMet.value ? 'passed' : 'not reached';
  return `Vote result ${props.yesPercent}% yes on full supply. ${QUORUM}% quorum ${q}. ${props.notVotedPercent}% not voted. ${VAULT}% McVault locked.`;
});
</script>

<template>
  <div
    class="vote-bar-root w-full min-w-0 font-exo select-none"
    role="img"
    :aria-label="ariaLabel"
  >
    <div
      class="vote-bar-track-wrap relative w-full overflow-visible"
      :class="props.layout === 'stacked' ? 'h-[14px]' : 'h-[12px] sm:h-[13px]'"
    >
      <div
        class="vote-bar-shell relative h-full w-full rounded-full overflow-hidden"
      >
      <!-- Not-voted band from quorum (width per vote) -->
      <div
        class="pointer-events-none absolute top-0 bottom-0 vote-bar-cushion"
        :style="{ left: `${QUORUM}%`, width: `${props.notVotedPercent}%` }"
        aria-hidden="true"
      />

      <!-- YES result -->
      <div
        class="absolute top-0 bottom-0 left-0 z-[1] vote-bar-yes transition-[width] duration-700 ease-out"
        :class="{ 'vote-bar-yes--full': yesRoundedFull }"
        :style="{ width: yesWidth }"
        aria-hidden="true"
      />

      <!-- McVault locked tail (above YES fill) -->
      <div
        class="pointer-events-none absolute top-0 bottom-0 z-[2] vote-bar-vault"
        :class="{ 'vote-bar-vault--emerald': props.emeraldMcVault }"
        :style="{ left: `${VAULT_START}%`, width: `${VAULT}%` }"
        aria-hidden="true"
      />
      </div>

      <!-- Quorum goal marker (outside clipped shell so it can read above the track) -->
      <div
        class="pointer-events-none absolute z-[5] vote-bar-quorum-glow -translate-x-1/2"
        :style="{ left: `${QUORUM}%`, top: '0', height: '100%' }"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute z-[6] vote-bar-quorum -translate-x-1/2"
        :style="{ left: `${QUORUM}%`, top: '0', height: '100%' }"
        aria-hidden="true"
      />
    </div>

    <div
      v-if="props.layout === 'stacked'"
      class="relative mt-2.5 w-full space-y-1.5 text-center"
    >
      <p
        class="font-orbitron text-[11px] leading-tight tracking-wide text-fuchsia-200/95 sm:text-xs"
      >
        <span class="tabular-nums">{{ QUORUM }}%</span>
        <span class="text-neutral-400"> quorum</span>
      </p>
      <p
        class="font-orbitron text-[10px] leading-snug tracking-wide text-neutral-400 sm:text-[11px]"
      >
        <span class="text-cyan-300/85 tabular-nums">{{ props.notVotedPercent }}%</span>
        <span class="text-neutral-500"> not voted</span>
        <span class="mx-1.5 text-neutral-600" aria-hidden="true">·</span>
        <span
          :class="
            props.emeraldMcVault
              ? 'text-emerald-300 tabular-nums'
              : 'text-red-300 tabular-nums'
          "
        >{{ VAULT }}%</span>
        <span
          :class="
            props.emeraldMcVault ? 'text-emerald-200/90' : 'text-red-200/95'
          "
        > McVault</span>
      </p>
    </div>

    <div
      v-else
      class="relative mt-2 w-full max-md:pt-4 md:mt-1.5 md:min-h-[1.1em]"
    >
      <div
        class="pointer-events-none absolute top-0 z-[1] inline-flex flex-nowrap items-center whitespace-nowrap text-[9px] uppercase tracking-wide leading-none sm:text-[10px] md:text-[11px]"
        :style="{ left: `${QUORUM}%` }"
      >
        <!-- Real width + translate so "6" centers on tick; rest sits in flow (no overlap). -->
        <span
          class="relative z-[2] flex h-[1.15em] w-[0.58em] shrink-0 -translate-x-1/2 items-center justify-center font-orbitron tabular-nums text-fuchsia-200 leading-none sm:w-[0.62em]"
        >{{ quorumLabelParts.first }}</span>
        <span
          class="relative z-[1] -ml-[0.26em] font-orbitron tabular-nums text-fuchsia-200 leading-none sm:-ml-[0.28em]"
        >{{ quorumLabelParts.rest }}%</span>
        <span class="ml-1.5 font-orbitron text-neutral-400 leading-none">quorum</span>
      </div>
      <div
        class="flex flex-col items-center gap-1 pt-0.5 text-center max-md:mt-0.5 md:flex-row md:items-end md:justify-end md:gap-x-3 md:gap-y-0.5 md:pt-0 md:text-left text-[9px] tabular-nums tracking-wide text-neutral-500 uppercase sm:text-[10px] md:text-[11px]"
      >
        <span>
          <span class="text-cyan-300/70">{{ props.notVotedPercent }}%</span> not voted
        </span>
        <span class="hidden text-neutral-600 md:inline" aria-hidden="true">·</span>
        <span>
          <span
            :class="
              props.emeraldMcVault
                ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.65)]'
                : 'text-red-300 drop-shadow-[0_0_12px_rgba(248,113,113,0.85)]'
            "
          >{{ VAULT }}%</span><span
            :class="
              props.emeraldMcVault
                ? 'text-emerald-200/90 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]'
                : 'text-red-200/95 drop-shadow-[0_0_10px_rgba(239,68,68,0.55)]'
            "
          > McVault</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vote-bar-shell {
  background: linear-gradient(180deg, rgba(12, 18, 28, 0.95) 0%, rgba(6, 10, 16, 0.98) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(56, 189, 248, 0.12),
    0 0 24px -8px rgba(56, 189, 248, 0.15);
}

.vote-bar-cushion {
  background: linear-gradient(
    90deg,
    rgba(34, 211, 238, 0.07) 0%,
    rgba(99, 102, 241, 0.06) 50%,
    rgba(167, 139, 250, 0.05) 100%
  );
  mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
}

.vote-bar-vault {
  background: repeating-linear-gradient(
    -45deg,
    rgba(255, 55, 55, 0.52) 0px,
    rgba(255, 55, 55, 0.52) 3px,
    rgba(12, 4, 6, 0.92) 3px,
    rgba(12, 4, 6, 0.92) 6px
  );
  box-shadow:
    inset 0 0 18px rgba(255, 70, 70, 0.45),
    inset 0 0 28px rgba(220, 20, 60, 0.2);
  border-left: 1px solid rgba(255, 100, 100, 0.95);
}

.vote-bar-vault--emerald {
  background: repeating-linear-gradient(
    -45deg,
    rgba(52, 250, 165, 0.38) 0px,
    rgba(52, 250, 165, 0.38) 3px,
    rgba(4, 28, 18, 0.88) 3px,
    rgba(4, 28, 18, 0.88) 6px
  );
  box-shadow:
    inset 0 0 18px rgba(52, 211, 153, 0.45),
    inset 0 0 26px rgba(16, 185, 129, 0.22);
  border-left: 1px solid rgba(110, 231, 183, 0.95);
}

.vote-bar-yes {
  background: linear-gradient(
    90deg,
    rgba(34, 211, 238, 0.55) 0%,
    rgba(56, 189, 248, 0.75) 45%,
    rgba(129, 140, 248, 0.65) 100%
  );
  box-shadow:
    0 0 16px rgba(56, 189, 248, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border-radius: 9999px 0 0 9999px;
}

.vote-bar-yes--full {
  border-radius: 9999px;
}

.vote-bar-quorum-glow {
  width: 12px;
  background: radial-gradient(
    closest-side,
    rgba(232, 121, 249, 0.65) 0%,
    rgba(192, 132, 252, 0.28) 42%,
    transparent 72%
  );
  filter: blur(1.5px);
}

.vote-bar-quorum {
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    rgba(253, 244, 255, 0.98) 0%,
    rgba(216, 180, 254, 0.95) 18%,
    rgba(168, 85, 247, 0.98) 55%,
    rgba(126, 34, 206, 0.85) 100%
  );
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.35),
    0 0 14px rgba(232, 121, 249, 0.95),
    0 0 28px rgba(168, 85, 247, 0.55),
    inset 0 0 6px rgba(255, 255, 255, 0.35);
}
</style>
