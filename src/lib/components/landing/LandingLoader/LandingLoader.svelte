<script lang="ts">
	import logo from '$lib/assets/logo/svelte-bits-logo.svg';
	import './LandingLoader.css';

	type Props = {
		hiding?: boolean;
	};

	let { hiding = false }: Props = $props();
</script>

<div class="ln-loader {hiding ? 'ln-loader--hide' : ''}">
	<span class="ln-loader-logo" aria-hidden="true"><img src={logo} alt="" /></span>
</div>
