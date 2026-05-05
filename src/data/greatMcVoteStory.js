import graph1 from '../assets/graph1.png';
import mcVote2025 from '../assets/McVote_2025_Results.png';
import mcVote2026 from '../assets/McVote_2026_Results.png';

/** Total scroll track height (viewport units) for the pinned scrolly section */
export const SCROLL_VH = 300;

/** CTA after finale — same explorer as hero by default */
export const FINALE_CTA_HREF = 'https://explorer.mctoken.xyz/';

export const STEPS = [
  {
    id: 'step1',
    label: 'McVote #1',
    headline: 'The Great McVote 2024',
    body: [
      'The first Great McVote set the tone for what was possible.',
      'Strong participation kicked off the campaign and rallied the DAO.',
      'This round became the launch point for everything that followed.',
    ],
    uniqueVoters: 34,
    resultsHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/9VzHbqA9WoiXnyw1DxBT9oDW6RTUcaEgU9gpPgCM3qJ5',
    image: graph1,
  },
  {
    id: 'step2',
    label: 'McVote #2',
    headline: 'The Great McVote 2025',
    body: [
      'Momentum accelerated as more holders joined the mission.',
      'Participation climbed and conviction across the community deepened.',
      'The path to opening the vault became clearer with each vote.',
    ],
    uniqueVoters: 47,
    resultsHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/GHq9epLWw5823Pwr8XGHmD6esrAq5FVzpaToYC1KxKKS',
    image: mcVote2025,
  },
  {
    id: 'step3',
    label: 'McVote #3',
    headline: 'The Great McVote 2026',
    body: [
      'The final push delivered a historic community result.',
      'Participation stayed high and quorum was decisively cleared.',
      '69% voted YES.',
      '6.78% of supply—unlocked.',
    ],
    uniqueVoters: 44,
    resultsHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/5gJbKW2VsuPU2PmcVj9eJf6yW35CQksgvaz4viHAWA4z',
    image: mcVote2026,
  },
];

export const FINALE = {
  id: 'finale',
  headline: 'The Vaultbreaker Era Begins',
  ctaLabel: "Explore What's Next",
  ctaHref: FINALE_CTA_HREF,
};
