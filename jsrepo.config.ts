import { defineConfig, fs, Config } from 'jsrepo';
import { distributed } from 'jsrepo/outputs';

import { getRegistryItems, stripSvelteBitsHeader } from './scripts/registry-items.js';

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
	providers: [fs()],
});

function stripSvelteBitsHeaderTransform(): NonNullable<Config['build']['transforms']>[number] {
	return {
		transform(content) {
			return { content: stripSvelteBitsHeader(content) };
		}
	}
}
