#!/usr/bin/env node
/**
 * Free a TCP port before starting dev (fixes zombie Vite from old `vercel dev` sessions).
 * Usage: node scripts/free-dev-port.mjs 3000
 */
import { execSync } from 'node:child_process';

const port = process.argv[2] || '3000';

try {
  const out = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
  if (!out) process.exit(0);
  const pids = out.split(/\s+/).filter(Boolean);
  for (const pid of pids) {
    try {
      execSync(`kill ${pid}`);
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`Force-stopped process ${pid} on port ${port}`);
      } catch {
        console.warn(`Could not stop PID ${pid}`);
      }
    }
  }
} catch {
  /* port already free */
}
