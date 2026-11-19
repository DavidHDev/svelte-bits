<script lang="ts">
	import { page } from '$app/state';
	import CliInstall from './CliInstall.svelte';
	import CodeSection from './CodeSection.svelte';
	import CodeHighlighter from './CodeHighlighter.svelte';
	import CodeCopyButton from './CodeCopyButton.svelte';
	import { getDemoContext } from './lib/componentProps.svelte';
	import { injectPropsIntoCode } from './lib/codeGeneration';
	import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';

	type Extra = { title: string; code: string; language?: string };

	type Props = {
		usage?: string;
		source?: string;
		componentName?: string;
		slug?: string;
		dependencies?: string[];
		extras?: Extra[];
	};

	let { usage, source, componentName, slug, dependencies, extras = [] }: Props = $props();

	const demo = getDemoContext();

	const usageCode = $derived(usage ?? demo?.usage ?? '');
	const sourceCode = $derived(stripSvelteBitsHeader(source ?? demo?.source ?? ''));
	const name = $derived(componentName ?? demo?.componentName ?? '');
	const itemSlug = $derived(slug ?? page.params.subcategory ?? '');
	const deps = $derived(dependencies ?? demo?.dependencies);

	const dynamicUsage = $derived.by(() => {
		const props = demo?.props ?? {};
		if (!usageCode || !name || Object.keys(props).length === 0) return usageCode;
		return injectPropsIntoCode(usageCode, { ...props, ...(demo?.computedProps ?? {}) }, {}, name, demo?.demoOnlyProps ?? []);
	});
</script>

<CliInstall slug={itemSlug} dependencies={deps} />

{#if dynamicUsage}
	<CodeSection title="Usage" note={demo?.hasChanges ? 'With your settings' : null}>
		{#snippet actions()}
			<CodeCopyButton codeString={dynamicUsage} />
		{/snippet}
		<CodeHighlighter snippetId="usage" language="svelte" codeString={dynamicUsage} showCopyButton={false} />
	</CodeSection>
{/if}

{#if sourceCode}
	<CodeSection title="Code">
		{#snippet actions()}
			<CodeCopyButton codeString={sourceCode} />
		{/snippet}
		<CodeHighlighter snippetId="code" language="svelte" codeString={sourceCode} showCopyButton={false} />
	</CodeSection>
{/if}

{#each extras as extra (extra.title)}
	<CodeSection title={extra.title}>
		{#snippet actions()}
			<CodeCopyButton codeString={extra.code} />
		{/snippet}
		<CodeHighlighter snippetId={extra.title} language={extra.language ?? 'svelte'} codeString={extra.code} showCopyButton={false} />
	</CodeSection>
{/each}
