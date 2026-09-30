/**
 * CLI entry point for seeding the Aletheia prototype database.
 *
 *   npm run db:seed    — seed only when the database is empty
 *   npm run db:reset   — wipe and re-seed
 *
 * The actual seed logic lives in src/lib/db/seed.ts so the same deterministic
 * data can also be applied automatically on first database open (serverless).
 */

import { seedDatabase } from '../src/lib/db/seed';

const RESET = process.argv.includes('--reset');

seedDatabase({ reset: RESET, log: true });