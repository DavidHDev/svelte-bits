<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import Footer from '$lib/components/landing/Footer/Footer.svelte';
	import Sidebar from './Sidebar.svelte';
	import '$lib/css/docs.css';
	import '$lib/css/preview.css';

	type Props = { children: Snippet };
	let { children }: Props = $props();

	let drawerOpen = $state(false);
	let drawerEl = $state<HTMLElement | null>(null);

	function toggle() {
		drawerOpen = !drawerOpen;
	}
	function close() {
		drawerOpen = false;
	}

	function getFocusable(container: HTMLElement) {
		return Array.from(
			container.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
	}

	$effect(() => {
		if (!drawerOpen || !drawerEl) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
				return;
			}
			if (event.key !== 'Tab') return;
			const focusable = getFocusable(drawerEl!);
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});
</script>

<div class="docs-app">
	<Navbar showDocs onhamburger={toggle} />

	<div
		class="docs-drawer-backdrop"
		data-open={drawerOpen}
		onclick={close}
		role="presentation"
	></div>

	<div
		class="docs-drawer"
		data-open={drawerOpen}
		bind:this={drawerEl}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-label="Docs navigation"
		aria-hidden={!drawerOpen}
		inert={!drawerOpen}
	>
		<Sidebar onnavigate={close} />
	</div>

	<div class="docs-wrapper">
		<Sidebar />
		{@render children()}
	</div>

	<Footer />
</div>

<style>
	/* The .docs-drawer Sidebar component is .sidebar (sticky) — override
	   inside the drawer so it flows naturally. */
	.docs-drawer :global(.sidebar) {
		position: static;
		padding: 0;
		margin-left: 0;
		max-width: none;
		width: 100%;
		height: auto;
		display: block;
	}
</style>
