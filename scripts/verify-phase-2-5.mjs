/**
 * Phase 2.5 verification gate — runs lint/build/validate/test for web + api in order.
 * Stops on first failure. See docs/PHASE_2_5_STABILIZATION_PLAN.md (M5).
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const steps = [
  { label: 'web lint', argv: ['pnpm@9.15.4', '--filter', 'web', 'lint'] },
  { label: 'web build', argv: ['pnpm@9.15.4', '--filter', 'web', 'build'] },
  { label: 'api lint', argv: ['pnpm@9.15.4', '--filter', 'api', 'lint'] },
  { label: 'api build', argv: ['pnpm@9.15.4', '--filter', 'api', 'build'] },
  {
    label: 'api prisma validate',
    argv: ['pnpm@9.15.4', '--filter', 'api', 'exec', 'prisma', 'validate'],
  },
  { label: 'api test', argv: ['pnpm@9.15.4', '--filter', 'api', 'test'] },
];

function runStep(label, argv) {
  // shell: true keeps Windows + Unix PATH resolution for `npx` consistent.
  const result = spawnSync('npx', argv, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  const code = result.status ?? (result.signal ? 1 : 0);
  if (code !== 0) {
    console.error(`\n[verify:phase2.5] FAILED step: "${label}" (exit ${code})\n`);
    process.exit(code);
  }
}

console.error('\n[verify:phase2.5] Starting Phase 2.5 verification gate…\n');

for (const { label, argv } of steps) {
  console.error(`[verify:phase2.5] → ${label}\n`);
  runStep(label, argv);
}

console.error('\n[verify:phase2.5] All steps passed.\n');
process.exit(0);
