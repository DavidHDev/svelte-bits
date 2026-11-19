<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import Icon from '$lib/components/docs/preview/Icon.svelte';

	type Props = { class?: string };

	let { class: className = 'ln-navbar-icon-btn ln-navbar-theme-btn' }: Props = $props();

	let mounted = $state(false);

	$effect(() => {
		mounted = true;
	});

	const isLight = $derived(mounted && theme.isLight);
</script>

<button
	type="button"
	class={className}
	onclick={theme.toggleColorMode}
	aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
	title={isLight ? 'Dark mode' : 'Light mode'}
>
	<Icon name={isLight ? 'LuMoon' : 'LuSun'} size={16} />
</button>
