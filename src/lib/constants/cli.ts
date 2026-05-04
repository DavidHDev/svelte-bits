// CLI command helpers for the public registry.
//
// Manifest and items are built with `pnpm run registry:build` (jsrepo) into `static/r/`.
// Per-item URLs are `{REGISTRY_BASE}/<slug>.json`; jsrepo resolves the manifest by loading
// `registry.json` under that directory. Point `jsrepo init` at `REGISTRY_BASE` (same as the HTTPS site path).

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

/**
 * Printed in documentation: configure the registry in the user's project (`jsrepo init`), then install an item (`jsrepo add`).
 *
 * Uses the project's package runner (`npx`, `pnpm dlx`, ...) so installs work without a global jsrepo install.
 */
export function jsrepoInitThenAddSnippet(slug: string, pkg: PackageManager): string {
	const runner = PKG_TO_RUNNER[pkg];
	return `${runner} jsrepo init ${REGISTRY_BASE}\n${runner} jsrepo add ${slug}`;
}

export const isInRegistry = (slug: string): boolean => IMPLEMENTED_DEMOS.has(slug);
