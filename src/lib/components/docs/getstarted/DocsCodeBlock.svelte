<script lang="ts">
	import ShikiCode from '$lib/components/docs/preview/ShikiCode.svelte';
	import Icon from '$lib/components/docs/preview/Icon.svelte';

	type Props = { code: string; language?: string; showLineNumbers?: boolean };
	let { code, language = 'svelte', showLineNumbers = false }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(String(code).trim());
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div class="docs-code">
	<div class="docs-code-header">
		<button
			type="button"
			class="docs-copy-button"
			onclick={handleCopy}
			title={copied ? 'Copied!' : 'Copy to clipboard'}
			aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
		>
			<Icon name={copied ? 'TbCheck' : 'TbCopy'} size={16} />
		</button>
	</div>
	<ShikiCode {code} {language} {showLineNumbers} />
</div>
