<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	import ProCard from '$lib/components/common/Pro/ProCard.svelte';
	import '$lib/css/docs.css';
	import '$lib/css/preview.css';
	import '$lib/css/color-picker.css';
	import '$lib/css/prop-table.css';
	import '$lib/css/component-page.css';
	import '$lib/css/background-content.css';

	type Props = { children: Snippet };
	let { children }: Props = $props();
</script>

<main class="app-container">
	<Navbar showDocs />
	<section class="category-wrapper">
		<Sidebar />
		{@render children()}

		<aside class="right-panel" aria-label="React Bits Pro">
			<div class="right-panel-inner">
				<ProCard />
			</div>
		</aside>

		<aside class="pro-card-inline" aria-label="React Bits Pro">
			<ProCard placement="mobile-card" />
		</aside>
	</section>
</main>
