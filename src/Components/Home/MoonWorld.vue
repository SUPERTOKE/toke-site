<script setup>
import moonman from '../../assets/moonman-head.png';
</script>

<template>
  <section class="mw">
    <div class="mw-in">
      <div class="mw-grid">
        <div class="mw-art">
          <img class="mw-ill" :src="moonman" alt="Moon Man — McToken" width="150" height="150" />
        </div>
        <div class="mw-copy">
          <p class="mw-eyebrow"><span class="mw-dot" />The world</p>
          <h2 class="mw-h2">Moon Man &amp; <span class="b">$DANK.</span></h2>
          <p class="mw-lede">
            Every holder is a fellow Toker on the voyage. Moon Man digs toward the moon;
            $DANK, his cyborg moon-dog, rides shotgun.
          </p>
          <div class="mw-duo">
            <div class="mw-m">
              <div class="mw-nm">Moon Man <span class="mw-tag">$TOKE</span></div>
              <p>The blue astronaut explorer — the face of the voyage and the brand.</p>
            </div>
            <div class="mw-m">
              <div class="mw-nm">$DANK <span class="mw-tag">companion</span></div>
              <p>The cyborg moon-dog. TOKE’s paired companion asset and sidekick.</p>
            </div>
          </div>
          <div class="mw-voyage">
            <span class="mw-pill">Coming soon</span>
            <span class="mw-voyage-txt">Moon Man’s Voyage — an idle game that rewards <b>holding</b>, not spending.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mw { position: relative; background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.mw-h2, .mw-nm { color: var(--mc-text); }
.mw-in { max-width: 1180px; margin: 0 auto; padding: 72px 22px; }
.mw-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 34px; align-items: center; }
.mw-art { position: relative; display: flex; align-items: center; justify-content: center; min-height: 280px; border: 1px solid var(--mc-line); border-radius: 18px; background: radial-gradient(70% 70% at 50% 40%, rgba(90, 162, 255, 0.12), transparent 70%); }
.mw-ill { display: block; filter: drop-shadow(0 16px 36px rgba(90, 162, 255, 0.28)); }
.mw-eyebrow { font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.mw-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.mw-h2 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(28px, 4.5vw, 46px); letter-spacing: -1px; margin: 0 0 14px; line-height: 1.05; }
.mw-h2 .b { color: var(--mc-blue); }
.mw-lede { color: var(--mc-mut); font-size: 15.5px; line-height: 1.6; margin: 0 0 18px; max-width: 520px; }
.mw-duo { display: flex; gap: 14px; margin-top: 6px; }
.mw-m { flex: 1; background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 13px; padding: 15px; }
.mw-nm { font-family: var(--mc-display); font-weight: 600; font-size: 15px; }
.mw-tag { font-size: 10px; color: var(--mc-blue); font-family: var(--mc-mono); margin-left: 6px; }
.mw-m p { color: var(--mc-mut); font-size: 12.5px; margin: 6px 0 0; line-height: 1.5; }
.mw-voyage { margin-top: 20px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.mw-pill { font-family: var(--mc-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: var(--mc-gold); border: 1px solid rgba(231, 184, 74, 0.4); border-radius: 6px; padding: 3px 9px; }
.mw-voyage-txt { color: var(--mc-mut); font-size: 13.5px; }
.mw-voyage-txt b { color: var(--mc-text); }
@media (max-width: 760px) { .mw-grid { grid-template-columns: 1fr; } .mw-art { min-height: 220px; } }
</style>
