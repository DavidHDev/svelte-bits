import { defineConfig, fs } from 'jsrepo';
import { distributed } from 'jsrepo/outputs';
import { svelte } from 'jsrepo/langs';
import { InvalidImportWarning } from 'jsrepo/warnings';

import { getRegistryItems, stripSvelteBitsHeader } from './scripts/registry-items.js';

const HOMEPAGE = 'https://sveltebits.xyz';

export default defineConfig({
	providers: [fs()],
	build: {
		// onwarn(warning, handler) {
		// 	if (warning instanceof InvalidImportWarning) {
		// 		// Aliases internal to consuming apps — not npm packages.
		// 		if (
		// 			warning.specifier.startsWith('$app/') ||
		// 			warning.specifier.startsWith('$env/') ||
		// 			warning.specifier === '$service-worker'
		// 		) {
		// 			return;
		// 		}
		// 	}
		// 	handler(warning);
		// },
		transforms: [
			{
				transform(content) {
					return { content: stripSvelteBitsHeader(content) };
				}
			}
		]
	},
	registry: async ({ cwd }) => ({
		name: 'svelte-bits',
		homepage: HOMEPAGE,
		excludeDeps: ['svelte', '@sveltejs/kit'],
		outputs: [distributed({ dir: './static/r' })],
		items: await getRegistryItems(cwd)
	}),
	paths: {
		component: ''
	}
});
