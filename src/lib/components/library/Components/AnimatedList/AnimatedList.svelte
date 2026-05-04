<!-- @svelte-bits
{
  "title": "Animated List",
  "description": "Scroll-aware list with item-by-item scale + fade transitions and keyboard navigation.",
  "dependencies": []
}
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';

	type Props = {
		items?: string[];
		onItemSelect?: (item: string, index: number) => void;
		showGradients?: boolean;
		enableArrowNavigation?: boolean;
		class?: string;
		itemClass?: string;
		displayScrollbar?: boolean;
		initialSelectedIndex?: number;
	};

	let {
		items = [
			'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
			'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10',
			'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 15'
		],
		onItemSelect,
		showGradients = true,
		enableArrowNavigation = true,
		class: className = '',
		itemClass = '',
		displayScrollbar = true,
		initialSelectedIndex = -1
	}: Props = $props();

	let listRef: HTMLDivElement;
	let selectedIndex = $state(initialSelectedIndex);
	let keyboardNav = $state(false);
	let topGradientOpacity = $state(0);
	let bottomGradientOpacity = $state(1);
	let inView = $state<boolean[]>([]);

	$effect(() => {
		if (inView.length !== items.length) {
			untrack(() => (inView = items.map(() => false)));
		}
	});

	function handleScroll(e: Event) {
		const t = e.currentTarget as HTMLDivElement;
		topGradientOpacity = Math.min(t.scrollTop / 50, 1);
		const bottomDistance = t.scrollHeight - (t.scrollTop + t.clientHeight);
		bottomGradientOpacity = t.scrollHeight <= t.clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
	}

	function inViewAction(node: HTMLElement, index: number) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					inView[index] = entry.intersectionRatio >= 0.5;
				}
			},
			{ root: listRef, threshold: [0, 0.5, 1] }
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	onMount(() => {
		if (!enableArrowNavigation) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
				e.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
			} else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
				e.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.max(selectedIndex - 1, 0);
			} else if (e.key === 'Enter') {
				if (selectedIndex >= 0 && selectedIndex < items.length) {
					e.preventDefault();
					onItemSelect?.(items[selectedIndex], selectedIndex);
				}
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	$effect(() => {
		if (!keyboardNav || selectedIndex < 0 || !listRef) return;
		const container = listRef;
		const selectedItem = container.querySelector(
			`[data-index="${selectedIndex}"]`
		) as HTMLElement | null;
		if (selectedItem) {
			const extraMargin = 50;
			const itemTop = selectedItem.offsetTop;
			const itemBottom = itemTop + selectedItem.offsetHeight;
			if (itemTop < container.scrollTop + extraMargin) {
				container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
			} else if (itemBottom > container.scrollTop + container.clientHeight - extraMargin) {
				container.scrollTo({
					top: itemBottom - container.clientHeight + extraMargin,
					behavior: 'smooth'
				});
			}
		}
		untrack(() => (keyboardNav = false));
	});
</script>

<div class="relative w-[500px] {className}">
	<div
		bind:this={listRef}
		class="al-scroll max-h-[400px] overflow-y-auto p-4 {displayScrollbar ? 'al-scrollbar' : 'al-scrollbar-hide'}"
		onscroll={handleScroll}
	>
		{#each items as item, index (index)}
			<div
				use:inViewAction={index}
				data-index={index}
				class="mb-4 cursor-pointer al-item"
				style:transform={inView[index] ? 'scale(1)' : 'scale(0.7)'}
				style:opacity={inView[index] ? 1 : 0}
				style:transition="transform 0.2s ease 0.1s, opacity 0.2s ease 0.1s"
				onmouseenter={() => (selectedIndex = index)}
				onclick={() => {
					selectedIndex = index;
					onItemSelect?.(item, index);
				}}
				role="option"
				aria-selected={selectedIndex === index}
				tabindex="-1"
			>
				<div
					class="p-4 bg-[#222] rounded-lg {selectedIndex === index ? 'al-selected' : ''} {itemClass}"
				>
					<p class="text-white m-0">{item}</p>
				</div>
			</div>
		{/each}
	</div>
	{#if showGradients}
		<div
			class="absolute top-0 left-0 right-0 h-[50px] pointer-events-none"
			style="background: linear-gradient(to bottom, #14110E, transparent); opacity: {topGradientOpacity}; transition: opacity 0.3s ease;"
		></div>
		<div
			class="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none"
			style="background: linear-gradient(to top, #14110E, transparent); opacity: {bottomGradientOpacity}; transition: opacity 0.3s ease;"
		></div>
	{/if}
</div>

<style>
	.al-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #222 #14110e;
	}
	.al-scrollbar::-webkit-scrollbar {
		width: 8px;
	}
	.al-scrollbar::-webkit-scrollbar-track {
		background: #14110e;
	}
	.al-scrollbar::-webkit-scrollbar-thumb {
		background: #222;
		border-radius: 4px;
	}
	.al-scrollbar-hide {
		scrollbar-width: none;
	}
	.al-scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.al-selected {
		background: #222 !important;
	}
</style>
