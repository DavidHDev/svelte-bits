<script lang="ts">
	import Icon from '$lib/components/docs/preview/Icon.svelte';

	type Props = { text: string; label?: string };
	let { text, label = 'Copy command' }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button
	type="button"
	class="docs-row-copy"
	onclick={copy}
	aria-label={copied ? 'Copied' : label}
	title={copied ? 'Copied!' : label}
>
	<Icon name={copied ? 'TbCheck' : 'TbCopy'} size={16} />
</button>
