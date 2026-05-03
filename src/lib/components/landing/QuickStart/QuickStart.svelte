<script lang="ts">
	import { onMount } from 'svelte';
	import {
		PKG_TO_RUNNER,
		RUNNER_TO_PKG,
		RUNNERS,
		shadcnCommand,
		type PackageManager,
		type Runner
	} from '$lib/constants/cli';
	import './QuickStart.css';

	// We feature Aurora as the showcase install (matches react-bits' featured-install pattern).
	const FEATURED_SLUG = 'aurora';

	let pkg: PackageManager = $state('npm');
	let dropOpen = $state(false);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;
	let dropdownEl = $state<HTMLDivElement | null>(null);

	let headerEl = $state<HTMLDivElement | null>(null);
	let terminalEl = $state<HTMLDivElement | null>(null);
	let headerVisible = $state(false);
	let terminalVisible = $state(false);

	const runner = $derived<Runner>(PKG_TO_RUNNER[pkg]);
	const command = $derived(shadcnCommand(FEATURED_SLUG, pkg));

	function pickRunner(r: Runner) {
		pkg = RUNNER_TO_PKG[r];
		dropOpen = false;
	}

	function copy() {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return;
		navigator.clipboard.writeText(command);
		copied = true;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}

	function onDocClick(e: MouseEvent) {
		if (!dropOpen) return;
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) dropOpen = false;
	}

	onMount(() => {
		const observe = (el: HTMLElement | null, set: (v: boolean) => void) => {
			if (!el) return null;
			const io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							set(true);
							io.disconnect();
						}
					}
				},
				{ threshold: 0.1, rootMargin: '-60px' }
			);
			io.observe(el);
			return io;
		};

		const obs = [
			observe(headerEl, (v) => (headerVisible = v)),
			observe(terminalEl, (v) => (terminalVisible = v))
		];
		document.addEventListener('click', onDocClick);

		return () => {
			obs.forEach((o) => o?.disconnect());
			document.removeEventListener('click', onDocClick);
			if (copyTimer) clearTimeout(copyTimer);
		};
	});
</script>

<section class="ln-qs-section">
	<div class="ln-qs-inner">
		<div bind:this={headerEl} class="ln-qs-header" class:is-visible={headerVisible}>
			<h2 class="ln-qs-title">Get started in seconds</h2>
		</div>

		<div bind:this={terminalEl} class="ln-qs-terminal-wrap" class:is-visible={terminalVisible}>
			<div class="ln-qs-glow"></div>
			<div class="ln-qs-terminal">
				<div class="ln-qs-tab-bar">
					<div class="ln-qs-tabs">
						<button type="button" class="ln-qs-tab ln-qs-tab--active">shadcn</button>
					</div>

					<div class="ln-qs-tab-bar-right">
						<div class="ln-qs-runner-dropdown" bind:this={dropdownEl}>
							<button
								type="button"
								class="ln-qs-runner-trigger"
								onclick={(e) => {
									e.stopPropagation();
									dropOpen = !dropOpen;
								}}
							>
								{runner}
								<svg
									class="ln-qs-caret"
									class:open={dropOpen}
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.4"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							<div class="ln-qs-runner-menu" class:open={dropOpen}>
								{#each RUNNERS as r (r)}
									<button
										type="button"
										class="ln-qs-runner-item"
										class:active={runner === r}
										onclick={() => pickRunner(r)}
									>
										{r}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="ln-qs-cmd-area">
					<div class="ln-qs-cmd-line">
						<span class="ln-qs-prompt">~</span>
						<code class="ln-qs-cmd-text">{command}</code>
					</div>
					<button
						type="button"
						class="ln-qs-copy"
						class:ln-qs-copy--done={copied}
						onclick={copy}
						aria-label="Copy command"
					>
						{#if copied}
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{:else}
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<p class="ln-qs-hint">
				Works in any Svelte or SvelteKit project. Components are copied into your codebase —
				browse the <a href="/get-started/introduction">docs</a> for the full list.
			</p>
		</div>
	</div>
</section>
