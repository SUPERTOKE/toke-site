/* ============================================================================
   In-page $TOKE swap — Jupiter Plugin (modal mode).
   One call, openBuyToke(), opens the exact jup.ag swap experience in an overlay,
   preset to buy $TOKE with SOL. No RPC, no API key; Jupiter "Ultra" handles
   routing, slippage, MEV protection and tx sending, and provides the wallet
   connection (Phantom / Solflare / Backpack …) out of the box.
   Docs: https://dev.jup.ag/tool-kits/plugin
   ========================================================================== */

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const TOKE_MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';
const PLUGIN_SRC = 'https://plugin.jup.ag/plugin-v1.js';

/* ── Integrator fee ──────────────────────────────────────────────────────────
   To collect the ~1% fee on swaps routed through the embed, create a Jupiter
   referral account at https://referral.jup.ag (one-time, needs your wallet),
   then paste its public key below. While empty, the swap works normally with
   NO fee added — so the embed ships and functions today; the fee turns on the
   moment a referral account is set.                                            */
const REFERRAL_ACCOUNT = ''; // ← paste Jupiter referral account pubkey to enable the fee
const REFERRAL_FEE_BPS = 100; // 100 bps = 1%

/* Graceful fallback if the plugin script is blocked / fails to load. */
export const FALLBACK_URL = `https://jup.ag/tokens/${TOKE_MINT}`;
export { TOKE_MINT };

let scriptPromise = null;
let initialized = false;

function loadPlugin() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.Jupiter) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PLUGIN_SRC}"]`);
    if (existing) {
      if (window.Jupiter) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = PLUGIN_SRC;
    s.defer = true;
    s.setAttribute('data-preload', '');
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/* Optionally warm the script up (e.g. on app mount) so the first click is instant. */
export function preloadBuyToke() {
  loadPlugin().catch(() => {});
}

export async function openBuyToke() {
  let ok = true;
  try {
    await loadPlugin();
  } catch {
    ok = false;
  }
  const J = ok && window.Jupiter;
  if (!J || typeof J.init !== 'function') {
    window.open(FALLBACK_URL, '_blank', 'noopener');
    return;
  }

  if (initialized) {
    J.resume();
    return;
  }

  const formProps = {
    initialInputMint: SOL_MINT,
    initialOutputMint: TOKE_MINT,
    fixedMint: TOKE_MINT, // lock the receive side to $TOKE — this is a "buy $TOKE" box
  };
  if (REFERRAL_ACCOUNT) {
    formProps.referralAccount = REFERRAL_ACCOUNT;
    formProps.referralFee = REFERRAL_FEE_BPS;
  }

  J.init({
    displayMode: 'modal',
    defaultExplorer: 'Solscan',
    formProps,
    branding: { name: 'McToken', logoUri: '/moonman.png' },
  });
  initialized = true;
}
