import coinbaseWordmark from '../assets/logos/trade/coinbase-wordmark.svg';
import jupiterIcon from '../assets/logos/trade/app-icons/jupiter.png';
import phantomIcon from '../assets/logos/trade/app-icons/phantom.png';
import backpackIcon from '../assets/logos/trade/app-icons/backpack.png';
import solflareIcon from '../assets/logos/trade/app-icons/solflare.png';

export const TOKE_MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';

export const tokenOfficialInfo = {
  name: 'McToken',
  ticker: '$TOKE',
  mint: TOKE_MINT,
  disclaimer:
    'Always verify token information for safety. Use official links when possible.',
};

export const coinbaseVenue = {
  name: 'Coinbase',
  href: 'https://www.coinbase.com/price/mctoken-solana-amgumqeqw8h74trc8ukkjzzwtxbdps496wh4gly2mcpo-token',
  logo: coinbaseWordmark,
};

/** Swap venues shown inside the Jupiter-style card grid. */
export const swapVenues = [
  {
    name: 'Jupiter',
    href: `https://jup.ag/tokens/${TOKE_MINT}`,
    logo: jupiterIcon,
    logoClass: 'h-[82%] w-[82%] rounded-[22%] object-contain',
  },
  {
    name: 'Phantom',
    href: `https://trade.phantom.com/token/${TOKE_MINT}`,
    logo: phantomIcon,
    logoClass: 'h-[82%] w-[82%] rounded-[22%] object-contain',
  },
  {
    name: 'Backpack',
    href: `https://backpack.app/ul/v1/browse/${TOKE_MINT}`,
    logo: backpackIcon,
    logoClass: 'h-[82%] w-[82%] rounded-[22%] object-contain',
  },
  {
    name: 'Solflare',
    href: `https://www.solflare.com/prices/mctoken/${TOKE_MINT}`,
    logo: solflareIcon,
    logoClass: 'h-[82%] w-[82%] rounded-[22%] object-contain',
  },
];

export const swapTileGridClass =
  'grid w-full max-w-[17.25rem] sm:max-w-[19.5rem] mx-auto grid-cols-2 gap-3.5 sm:gap-4';

export const swapTileClass =
  'aspect-square w-full min-h-0 p-3 sm:p-3.5';
