import solscanIcon from '../assets/logos/explorers/app-icons/solscan.png';
import orbIcon from '../assets/logos/explorers/app-icons/orb.png';
import solanaExplorerIcon from '../assets/logos/explorers/app-icons/solana-explorer-icon-filled-256.png';
import tokeExplorerIcon from '../assets/logo.png';
import { TOKE_MINT } from './tradeVenues.js';

/** Footer Explorers column */
export const footerExplorerLinks = [
  {
    label: 'TOKE Explorer',
    href: 'https://explorer.mctoken.xyz',
    logo: tokeExplorerIcon,
    logoTile: true,
    logoTileScale: 0.8,
  },
  {
    label: 'Solscan',
    href: `https://solscan.io/token/${TOKE_MINT}`,
    logo: solscanIcon,
    logoTile: true,
    logoTileScale: 0.68,
  },
  {
    label: 'Orb',
    href: `https://orbmarkets.io/token/${TOKE_MINT}`,
    logo: orbIcon,
    logoTile: true,
    logoTileScale: 0.76,
  },
  {
    label: 'Solana Explorer',
    href: `https://explorer.solana.com/address/${TOKE_MINT}`,
    logo: solanaExplorerIcon,
  },
];
