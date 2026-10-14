<script setup>
import moonmanSepia from '../assets/moonman-sepia.jpg';
const EXPLORER_URL = 'https://explorer.mctoken.xyz';
</script>

<template>
  <main class="nf">
    <div class="nf-stars" aria-hidden="true"></div>
    <span class="nf-ghost" aria-hidden="true">404</span>
    <svg class="nf-ship" viewBox="0 0 48 20" aria-hidden="true"><g fill="none" stroke="#8b94a3" stroke-width="1.2"><rect x="6" y="6" width="26" height="10" rx="2"/><path d="M32 11h9"/><path d="M6 11H1"/></g></svg>

    <div class="nf-inner">
      <figure class="nf-art">
        <img :src="moonmanSepia" alt="Moon Man, lost in space" width="220" height="220" loading="lazy" />
      </figure>

      <p class="nf-eyebrow">Error 404 · Lost signal</p>
      <h1 class="nf-h1">You've drifted <span class="b">off-orbit.</span></h1>
      <p class="nf-sub">
        This sector is uncharted — the page drifted off into the void, or never existed.
        Even the Explorer holds no receipt for it. Let's get you back to base.
      </p>

      <div class="nf-cta">
        <a class="nf-btn nf-btn--primary" href="/">← Back to base</a>
        <a class="nf-btn" :href="EXPLORER_URL" target="_blank" rel="noopener">Open the Explorer</a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.nf {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--mc-sans);
  color: var(--mc-text);
  background: radial-gradient(120% 80% at 50% -10%, rgba(90, 162, 255, 0.10), transparent 60%), var(--mc-bg);
  text-align: center;
  padding: 40px 22px;
}
.nf-stars {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 30%, #9fb4d8 50%, transparent),
    radial-gradient(1.5px 1.5px at 70% 60%, #9fb4d8 50%, transparent),
    radial-gradient(1px 1px at 40% 80%, #9fb4d8 50%, transparent),
    radial-gradient(1px 1px at 85% 25%, #9fb4d8 50%, transparent),
    radial-gradient(1.5px 1.5px at 55% 15%, #9fb4d8 50%, transparent),
    radial-gradient(1px 1px at 12% 70%, #9fb4d8 50%, transparent);
}
.nf-ghost {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--mc-display); font-weight: 700; font-size: 42vw; line-height: 1;
  color: rgba(90, 162, 255, 0.05); z-index: 0; pointer-events: none; letter-spacing: -0.04em;
}
.nf-ship {
  position: absolute; top: 22%; left: -60px; width: 48px; opacity: 0.22; z-index: 1;
  animation: nf-drift 38s linear infinite;
}
@keyframes nf-drift {
  0% { transform: translateX(0) translateY(0) rotate(-4deg); }
  50% { transform: translateX(55vw) translateY(18px) rotate(3deg); }
  100% { transform: translateX(110vw) translateY(-8px) rotate(-4deg); }
}
.nf-inner { position: relative; z-index: 2; max-width: 540px; }
.nf-art {
  margin: 0 auto 26px; width: 220px; height: 220px; border-radius: 18px; overflow: hidden;
  border: 1px solid var(--mc-line-2); background: var(--mc-panel);
  box-shadow: 0 0 0 6px rgba(90, 162, 255, 0.06), 0 24px 60px rgba(0, 0, 0, 0.5);
}
.nf-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nf-eyebrow {
  font-family: var(--mc-mono); font-size: 11.5px; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--mc-blue); margin: 0 0 14px;
}
.nf-h1 {
  font-family: var(--mc-display); font-weight: 700; font-size: clamp(34px, 6vw, 56px);
  line-height: 1.03; letter-spacing: -1.4px; margin: 0; color: var(--mc-text);
}
.nf-h1 .b { color: var(--mc-blue); }
.nf-sub { font-size: 15.5px; color: var(--mc-mut); line-height: 1.6; margin: 20px auto 30px; max-width: 440px; }
.nf-cta { display: flex; gap: 13px; justify-content: center; flex-wrap: wrap; }
.nf-btn {
  font-family: var(--mc-display); font-size: 15px; font-weight: 500; text-decoration: none;
  border-radius: 10px; padding: 12px 20px; border: 1px solid var(--mc-line-2);
  background: var(--mc-panel-2); color: var(--mc-text);
  transition: border-color 0.15s var(--mc-ease), background 0.15s var(--mc-ease);
}
.nf-btn:hover { border-color: var(--mc-mut); }
.nf-btn--primary { background: var(--mc-blue); border-color: var(--mc-blue); color: var(--mc-blue-ink); font-weight: 600; }
.nf-btn--primary:hover { background: #74b1ff; }
</style>
