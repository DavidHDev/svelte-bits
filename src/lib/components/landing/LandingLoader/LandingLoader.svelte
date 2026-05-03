<script lang="ts">
	import logoSvg from '$lib/assets/logo/svelte-bits-logo.svg?raw';
	import './LandingLoader.css';

	type Props = {
		hiding?: boolean;
	};

	let { hiding = false }: Props = $props();
</script>

<div class="ln-loader {hiding ? 'ln-loader--hide' : ''}">
	<span class="ln-loader-logo" aria-hidden="true">{@html logoSvg}</span>
</div>
