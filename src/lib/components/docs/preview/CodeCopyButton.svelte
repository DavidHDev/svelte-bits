<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { codeString?: string };

	let { codeString = '' }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(codeString);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch (error) {
			console.error('Failed to copy text: ', error);
		}
	}

	$effect(() => () => clearTimeout(timer));
</script>

{#if codeString}
	<button
		type="button"
		class="docs-copy-button"
		class:docs-copy-button--done={copied}
		onclick={handleCopy}
		title={copied ? 'Copied!' : 'Copy to clipboard'}
		aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
	>
		<Icon name={copied ? 'TbCheck' : 'TbCopy'} size={16} />
	</button>
{/if}
