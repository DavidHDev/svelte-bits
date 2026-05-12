import { defineConfig, Config } from 'jsrepo';

import { componentDependenciesOutput } from './scripts/component-dependencies-output.js';
import { getRegistryItems } from './scripts/registry-items.js';
import { stripSvelteBitsHeader } from './src/lib/utils/svelte-bits-source-header';
// soon
// import { output as shadcnSvelteOutput } from '@jsrepo/shadcn-svelte';
import { output as shadcnOutput } from '@jsrepo/shadcn';

export default defineConfig({
	registry: async ({ cwd }) => ({
		name: 'svelte-bits',
		homepage: 'https://sveltebits.xyz',
		excludeDeps: ['svelte', '@sveltejs/kit'],
		outputs: [
			shadcnOutput({ dir: './static/r', format: true }),
			componentDependenciesOutput({ path: './src/lib/constants/componentDependencies.ts' })
		],
		items: await getRegistryItems(cwd),
		defaultPaths: {
			component: '$lib/components'
		}
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
