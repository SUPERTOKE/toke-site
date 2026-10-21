/**
 * Owner-written sections of the Tokenholder Report. Everything numeric on the page comes from the
 * pipeline (prospectus.json / oracle / status); this file holds only prose and the roadmap. Edits are
 * versioned by git — bump `lastEdited` when you change a section.
 *
 * Drafted 2026-10-14 by the agent from the KB and handoffs for OG's review. Lines marked [OG] need
 * the owner's call; counsel reviews `risks` and `disclosures` before publish.
 */

export const summary = {
  lastEdited: '2026-10-21',
  text:
    '$TOKE (McToken) is a community-run SPL token on Solana, first seen on-chain in June 2023, with a capped ' +
    'supply of 420,000,069 (0.07% burned, mint authority revoked), three annual on-chain governance votes — the ' +
    'latest of which passed — and a public ledger of every wallet that has ever held it. There is no ' +
    'revenue-generating product today. Figures on this page are generated from public on-chain data and named ' +
    'market sources; prose sections are owner-written and dated. The page is regenerated every six hours by the ' +
    'same self-checking pipeline that feeds the Explorer.',
};

export const treasuryPolicy = {
  lastEdited: '2026-10-21',
  text:
    'DAO-related wallets fall into three tiers: (1) council-controlled — the TOKE Council wallet and the Align ' +
    'org wallet; (2) member-controlled escrow — the Realms deposits, owned by the individuals who deposited them; ' +
    '(3) member-controlled individual — every wallet that has voted in a DAO proposal, including council members\' ' +
    'own wallets, shown only in aggregate. The TOKE Council treasury (tokecouncil.sol) received 28,474,786 ' +
    '$TOKE from the McVault under TIP-4, approved on-chain on 2026-04-23 after the 2026 Great McVote passed; it is ' +
    'held by the elected council; today it is a standard wallet with a single signing key. Its only spend to date is the vote payout: on ' +
    '2026-04-28 it distributed 13,742,077 $TOKE to 43 of the 44 wallets on the 2026 McVote roll; the 44th is the ' +
    'council wallet itself, which voted with 10,000,000 $TOKE and took no allocation. The Align org ' +
    'wallet is the DAO\'s earlier ' +
    'treasury, program-governed under Align (multisig-style), dormant since January 2025. The McVault is the ' +
    'original Realms treasury, emptied by TIP-4. The Realms escrow is not treasury: it holds members\' voting ' +
    'deposits, which depositors withdraw at will. There is no written spend rule yet. Until the council adopts ' +
    'one, this table is the policy: every balance and 30-day flow is published on each run, and any movement out ' +
    'of the council wallet appears here within six hours.',
};

export const governanceHow = {
  lastEdited: '2026-10-21',
  mechanism:
    'Annual Great McVote on 4/20 via SPL Governance (Realms). A proposal passes when wallets holding at ' +
    'least 60% of supply vote Yes. Votes are weighted by balance and recorded on-chain; commemorative NFTs ' +
    'mark participation.',
  proposals:
    'The council drafts each proposal; holders discuss it in the X group chat and Discord; the vote opens on ' +
    'the Realms DAO on 4/20. Six proposals have been created since 2024: the three annual McVotes, the TIP-4 ' +
    'execution vote, and two cancelled 2024 proposals (one of which sought to lower the quorum to 5%). No formal ' +
    'proposal threshold or notice period has been adopted yet.',
  nextAgenda: 'No agenda has been set. The council will publish one here before 2027-04-20.',
};

export const risks = {
  lastEdited: '2026-10-21',
  items: [
    { t: 'Volatility and thin liquidity', d: 'Pooled liquidity is small. Modest orders move the price materially; exits may be slow or costly.' },
    { t: 'Concentration', d: 'A small number of wallets and pools hold most of the supply. Large holders can move the market or decide votes.' },
    { t: 'No revenue', d: '$TOKE has no product generating fees. Any value is community- and market-driven only.' },
    { t: 'Treasury custody', d: 'The council treasury (about 5.9% of supply) is a standard wallet controlled by a single signing key. There is no multisig or on-chain spend limit yet; loss or misuse of that key would be unrecoverable.' },
    { t: 'Mutable metadata', d: 'The token\'s name, symbol and image can still be changed by the holder of the metadata authority. Supply cannot: mint and freeze authorities are revoked.' },
    { t: 'Contributor dependence', d: 'Infrastructure, data and governance depend on a small, partly pseudonymous group. The data pipeline is maintained by one operator; if it stopped, this page would keep serving its last-good data and say so, but would no longer update.' },
    { t: 'Regulatory uncertainty', d: 'The legal treatment of tokens and DAOs varies by jurisdiction and may change. Nothing on this page has been reviewed by counsel.' },
    { t: 'Technical and data risk', d: 'Pools, programs and the data pipeline can fail. When any check fails, nothing new is published; this page serves last-known-good data and says so.' },
  ],
};

export const roadmap = {
  lastEdited: '2026-10-21',
  items: [
    { state: 'done', t: 'Reporting layer', d: 'This report, the self-checking pipeline, the Explorer, the oracle and the status page. Every figure carries its source and a timestamp.' },
    { state: 'in progress', t: 'Treasury and governance scaffolding', d: 'Treasury policy published (this page, 2026-10-21). Next: a multisig for the council wallet, a written spend rule, and a formal proposal threshold and notice period — all before the 2027 vote.' },
    { state: 'next', t: 'Revenue engine', d: 'A TOKE-native fee source. Until one exists, revenue is reported as none.' },
    { state: 'later', t: 'Buyback / burn policy', d: 'A published rule, executed on-chain and reported here — only once there is revenue to fund it.' },
    { state: 'optional', t: 'Public-vehicle optionality', d: 'Keep reporting in a diligence-ready shape. No action planned.' },
  ],
};

export const contributors = {
  lastEdited: '2026-10-21',
  note: 'Pseudonymous where that is the norm. Nothing from the private knowledge base is ever published.',
  items: [
    { role: 'Council', who: '5 elected members' },
    { role: 'Infrastructure and data', who: 'supertoke.sol' },
    { role: 'Community and X', who: 'pulselabs.sol' },
  ],
};

export const disclosures = {
  lastEdited: '2026-10-21',
  text:
    'This report is informational. It is not an offer to sell or a solicitation to buy any token or security, ' +
    'and nothing here is investment, legal or tax advice. Figures are generated from public on-chain data and ' +
    'named market sources by an automated pipeline and may contain errors; each carries a source and a timestamp. ' +
    'Prose sections are written by the operator and dated; no part of this page has been reviewed by counsel. ' +
    'Past activity does not indicate future results. The quarterly editions below are frozen copies of the data ' +
    'as published on the first run of each quarter.',
};
