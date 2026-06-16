import { ref } from 'vue';
import { statNum, formatTokePriceDisplay } from './statsApi.js';

/** Shared with navbar pill + hero 24 hr price card. */
export const tokePriceDisplay = ref('—');
export const isTokePriceStale = ref(false);

let lastKnownTokePriceDisplay = null;

export function applyTokePriceFromPayload(payload) {
  const priceNumber = statNum(payload?.price);
  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    throw new Error('Received invalid price payload');
  }

  const formatted = formatTokePriceDisplay(priceNumber);
  tokePriceDisplay.value = formatted;
  lastKnownTokePriceDisplay = formatted;
  isTokePriceStale.value = false;
}

export function applyTokePriceOnError() {
  tokePriceDisplay.value = lastKnownTokePriceDisplay ?? '—';
  isTokePriceStale.value = true;
}
