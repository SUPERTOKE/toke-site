<script setup>
import { ref } from 'vue';
import { tokenOfficialInfo } from '../../data/tradeVenues';
import tokeLogo from '../../assets/logo.png';
import solanaWordmark from '../../assets/logos/solana-wordmark.png';

const copyState = ref('idle');

async function copyMintAddress() {
  try {
    await navigator.clipboard.writeText(tokenOfficialInfo.mint);
    copyState.value = 'copied';
    window.setTimeout(() => {
      copyState.value = 'idle';
    }, 2000);
  } catch {
    copyState.value = 'error';
    window.setTimeout(() => {
      copyState.value = 'idle';
    }, 2000);
  }
}
</script>

<template>
  <section
    class="hero-token-bar hero-stat-card"
    aria-label="Token details"
    :title="tokenOfficialInfo.disclaimer"
  >
    <div class="hero-token-bar__identity">
      <img
        :src="tokeLogo"
        alt=""
        class="hero-token-bar__logo"
        width="35"
        height="35"
        draggable="false"
        aria-hidden="true"
      />
      <p class="hero-token-bar__name">
        <span class="hero-token-bar__ticker font-orbitron">{{ tokenOfficialInfo.ticker }}</span>
        <span class="hero-token-bar__sep" aria-hidden="true">|</span>
        <span class="hero-token-bar__label font-exo">{{ tokenOfficialInfo.name }}</span>
      </p>
    </div>

    <div class="hero-token-bar__mint">
      <code
        :title="tokenOfficialInfo.mint"
        class="hero-token-bar__address font-mono"
      >{{ tokenOfficialInfo.mint }}</code>
      <button
        type="button"
        class="hero-token-bar__copy font-exo"
        @click="copyMintAddress"
        :aria-label="copyState === 'copied' ? 'Address copied' : 'Copy mint address'"
      >
        <svg
          v-if="copyState !== 'copied'"
          class="hero-token-bar__copy-ico"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span>{{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Failed' : 'Copy' }}</span>
      </button>
    </div>

    <div class="hero-token-bar__chain">
      <img
        :src="solanaWordmark"
        alt="Solana"
        class="hero-token-bar__solana"
        loading="lazy"
        decoding="async"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-token-bar.hero-stat-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  min-width: 0;
  column-gap: clamp(0.75rem, 2.2vw, 1.25rem);
}

.hero-token-bar__identity {
  display: flex;
  min-width: 0;
  flex-shrink: 0;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .hero-token-bar__identity {
    justify-self: center;
    position: relative;
    left: -10%;
    gap: 0.5625rem;
  }
}

.hero-token-bar__logo {
  width: calc(1.75rem * 1.25);
  height: calc(1.75rem * 1.25);
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 9999px;
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.18));
}

@media (min-width: 768px) {
  .hero-token-bar__logo {
    width: calc(2rem * 1.25);
    height: calc(2rem * 1.25);
  }
}

.hero-token-bar__name {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .hero-token-bar__name {
    gap: 0.4375rem;
  }
}

.hero-token-bar__ticker {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgb(255, 255, 255);
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.06);
}

@media (min-width: 640px) {
  .hero-token-bar__ticker {
    font-size: 0.875rem;
  }
}

.hero-token-bar__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(212, 212, 212, 0.95);
}

@media (min-width: 640px) {
  .hero-token-bar__label {
    font-size: 0.875rem;
  }
}

.hero-token-bar__sep {
  color: rgba(163, 163, 163, 0.55);
  font-weight: 300;
  font-size: 0.75rem;
}

.hero-token-bar__mint {
  display: flex;
  flex: 0 0 auto;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

@media (min-width: 640px) {
  .hero-token-bar__mint {
    justify-self: center;
    gap: 0.4375rem;
  }
}

.hero-token-bar__address {
  flex: 0 1 auto;
  width: max-content;
  max-width: min(100%, 28rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 0.5rem;
  border: 1px solid rgba(56, 189, 248, 0.14);
  background: rgba(0, 0, 0, 0.38);
  padding: 0.28rem 0.55rem;
  font-size: 0.625rem;
  line-height: 1.2;
  color: rgba(229, 229, 229, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

@media (min-width: 480px) {
  .hero-token-bar__address {
    font-size: 0.6875rem;
    padding: 0.3rem 0.6rem;
  }
}

@media (min-width: 768px) {
  .hero-token-bar__address {
    font-size: 0.75rem;
    max-width: min(100%, 32rem);
  }
}

.hero-token-bar__copy {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(56, 189, 248, 0.16);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.28rem 0.55rem;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
  color: rgba(229, 229, 229, 0.95);
  transition: border-color 0.15s, background-color 0.15s;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

@media (min-width: 640px) {
  .hero-token-bar__copy {
    font-size: 0.6875rem;
    padding: 0.3rem 0.6rem;
  }
}

.hero-token-bar__copy:hover {
  border-color: rgba(103, 232, 249, 0.35);
  background: rgba(56, 189, 248, 0.08);
}

.hero-token-bar__copy:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(56, 189, 248, 0.55),
    0 0 0 4px rgba(3, 7, 18, 1);
}

.hero-token-bar__copy-ico {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  color: rgba(163, 163, 163, 0.9);
}

.hero-token-bar__chain {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .hero-token-bar__chain {
    justify-self: center;
    position: relative;
    left: 10%;
  }
}

.hero-token-bar__solana {
  height: 1.015625rem;
  width: auto;
  max-width: none;
  object-fit: contain;
  object-position: right center;
  opacity: 0.94;
}

@media (min-width: 640px) {
  .hero-token-bar__solana {
    height: 1.171875rem;
  }
}

@media (max-width: 639px) {
  .hero-token-bar.hero-stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding-block: 0.7rem;
    column-gap: 0;
  }

  .hero-token-bar__mint {
    width: 100%;
    max-width: 100%;
    padding-inline: 0.15rem;
  }

  .hero-token-bar__address {
    flex: 1 1 auto;
    width: auto;
    max-width: 100%;
  }
}
</style>
