<!-- @svelte-bits
{
  "title": "Folder",
  "description": "Click to open a folder, fanning out paper snippets that follow the cursor on hover.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	export type FolderItem = Snippet | string | null;
</script>

<script lang="ts">
	type Props = {
		color?: string;
		size?: number;
		items?: FolderItem[];
		class?: string;
	};

	let { color = '#FF8A4C', size = 1, items = [], class: className = '' }: Props = $props();

	function darkenColor(hex: string, percent: number): string {
		let c = hex.startsWith('#') ? hex.slice(1) : hex;
		if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
		const n = parseInt(c, 16);
		let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
		r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
		g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
		b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
	}

	const maxItems = 3;
	const papers = $derived.by(() => {
		const arr: FolderItem[] = (items ?? []).slice(0, maxItems);
		while (arr.length < maxItems) arr.push(null);
		return arr;
	});

	let open = $state(false);
	let paperOffsets = $state<{ x: number; y: number }[]>(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));

	const folderBackColor = $derived(darkenColor(color, 0.08));
	const paper1 = $derived(darkenColor('#ffffff', 0.1));
	const paper2 = $derived(darkenColor('#ffffff', 0.05));
	const paper3 = '#ffffff';

	function handleClick() {
		const wasOpen = open;
		open = !open;
		if (wasOpen) paperOffsets = Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }));
	}
	function onPaperMove(e: MouseEvent, i: number) {
		if (!open) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		paperOffsets = paperOffsets.map((p, idx) => idx === i ? { x: (e.clientX - cx) * 0.15, y: (e.clientY - cy) * 0.15 } : p);
	}
	function onPaperLeave(_e: MouseEvent, i: number) {
		paperOffsets = paperOffsets.map((p, idx) => idx === i ? { x: 0, y: 0 } : p);
	}
	function getOpenTransform(i: number): string {
		if (i === 0) return 'translate(-120%, -70%) rotate(-15deg)';
		if (i === 1) return 'translate(10%, -70%) rotate(15deg)';
		if (i === 2) return 'translate(-50%, -100%) rotate(5deg)';
		return '';
	}
	function paperSizeClasses(i: number, isOpen: boolean): string {
		if (i === 0) return isOpen ? 'w-[70%] h-[80%]' : 'w-[70%] h-[80%]';
		if (i === 1) return isOpen ? 'w-[80%] h-[80%]' : 'w-[80%] h-[70%]';
		return isOpen ? 'w-[90%] h-[80%]' : 'w-[90%] h-[60%]';
	}
</script>

<div style="transform:scale({size});" class={className}>
	<div
		class="group relative transition-all duration-200 ease-in cursor-pointer {!open ? 'hover:-translate-y-2' : ''}"
		style="transform:{open ? 'translateY(-8px)' : 'none'};"
		onclick={handleClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
	>
		<div class="relative w-[100px] h-[80px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]" style="background-color:{folderBackColor};">
			<span class="absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px]" style="background-color:{folderBackColor};"></span>
			{#each papers as item, i (i)}
				<div
					onmousemove={(e) => onPaperMove(e, i)}
					onmouseleave={(e) => onPaperLeave(e, i)}
					role="presentation"
					class="absolute z-20 bottom-[10%] left-1/2 transition-all duration-300 ease-in-out {paperSizeClasses(i, open)} {!open ? 'transform -translate-x-1/2 translate-y-[10%] group-hover:translate-y-0' : 'hover:scale-110'}"
					style="background-color:{i === 0 ? paper1 : i === 1 ? paper2 : paper3};border-radius:10px;{open ? `transform:${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px);` : ''}"
				>
					{#if typeof item === 'string'}{item}{:else if item}{@render (item as Snippet)()}{/if}
				</div>
			{/each}
			<div
				class="absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out {!open ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]' : ''}"
				style="background-color:{color};border-radius:5px 10px 10px 10px;{open ? 'transform:skew(15deg) scaleY(0.6);' : ''}"
			></div>
			<div
				class="absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out {!open ? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]' : ''}"
				style="background-color:{color};border-radius:5px 10px 10px 10px;{open ? 'transform:skew(-15deg) scaleY(0.6);' : ''}"
			></div>
		</div>
	</div>
</div>
