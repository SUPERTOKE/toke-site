// api/og.js — dynamic Open Graph image for mctoken.xyz with live $TOKE stats.
// Node serverless function (this project builds api/* as Node, not Edge): we render
// the @vercel/og image to a PNG buffer and write it with res.end(). Awaiting
// .arrayBuffer() means any render error is caught here → we 302 to the static
// /og-image.png, so social unfurls can never break.
import { ImageResponse } from '@vercel/og';
import React from 'react';

const h = React.createElement;
const ORACLE = process.env.TOKE_ORACLE_URL || 'https://api.mctoken.xyz/v1/oracle';
const STATIC_OG = 'https://mctoken.xyz/og-image.png';

function fmtPrice(n) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 8 });
}
function fmtCompact(n) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return '$' + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}
function fmtInt(n) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export default async function handler(req, res) {
  try {
    let price = NaN;
    let mcap = NaN;
    let holders = NaN;
    let chg = NaN;

    try {
      const r = await fetch(ORACLE, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        const d = (j && j.data) || {};
        price = Number(d.liquidity_weighted_price_usd);
        mcap = Number(d.implied_mcap_usd);
        holders = Number(d.holders);
        chg = Number(d.price_change_h24);
      }
    } catch {
      // leave numbers as NaN → cards show "—"; still renders a branded image
    }

    const chgStr = Number.isFinite(chg) ? (chg >= 0 ? '+' : '') + chg.toFixed(2) + '% 24h' : 'verify on-chain';
    const chgColor = Number.isFinite(chg) ? (chg >= 0 ? '#5ad1b3' : '#ff6b6b') : '#5b6472';

    const stats = [
      { label: 'PRICE', value: fmtPrice(price) },
      { label: 'MARKET CAP', value: fmtCompact(mcap) },
      { label: 'HOLDERS', value: fmtInt(holders) }
    ];

    const tree = h(
      'div',
      {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0a0c10 0%, #12101f 55%, #0a0c10 100%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif'
        }
      },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'baseline' } },
          h('span', { style: { fontSize: 100, fontWeight: 800, color: '#ffffff', letterSpacing: '-2px' } }, '$TOKE'),
          h('span', { style: { fontSize: 40, fontWeight: 600, color: '#9b8cff', marginLeft: 26 } }, 'McToken')
        ),
        h(
          'span',
          { style: { fontSize: 28, color: '#8b94a3', marginTop: 10 } },
          'Cannabis-inspired community token on Solana'
        )
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between' } },
        stats.map((s) =>
          h(
            'div',
            { key: s.label, style: { display: 'flex', flexDirection: 'column' } },
            h('span', { style: { fontSize: 24, color: '#8b94a3', letterSpacing: '2px' } }, s.label),
            h('span', { style: { fontSize: 58, fontWeight: 700, color: '#5ad1b3', marginTop: 10 } }, s.value)
          )
        )
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        h('span', { style: { fontSize: 32, fontWeight: 600, color: '#e7eaef' } }, 'mctoken.xyz'),
        h('span', { style: { fontSize: 30, color: chgColor } }, chgStr)
      )
    );

    const image = new ImageResponse(tree, { width: 1200, height: 630 });
    const arrayBuffer = await image.arrayBuffer();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.end(Buffer.from(arrayBuffer));
  } catch {
    // Total fallback (oracle/render failure) — never break unfurls.
    res.statusCode = 302;
    res.setHeader('Location', STATIC_OG);
    res.end();
  }
}
