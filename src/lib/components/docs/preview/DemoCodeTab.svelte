<script lang="ts">
	import CliInstall from './CliInstall.svelte';
	import CodeBlock from './CodeBlock.svelte';

	type Props = {
		slug: string;
		usage: string;
		source: string;
	};

	let { slug, usage, source }: Props = $props();
</script>

<CliInstall {slug} />
<h3 class="demo-title-extra">Usage</h3>
<CodeBlock code={usage} language="svelte" />
<h3 class="demo-title-extra">Component source</h3>
<CodeBlock code={source} language="svelte" />
