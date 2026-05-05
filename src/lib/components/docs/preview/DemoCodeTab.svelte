<script lang="ts">
	import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
	import CliInstall from './CliInstall.svelte';
	import CodeBlock from './CodeBlock.svelte';

	type Props = {
		slug: string;
		usage: string;
		source: string;
	};

	let { slug, usage, source }: Props = $props();
	
	/** Mirrors registry installs: omit internal `<!-- @svelte-bits -->` metadata. */
	const sourceForDocs = $derived(stripSvelteBitsHeader(source));
</script>

<CliInstall {slug} />
<h3 class="demo-title-extra">Usage</h3>
<CodeBlock code={usage} language="svelte" />
<h3 class="demo-title-extra">Component source</h3>
<CodeBlock code={sourceForDocs} language="svelte" />
