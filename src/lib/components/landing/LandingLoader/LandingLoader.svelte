<script lang="ts">
	import iconSvg from '$lib/assets/logo/svelte-bits-icon-logo.svg?raw';
	import './LandingLoader.css';

	type Props = {
		hiding?: boolean;
	};

	let { hiding = false }: Props = $props();

	const logo = iconSvg.replace(
		'<svg ',
		'<svg class="ln-loader-logo" width="35" height="40" aria-hidden="true" focusable="false" '
	).replace(/ width="186" height="216"/, '');
</script>

<div
	class="ln-loader{hiding ? ' ln-loader--hide' : ''}"
	role="status"
	aria-label="Loading Svelte Bits"
	aria-hidden={hiding || undefined}
>
	{@html logo}
</div>
