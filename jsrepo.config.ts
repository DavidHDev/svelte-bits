import { defineConfig, Config } from 'jsrepo';
import { distributed } from 'jsrepo/outputs';

import { getRegistryItems } from './scripts/registry-items.js';
import { stripSvelteBitsHeader } from './src/lib/utils/svelte-bits-source-header';

export default defineConfig({
	registry: async ({ cwd }) => ({
		name: 'svelte-bits',
		homepage: 'https://sveltebits.xyz',
		excludeDeps: ['svelte', '@sveltejs/kit'],
		outputs: [distributed({ dir: './static/r' })],
		items: await getRegistryItems(cwd)
	}),
	build: {
		transforms: [stripSvelteBitsHeaderTransform()]
	},
	paths: {
		ui: '$lib/components/ui',
		component: '$lib/components',
		block: '$lib/components',
		hook: '$lib/hooks',
		action: '$lib/actions',
		util: '$lib/utils',
		lib: '$lib'
	},
	registries: ['@ieedan/shadcn-svelte-extras']
});

function stripSvelteBitsHeaderTransform(): NonNullable<Config['build']['transforms']>[number] {
	return {
		transform(content) {
			return { content: stripSvelteBitsHeader(content) };
		}
	}
}
