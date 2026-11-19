<script module lang="ts">
	const MEDIA = 'https://reactbits.dev';

	const TOOLS = [
		{
			id: 'background-studio',
			label: 'Background Studio',
			path: '/tools/background-studio',
			blurb:
				'Pick an animated background, start from a preset, tune it live, then export the code, a 4K image or a looping video.'
		},
		{
			id: 'center-stage',
			label: 'Center Stage',
			path: '/tools/center-stage',
			blurb: 'Turn screenshots and recordings into polished product shots. Perfect for launch videos or demos.'
		},
		{
			id: 'shape-magic',
			label: 'Shape Magic',
			path: '/tools/shape-magic',
			blurb: 'Design a logo mark or style your own logo with 3D materials. Export SVG, PNG, favicons, video or React.'
		},
		{
			id: 'texture-lab',
			label: 'Texture Lab',
			path: '/tools/texture-lab',
			blurb:
				'Stack animated effects on a photo, video or your camera, then export an image, a video, a GIF or a shareable style.'
		},
		{
			id: 'sound-lab',
			label: 'Sound Lab',
			path: '/tools/sound-lab',
			blurb: 'Interface and video sounds, tune them live, then install one with a single command or download WAV, MP3 or OGG.'
		}
	];

	const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

	const POSTERS: Record<string, string> = { 'background-studio': 'topography', 'shape-magic': 'metallicpaint' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme } from '$lib/theme.svelte';
	import { toolsLinkProps } from '$lib/utils/pro';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import { loadLibrary, type LibraryComponent } from '../shared/library';
	import { observeNearOnce } from '../shared/motion';
	import './Tools.css';

	let mounted = $state(false);
	let lite = $state(false);
	let near = $state(false);
	let grid = $state<HTMLDivElement | null>(null);
	let Topography = $state<LibraryComponent | null>(null);
	let MetallicPaint = $state<LibraryComponent | null>(null);

	const light = $derived(mounted && theme.isLight);
	const suffix = $derived(light ? '-light' : '');
	const title = `${WORDS[TOOLS.length] ?? TOOLS.length} free tools, in your browser.`;

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!grid || near) return;
		return observeNearOnce(grid, () => (near = true), '400px 0px');
	});

	$effect(() => {
		if (!near) return;
		lite = document.documentElement.hasAttribute('data-lite');
		if (lite) return;
		loadLibrary('Backgrounds/Topography').then((component) => (Topography = component));
		loadLibrary('Animations/MetallicPaint').then((component) => (MetallicPaint = component));
	});
</script>

{#snippet preview(id: string)}
	{#if id === 'center-stage'}
		<img
			class="ln-tools-shot ln-tools-shot--fit"
			src="{MEDIA}/assets/images/center-stage-shot{suffix}.webp"
			alt=""
			loading="lazy"
			decoding="async"
		/>
	{:else if id === 'sound-lab'}
		<img
			class="ln-tools-shot"
			src="{MEDIA}/assets/images/sound-lab-orb{suffix}.webp"
			alt=""
			loading="lazy"
			decoding="async"
		/>
	{:else if POSTERS[id] && lite}
		<img
			class="ln-tools-poster"
			src="{MEDIA}/assets/video/{POSTERS[id]}{suffix}.webp"
			alt=""
			loading="lazy"
			decoding="async"
		/>
	{:else if id === 'background-studio'}
		{#if Topography}
			<Topography
				color={light ? '#45403b' : '#d6d1cc'}
				lightMode={light}
				tilt={30}
				lineCount={22}
				majorLines={false}
				glow={0.15}
				depthOfField={0}
				speed={0.18}
				intro={false}
			/>
		{/if}
	{:else if id === 'shape-magic'}
		{#if MetallicPaint}
			<MetallicPaint
				imageSrc={logo}
				scale={0.74}
				dispersion={0.06}
				lightMode={light}
				backgroundColor="transparent"
				intro={false}
			/>
		{/if}
	{:else}
		<img src="{MEDIA}/assets/images/soft-type-daisy.webp" alt="" loading="lazy" decoding="async" />
	{/if}
{/snippet}

<section class="ln-tools-section" aria-labelledby="ln-tools-title">
	<div class="ln-tools-inner">
		<header class="ln-tools-head">
			<h2 class="ln-tools-title" id="ln-tools-title">{title}</h2>
			<p class="ln-tools-sub">
				Made by React Bits and free to use. The images, videos and sounds you export work in any project.
			</p>
		</header>
		<div class="ln-tools-grid" bind:this={grid}>
			{#each TOOLS as tool (tool.id)}
				<a class="ln-tools-card" {...toolsLinkProps(tool.path, `landing-tools-${tool.id}`)}>
					<div class="ln-tools-well" aria-hidden="true">
						{#if near}
							{@render preview(tool.id)}
						{/if}
					</div>
					<div class="ln-tools-caption">
						<div class="ln-tools-name">
							<h3>{tool.label}</h3>
							<HugeIcon icon={ArrowUpRight01Icon} size={15} strokeWidth={1.8} />
						</div>
						<p class="ln-tools-desc">{tool.blurb}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
