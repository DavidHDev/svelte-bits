<script lang="ts">
	import type { Snippet } from 'svelte';
	import { animate } from 'motion';
	import { portal } from './lib/portal';

	type TriggerProps = {
		onclick: (event: MouseEvent) => void;
		onkeydown: (event: KeyboardEvent) => void;
		'aria-haspopup': 'menu';
		'aria-expanded': boolean;
		'data-state': 'open' | 'closed';
	};

	type Props = {
		trigger: Snippet<[{ props: TriggerProps; open: boolean }]>;
		children: Snippet<[{ close: () => void }]>;
		placement?: 'bottom-end' | 'bottom-start';
		gutter?: number;
		offset?: number;
		minWidth?: string;
		contentClass?: string;
		fluid?: boolean;
		zIndex?: number;
	};

	let {
		trigger,
		children,
		placement = 'bottom-end',
		gutter = 8,
		offset = 0,
		minWidth = '220px',
		contentClass = 'docs-menu',
		fluid = true,
		zIndex = 1500
	}: Props = $props();

	let open = $state(false);
	let wrapEl = $state<HTMLElement | null>(null);
	let anchorEl = $state<HTMLElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let highlightEl = $state<HTMLDivElement | null>(null);
	let coords = $state({ top: 0, left: 0, right: 0 });
	let highlight = { x: 0, y: 0, width: 0, height: 0, visible: false, placed: false };
	const reduceMotion =
		typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	const items = () =>
		contentEl
			? Array.from(contentEl.querySelectorAll<HTMLElement>('[data-part="item"]:not([data-disabled])'))
			: [];

	function place() {
		if (!anchorEl) return;
		const rect = anchorEl.getBoundingClientRect();
		coords = {
			top: rect.bottom + gutter + offset,
			left: rect.left,
			right: Math.max(0, window.innerWidth - rect.right)
		};
	}

	function moveHighlight(item: HTMLElement | null, visible: boolean) {
		if (!fluid || !highlightEl) return;
		if (!item) {
			highlight.visible = false;
			animate(highlightEl, { opacity: 0 }, { duration: reduceMotion ? 0 : 0.12 });
			return;
		}
		const next = { x: item.offsetLeft, y: item.offsetTop, width: item.offsetWidth, height: item.offsetHeight };
		const first = !highlight.placed;
		highlight = { ...next, visible, placed: true };
		if (first || reduceMotion) {
			highlightEl.style.transform = `translate(${next.x}px, ${next.y}px)`;
			highlightEl.style.width = `${next.width}px`;
			highlightEl.style.height = `${next.height}px`;
			animate(highlightEl, { opacity: visible ? 1 : 0 }, { duration: reduceMotion ? 0 : 0.12 });
			return;
		}
		animate(
			highlightEl,
			{ x: next.x, y: next.y, width: next.width, height: next.height },
			{ type: 'spring', stiffness: 550, damping: 42, mass: 0.7 }
		);
		animate(highlightEl, { opacity: visible ? 1 : 0 }, { duration: 0.12 });
	}

	function setHighlighted(item: HTMLElement | null, visible = true) {
		for (const el of items()) {
			if (el === item) el.setAttribute('data-highlighted', '');
			else el.removeAttribute('data-highlighted');
		}
		moveHighlight(item, visible);
	}

	function openMenu(focusFirst = false) {
		place();
		open = true;
		highlight = { x: 0, y: 0, width: 0, height: 0, visible: false, placed: false };
		requestAnimationFrame(() => {
			contentEl?.focus({ preventScroll: true });
			if (focusFirst) setHighlighted(items()[0] ?? null);
		});
	}

	function close(focusTrigger = false) {
		open = false;
		if (focusTrigger) anchorEl?.focus({ preventScroll: true });
	}

	const triggerProps: TriggerProps = $derived({
		onclick: (event: MouseEvent) => {
			anchorEl = event.currentTarget as HTMLElement;
			if (open) close();
			else openMenu();
		},
		onkeydown: (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				anchorEl = event.currentTarget as HTMLElement;
				openMenu(true);
			}
		},
		'aria-haspopup': 'menu',
		'aria-expanded': open,
		'data-state': open ? 'open' : 'closed'
	});

	function onContentPointerMove(event: PointerEvent) {
		const item = (event.target as HTMLElement).closest<HTMLElement>('[data-part="item"]:not([data-disabled])');
		if (item && event.pointerType === 'mouse') setHighlighted(item, true);
	}

	function onContentPointerLeave() {
		for (const el of items()) el.removeAttribute('data-highlighted');
		moveHighlight(null, false);
	}

	function onContentKeyDown(event: KeyboardEvent) {
		const list = items();
		const current = list.findIndex((el) => el.hasAttribute('data-highlighted'));
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			setHighlighted(list[(current + 1) % list.length] ?? null);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setHighlighted(list[(current - 1 + list.length) % list.length] ?? null);
		} else if (event.key === 'Home') {
			event.preventDefault();
			setHighlighted(list[0] ?? null);
		} else if (event.key === 'End') {
			event.preventDefault();
			setHighlighted(list[list.length - 1] ?? null);
		} else if ((event.key === 'Enter' || event.key === ' ') && current >= 0) {
			event.preventDefault();
			list[current].click();
		} else if (event.key === 'Tab') {
			close();
		}
	}

	function onContentClick(event: MouseEvent) {
		const item = (event.target as HTMLElement).closest('[data-part="item"]');
		if (item && !item.hasAttribute('data-disabled')) close(true);
	}

	$effect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			const target = event.target as Node;
			if (contentEl?.contains(target) || wrapEl?.contains(target)) return;
			close();
		};
		const onScroll = () => place();
		document.addEventListener('pointerdown', onPointer, true);
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onScroll);
		return () => {
			document.removeEventListener('pointerdown', onPointer, true);
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<span class="docs-menu-anchor" bind:this={wrapEl} style="display: contents;">
	{@render trigger({ props: triggerProps, open })}
</span>

{#if open}
	<div
		use:portal
		bind:this={contentEl}
		class="{contentClass} docs-menu-floating"
		role="menu"
		tabindex="-1"
		style:min-width={minWidth}
		style:z-index={zIndex}
		style:top="{coords.top}px"
		style:left={placement === 'bottom-start' ? `${coords.left}px` : 'auto'}
		style:right={placement === 'bottom-end' ? `${coords.right}px` : 'auto'}
		style:--menu-origin={placement === 'bottom-end' ? 'top right' : 'top left'}
		onpointermove={onContentPointerMove}
		onpointerleave={onContentPointerLeave}
		onkeydown={onContentKeyDown}
		onclick={onContentClick}
	>
		{@render children({ close })}
		{#if fluid}
			<div
				bind:this={highlightEl}
				aria-hidden="true"
				data-menu-highlight=""
				style="position: absolute; top: 0; left: 0; z-index: 0; border-radius: 9px; background: var(--menu-highlight); pointer-events: none; opacity: 0;"
			></div>
		{/if}
	</div>
{/if}
