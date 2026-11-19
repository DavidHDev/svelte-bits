<script lang="ts">
	import { DOCS_ICONS, type DocsIconName } from './lib/icons';

	type Props = {
		name: DocsIconName;
		size?: number;
		strokeWidth?: number;
		class?: string;
	};

	let { name, size = 16, strokeWidth = 2, class: className = '' }: Props = $props();

	const icon = $derived(DOCS_ICONS[name]);
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox={icon.viewBox}
	fill={icon.fill ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={icon.fill ? 0 : strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	xmlns="http://www.w3.org/2000/svg"
>
	{@html icon.inner}
</svg>
