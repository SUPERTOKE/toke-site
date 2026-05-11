import graph1 from '../assets/graph1.png';
import mcVote2025 from '../assets/McVote_2025_Results.png';
import mcVote2026 from '../assets/McVote_2026_Results.png';
import vault from '../assets/vault.png';

/** CTA after finale — same explorer as hero by default */
export const FINALE_CTA_HREF = 'https://explorer.mctoken.xyz/';

export const STEPS = [
  {
    id: 'step0',
    label: 'Three years. One mission.',
    headline: 'The McVault',
    body: [
      'Idiot devs locked 7% of the supply total $TOKE supply.',
      '60% quorum YES votes required to unlock.',
      '1 $TOKE = 1 McVote.',
    ],
    emphasisLine: 'The Great McVote was held annually on 4/20.',
    actionLabel: 'McVAULT',
    actionHref: 'https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/treasury/v2',
    image: vault,
  },
  {
    id: 'step1',
    label: 'April 20, 2024',
    headline: 'Great McVote #1',
    body: [
      'The first Great McVote set the tone for what was possible.',
      'Strong participation kicked off the campaign and rallied the DAO.',
      'This round became the launch point for everything that followed.',
    ],
    metricLabel: 'Unique Voters:',
    metricValue: '34',
    actionLabel: 'Results',
    actionHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/9VzHbqA9WoiXnyw1DxBT9oDW6RTUcaEgU9gpPgCM3qJ5',
    image: graph1,
  },
  {
    id: 'step2',
    label: 'April 20, 2025',
    headline: 'Great McVote #2',
    body: [
      'Momentum accelerated as more holders joined the mission.',
      'Participation climbed and conviction across the community deepened.',
      'The path to opening the vault became clearer with each vote.',
    ],
    metricLabel: 'Unique Voters:',
    metricValue: '47',
    actionLabel: 'Results',
    actionHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/GHq9epLWw5823Pwr8XGHmD6esrAq5FVzpaToYC1KxKKS',
    image: mcVote2025,
  },
  {
    id: 'step3',
    label: 'April 20, 2026',
    headline: 'Great McVote #3',
    body: [
      'The final push delivered a historic community result.',
      'Participation stayed high and quorum was decisively cleared.',
      '69% voted YES.',
      '7% of supply—unlocked.',
    ],
    metricLabel: 'Unique Voters:',
    metricValue: '44',
    actionLabel: 'Results',
    actionHref: 'https://v2.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/5gJbKW2VsuPU2PmcVj9eJf6yW35CQksgvaz4viHAWA4z',
    image: mcVote2026,
  },
];

export const FINALE = {
  id: 'finale',
  headline: 'The Vaultbreaker Era Begins',
  ctaLabel: "Explore What's Next",
  ctaHref: FINALE_CTA_HREF,
};
