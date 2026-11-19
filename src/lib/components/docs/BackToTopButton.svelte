<script lang="ts">
	import { toast } from 'svelte-sonner';

	const MESSAGES = [
		'🐴  Country roads, take me home!',
		'🚀  To infinity and beyond!',
		'🦾  Get to the choppa!',
		'🚕  Grove Street, home...',
		'🐉  Fus Ro Dah!',
		'🍄  The princess is in another castle!',
		'🦸‍♂️  Avengers, assemble!',
		'🗡️  It’s dangerous to go alone! Take this.',
		'📜  A wizard is never late.',
		'💍  Foul Tarnished, in search of the Elden Ring!',
		'🐊  See you later, alligator.',
		'🔥  Dracarys!'
	];

	let visible = $state(false);

	function scrollToTop() {
		if (!visible) return;
		window.scrollTo(0, 0);
		toast(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
	}

	$effect(() => {
		const onScroll = () => (visible = window.scrollY > 500);
		onScroll();
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<button
	type="button"
	class="back-to-top"
	class:is-visible={visible}
	aria-hidden={!visible}
	tabindex={visible ? 0 : -1}
	aria-label="Back to top"
	onclick={scrollToTop}
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg
	>
</button>

<style>
	.back-to-top {
		position: fixed;
		z-index: 98;
		bottom: 1em;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		min-width: 44px;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 12px;
		background: var(--surface-ghost);
		box-shadow: var(--surface-ghost-highlight);
		backdrop-filter: var(--surface-ghost-blur);
		-webkit-backdrop-filter: var(--surface-ghost-blur);
		color: var(--text-primary);
		font-weight: 500;
		opacity: 0;
		cursor: default;
		right: calc(
			var(--app-gutter, 32px) + var(--content-inset-right, 0px) +
				max(
					0px,
					(
							100% - 2 * var(--app-gutter, 32px) - var(--content-inset-left, 0px) -
								var(--content-inset-right, 0px) - var(--content-col-max, 1080px)
						) / 2
				)
		);
		transition:
			opacity var(--transition-slow),
			transform var(--dur-press) var(--ease-out);
	}

	.back-to-top.is-visible {
		bottom: 2.5em;
		opacity: 1;
		cursor: pointer;
	}

	.back-to-top:active {
		transform: scale(0.94);
	}

	.back-to-top:hover {
		background: var(--surface-ghost-hover);
	}

	:global(:root[data-theme='light']) .back-to-top {
		border-color: var(--border-subtle);
		background: #fafafa;
		box-shadow: none;
	}

	:global(:root[data-theme='light']) .back-to-top::before {
		content: '';
		position: absolute;
		inset: 4px;
		border: 1px solid var(--inset-border);
		border-radius: 8px;
		background: #fff;
		pointer-events: none;
	}

	:global(:root[data-theme='light']) .back-to-top svg {
		position: relative;
		z-index: 1;
	}

	:global(:root[data-theme='light']) .back-to-top:hover {
		background: #f7f7f8;
	}

	@media only screen and (max-width: 1000px) {
		.back-to-top,
		.back-to-top.is-visible {
			bottom: calc(84px + env(safe-area-inset-bottom));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-to-top:active {
			transform: none;
		}
	}
</style>
