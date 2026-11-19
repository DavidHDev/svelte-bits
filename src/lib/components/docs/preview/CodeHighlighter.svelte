<script module lang="ts">
	const routeExpansionState: Record<string, Record<string, boolean>> = {};

	const hashSnippet = (str: string) => {
		if (!str) return 'empty';
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
			if (i > 500) break;
		}
		return hash.toString(36);
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import ShikiCode from './ShikiCode.svelte';
	import CodeCopyButton from './CodeCopyButton.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		language?: string;
		codeString: string;
		showLineNumbers?: boolean;
		maxLines?: number;
		snippetId?: string;
		showCopyButton?: boolean;
	};

	let {
		language = 'svelte',
		codeString,
		showLineNumbers = true,
		maxLines = 25,
		snippetId,
		showCopyButton = true
	}: Props = $props();

	const pathname = $derived(page.url.pathname);
	const key = $derived(snippetId || hashSnippet(`${codeString}|${language}`));
	let expanded = $state(false);

	$effect.pre(() => {
		expanded = routeExpansionState[pathname]?.[key] ?? false;
	});

	function toggle() {
		expanded = !expanded;
		if (!routeExpansionState[pathname]) routeExpansionState[pathname] = {};
		routeExpansionState[pathname][key] = expanded;
	}

	const codeLines = $derived(codeString ? codeString.split('\n').length : 0);
	const shouldCollapse = $derived(codeLines > maxLines);
</script>

<div style="position: relative;">
	<div
		style="position: relative; overflow: hidden; max-height: {shouldCollapse && !expanded
			? `calc(1.55em * ${maxLines} + 2.5rem)`
			: 'none'};"
	>
		{#if codeString}
			<ShikiCode code={codeString} {language} {showLineNumbers} />
		{:else}
			<div class="code-unsupported" style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
				<p style="margin: 0;">Sorry, this combination is not supported</p>
				<Icon name="TbMoodSad" size={16} />
			</div>
		{/if}

		{#if shouldCollapse && !expanded}
			<div
				style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(to bottom, transparent, var(--code-bg));"
			></div>
		{/if}

		{#if shouldCollapse}
			<button type="button" class="docs-expand-button" onclick={toggle}>
				{expanded ? 'Collapse Snippet' : 'Expand Snippet'}
			</button>
		{/if}
	</div>

	{#if codeString && showCopyButton}
		<div class="docs-code-header">
			<CodeCopyButton {codeString} />
		</div>
	{/if}
</div>
