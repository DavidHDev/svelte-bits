<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { COMPONENT_ROUTES } from '$lib/utils/seo';

	type Props = { category: string; subcategory: string };

	let { category, subcategory }: Props = $props();

	const SHORTCUTS = { previous: '[', next: ']' } as const;

	const isEditable = (target: EventTarget | null) =>
		target instanceof HTMLElement &&
		(target.isContentEditable ||
			['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
			Boolean(target.closest('[role="textbox"], [role="combobox"], [contenteditable="true"]')));

	const path = $derived(`/${category}/${subcategory}`);
	const index = $derived(COMPONENT_ROUTES.findIndex((item) => item.path === path));
	const previous = $derived(index > 0 ? COMPONENT_ROUTES[index - 1] : null);
	const next = $derived(index >= 0 ? (COMPONENT_ROUTES[index + 1] ?? null) : null);

	$effect(() => {
		if (index < 0) return;
		const prev = previous;
		const nxt = next;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.repeat || event.isComposing) return;
			if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
			const target = event.key === SHORTCUTS.previous ? prev : event.key === SHORTCUTS.next ? nxt : null;
			if (!target) return;
			event.preventDefault();
			goto(target.path);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

{#snippet pagerLink(item: (typeof COMPONENT_ROUTES)[number] | null, direction: 'previous' | 'next')}
	{#if !item}
		<span class="component-pager-empty component-pager-{direction}">
			<span>
				<span class="component-pager-label">Collection</span>
				<span class="component-pager-name">{direction === 'previous' ? 'Start of library' : 'End of library'}</span>
			</span>
		</span>
	{:else}
		<a class="component-pager-link component-pager-{direction}" href={item.path} aria-keyshortcuts={SHORTCUTS[direction]}>
			{#if direction === 'previous'}
				<Icon name="ArrowLeft" size={16} />
			{/if}
			<span>
				<span class="component-pager-label">
					{direction === 'previous' ? 'Previous' : 'Next'}
					<kbd class="component-pager-key" aria-hidden="true">{SHORTCUTS[direction]}</kbd>
				</span>
				<span class="component-pager-name">{item.component}</span>
			</span>
			{#if direction === 'next'}
				<Icon name="ArrowRight" size={16} />
			{/if}
		</a>
	{/if}
{/snippet}

{#if index >= 0}
	<nav class="component-pager" aria-label="Component navigation">
		{@render pagerLink(previous, 'previous')}
		{@render pagerLink(next, 'next')}
	</nav>
{/if}
