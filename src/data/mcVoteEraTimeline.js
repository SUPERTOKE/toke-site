import greatMcVoteArt1 from '../assets/mcvote/great-mcvote-1.png';
import greatMcVoteArt2 from '../assets/mcvote/great-mcvote-2.png';
import greatMcVoteArt3 from '../assets/mcvote/great-mcvote-3.png';

/** Three Great McVote eras (proposal URLs from former greatMcVoteStory STEPS). */
export const ERA_TIMELINE = [
  {
    id: 'genesis',
    year: 2024,
    eraName: 'Genesis',
    mcVoteLabel: 'Great McVote #1',
    yesPercent: 37,
    notVotedPercent: 66,
    commemorativeArt: greatMcVoteArt1,
  },
  {
    id: 'ecosystem',
    year: 2025,
    eraName: 'Ecosystem',
    mcVoteLabel: 'Great McVote #2',
    yesPercent: 48,
    notVotedPercent: 45,
    commemorativeArt: greatMcVoteArt2,
  },
  {
    id: 'community',
    year: 2026,
    eraName: 'Community',
    mcVoteLabel: 'Great McVote #3',
    yesPercent: 69,
    notVotedPercent: 24,
    commemorativeArt: greatMcVoteArt3,
  },
];
