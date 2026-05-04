<!-- @svelte-bits
{
  "title": "Chroma Grid",
  "description": "Card grid with cursor-following spotlight reveal of color from a desaturated overlay (GSAP).",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type ChromaItem = {
		image: string;
		title: string;
		subtitle: string;
		handle?: string;
		location?: string;
		borderColor?: string;
		gradient?: string;
		url?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		items?: ChromaItem[];
		class?: string;
		radius?: number;
		columns?: number;
		rows?: number;
		damping?: number;
		fadeOut?: number;
		ease?: string;
	};

	const demo: ChromaItem[] = [
		{ image: 'https://i.pravatar.cc/300?img=8', title: 'Alex Rivera', subtitle: 'Full Stack Developer', handle: '@alexrivera', borderColor: '#FF8A4C', gradient: 'linear-gradient(145deg,#FF8A4C,#000)', url: 'https://github.com/' },
		{ image: 'https://i.pravatar.cc/300?img=11', title: 'Jordan Chen', subtitle: 'DevOps Engineer', handle: '@jordanchen', borderColor: '#FFC18A', gradient: 'linear-gradient(210deg,#FFC18A,#000)', url: 'https://linkedin.com/in/' },
		{ image: 'https://i.pravatar.cc/300?img=3', title: 'Morgan Blake', subtitle: 'UI/UX Designer', handle: '@morganblake', borderColor: '#FF6B2C', gradient: 'linear-gradient(165deg,#FF6B2C,#000)', url: 'https://dribbble.com/' },
		{ image: 'https://i.pravatar.cc/300?img=16', title: 'Casey Park', subtitle: 'Data Scientist', handle: '@caseypark', borderColor: '#E86A2A', gradient: 'linear-gradient(195deg,#E86A2A,#000)', url: 'https://kaggle.com/' },
		{ image: 'https://i.pravatar.cc/300?img=25', title: 'Sam Kim', subtitle: 'Mobile Developer', handle: '@thesamkim', borderColor: '#FF8A4C', gradient: 'linear-gradient(225deg,#FF8A4C,#000)', url: 'https://github.com/' },
		{ image: 'https://i.pravatar.cc/300?img=60', title: 'Tyler Rodriguez', subtitle: 'Cloud Architect', handle: '@tylerrod', borderColor: '#FFA56B', gradient: 'linear-gradient(135deg,#FFA56B,#000)', url: 'https://aws.amazon.com/' }
	];

	let { items, class: className = '', radius = 300, columns = 3, rows = 2, damping = 0.45, fadeOut = 0.6, ease = 'power3.out' }: Props = $props();
	const data = $derived(items?.length ? items : demo);

	let rootRef: HTMLDivElement;
	let fadeRef: HTMLDivElement;
	let setX: ((v: number | string) => void) | null = null;
	let setY: ((v: number | string) => void) | null = null;
	const pos = { x: 0, y: 0 };

	onMount(() => {
		setX = gsap.quickSetter(rootRef, '--x', 'px') as (v: number | string) => void;
		setY = gsap.quickSetter(rootRef, '--y', 'px') as (v: number | string) => void;
		const { width, height } = rootRef.getBoundingClientRect();
		pos.x = width / 2; pos.y = height / 2;
		setX(pos.x); setY(pos.y);
	});

	function moveTo(x: number, y: number) {
		gsap.to(pos, {
			x, y, duration: damping, ease,
			onUpdate: () => { setX?.(pos.x); setY?.(pos.y); },
			overwrite: true
		});
	}
	function handleMove(e: PointerEvent) {
		const r = rootRef.getBoundingClientRect();
		moveTo(e.clientX - r.left, e.clientY - r.top);
		gsap.to(fadeRef, { opacity: 0, duration: 0.25, overwrite: true });
	}
	function handleLeave() {
		gsap.to(fadeRef, { opacity: 1, duration: fadeOut, overwrite: true });
	}
	function handleCardMove(e: MouseEvent) {
		const c = e.currentTarget as HTMLElement;
		const rect = c.getBoundingClientRect();
		c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
		c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
	}
	function handleCardClick(url?: string) {
		if (url) window.open(url, '_blank', 'noopener,noreferrer');
	}
</script>

<div
	bind:this={rootRef}
	onpointermove={handleMove}
	onpointerleave={handleLeave}
	class="chroma-grid {className}"
	style="--r:{radius}px; --cols:{columns}; --rows:{rows};"
>
	{#each data as c, i (i)}
		<article
			class="chroma-card"
			onmousemove={handleCardMove}
			onclick={() => handleCardClick(c.url)}
			role="button"
			tabindex="0"
			onkeydown={(e) => { if (e.key === 'Enter') handleCardClick(c.url); }}
			style="--card-border:{c.borderColor || 'transparent'}; --card-gradient:{c.gradient}; cursor:{c.url ? 'pointer' : 'default'};"
		>
			<div class="chroma-img-wrapper">
				<img src={c.image} alt={c.title} loading="lazy" />
			</div>
			<footer class="chroma-info">
				<h3 class="name">{c.title}</h3>
				{#if c.handle}<span class="handle">{c.handle}</span>{/if}
				<p class="role">{c.subtitle}</p>
				{#if c.location}<span class="location">{c.location}</span>{/if}
			</footer>
		</article>
	{/each}
	<div class="chroma-overlay"></div>
	<div bind:this={fadeRef} class="chroma-fade"></div>
</div>

<style>
	:global(.chroma-grid) {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: repeat(var(--cols, 3), 320px);
		grid-auto-rows: auto;
		justify-content: center;
		gap: 0.75rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
		box-sizing: border-box;
		--x: 50%;
		--y: 50%;
		--r: 220px;
	}
	@media (max-width: 1124px) {
		:global(.chroma-grid) {
			grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
			gap: 0.5rem;
			padding: 0.5rem;
		}
	}
	@media (max-width: 480px) {
		:global(.chroma-grid) {
			grid-template-columns: 320px;
			gap: 0.75rem;
			padding: 1rem;
		}
	}
	:global(.chroma-card) {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 320px;
		height: auto;
		border-radius: 20px;
		overflow: hidden;
		border: 1px solid #333;
		transition: border-color 0.3s ease;
		background: var(--card-gradient);
		--mouse-x: 50%;
		--mouse-y: 50%;
		--spotlight-color: rgba(255, 255, 255, 0.3);
	}
	:global(.chroma-card:hover) { border-color: var(--card-border); }
	:global(.chroma-card::before) {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.5s ease;
		z-index: 2;
	}
	:global(.chroma-card:hover::before) { opacity: 1; }
	:global(.chroma-img-wrapper) {
		position: relative;
		z-index: 1;
		flex: 1;
		padding: 10px;
		box-sizing: border-box;
		background: transparent;
		transition: background 0.3s ease;
	}
	:global(.chroma-img-wrapper img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 10px;
		display: block;
	}
	:global(.chroma-info) {
		position: relative;
		z-index: 1;
		padding: 0.75rem 1rem;
		color: #fff;
		font-family: system-ui, sans-serif;
		display: grid;
		grid-template-columns: 1fr auto;
		row-gap: 0.25rem;
		column-gap: 0.75rem;
	}
	:global(.chroma-info .role),
	:global(.chroma-info .handle) { color: #aaa; }
	:global(.chroma-overlay) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 3;
		backdrop-filter: grayscale(1) brightness(0.78);
		-webkit-backdrop-filter: grayscale(1) brightness(0.78);
		background: rgba(0, 0, 0, 0.001);
		mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.68) 88%, white 100%);
		-webkit-mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.68) 88%, white 100%);
	}
	:global(.chroma-fade) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 4;
		backdrop-filter: grayscale(1) brightness(0.78);
		-webkit-backdrop-filter: grayscale(1) brightness(0.78);
		background: rgba(0, 0, 0, 0.001);
		mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.32) 88%, transparent 100%);
		-webkit-mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.32) 88%, transparent 100%);
		opacity: 1;
		transition: opacity 0.25s ease;
	}
</style>
