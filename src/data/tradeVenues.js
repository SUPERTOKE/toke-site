import coinbaseWordmark from '../assets/logos/trade/coinbase-wordmark.svg';
import coinbaseIcon from '../assets/logos/trade/app-icons/coinbase.png';
import jupiterIcon from '../assets/logos/trade/app-icons/jupiter.png';
import phantomIcon from '../assets/logos/trade/app-icons/phantom.png';
import backpackIcon from '../assets/logos/trade/app-icons/backpack.png';
import solflareIcon from '../assets/logos/trade/app-icons/solflare.png';
import okxIcon from '../assets/logos/trade/app-icons/okx.png';

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
  'grid mx-auto w-full max-w-[13.8rem] sm:max-w-[15.6rem] grid-cols-2 gap-[0.7rem] sm:gap-[0.8rem]';

export const swapTileClass =
  'aspect-square w-full min-h-0 p-[0.6rem] sm:p-[0.7rem]';

/** Footer Trade column — logo links, same URLs as Trade section. */
export const footerTradeLinks = [
  { label: 'Coinbase', href: coinbaseVenue.href, logo: coinbaseIcon },
  ...swapVenues.map((venue) => ({
    label: venue.name,
    href: venue.href,
    logo: venue.logo,
  })),
  {
    label: 'OKX',
    href: 'https://www.okx.com/en-us/trade-cedefi/solana/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo#workspaceId=1779995474896',
    logo: okxIcon,
  },
];
