// CLI command helpers for the shadcn registry.
//
// All implemented components are published as static JSON at
// https://sveltebits.xyz/r/<name>.json (see scripts/build-registry.ts).
// Users install them via `shadcn`, which works in any Svelte/SvelteKit project.

import { IMPLEMENTED_DEMOS } from './categories';

export const REGISTRY_BASE = 'https://sveltebits.xyz/r';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type Runner = 'npx' | 'pnpm dlx' | 'yarn dlx' | 'bunx --bun';

export const PKG_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

export const PKG_TO_RUNNER: Record<PackageManager, Runner> = {
	npm: 'npx',
	pnpm: 'pnpm dlx',
	yarn: 'yarn dlx',
	bun: 'bunx --bun'
};

export const RUNNER_TO_PKG: Record<Runner, PackageManager> = {
	npx: 'npm',
	'pnpm dlx': 'pnpm',
	'yarn dlx': 'yarn',
	'bunx --bun': 'bun'
};

export const RUNNERS: Runner[] = ['npx', 'pnpm dlx', 'bunx --bun', 'yarn dlx'];

export const registryUrl = (slug: string): string => `${REGISTRY_BASE}/${slug}.json`;

export function shadcnCommand(slug: string, pkg: PackageManager): string {
	return `${PKG_TO_RUNNER[pkg]} shadcn@latest add ${registryUrl(slug)}`;
}

export const isInRegistry = (slug: string): boolean => IMPLEMENTED_DEMOS.has(slug);
