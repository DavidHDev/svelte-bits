<script lang="ts">
	import { onMount } from 'svelte';
	import DotField from '$lib/components/library/Backgrounds/DotField/DotField.svelte';
	import HeroBand from './HeroBand.svelte';
	import InteractiveCode, { type SnippetDef } from './InteractiveCode.svelte';
	import { hexToHsv, hsvToHex, parseHexRgb } from '$lib/utils/color';
	import { preloadSounds } from '$lib/utils/audio';
	import './Hero.css';

	const SNIPPET_DEFS: SnippetDef[] = [
		{
			label: 'ColorBends',
			component: 'ColorBends',
			props: [
				{ name: 'color', type: 'color', default: '#FF3E00' },
				{ name: 'speed', type: 'number', default: 0.2, min: 0.1, max: 1, step: 0.1 },
				{ name: 'frequency', type: 'number', default: 1, min: 1, max: 3, step: 0.1 },
				{ name: 'noise', type: 'number', default: 0.15, min: 0, max: 0.9, step: 0.01 },
				{ name: 'bandWidth', type: 'number', default: 0.14, min: 0.1, max: 1, step: 0.01 },
				{ name: 'rotation', type: 'number', default: 90, min: 0, max: 360, step: 1 },
				{ name: 'fadeTop', type: 'number', default: 0.75, min: 0.4, max: 1, step: 0.05 },
				{ name: 'iterations', type: 'number', default: 1, min: 1, max: 2, step: 1 },
				{ name: 'intensity', type: 'number', default: 1.25, min: 0.1, max: 2, step: 0.1 }
			]
		},
		{
			label: 'DotField',
			component: 'DotField',
			props: [
				{ name: 'dotRadius', type: 'number', default: 1.5, min: 1, max: 3, step: 0.1 },
				{ name: 'dotSpacing', type: 'number', default: 14, min: 10, max: 40, step: 1 },
				{ name: 'cursorRadius', type: 'number', default: 500, min: 50, max: 1000, step: 10 },
				{ name: 'cursorForce', type: 'number', default: 0.1, min: 0, max: 1, step: 0.01 },
				{ name: 'bulgeOnly', type: 'boolean', default: true },
				{ name: 'bulgeStrength', type: 'number', default: 67, min: 1, max: 200, step: 1 },
				{ name: 'glowRadius', type: 'number', default: 160, min: 50, max: 500, step: 10 },
				{ name: 'sparkle', type: 'boolean', default: false },
				{ name: 'waveAmplitude', type: 'number', default: 0, min: 0, max: 20, step: 1 }
			]
		}
	];

	function makeDefaults(): Record<string, string | number | boolean>[] {
		return SNIPPET_DEFS.map((def) =>
			Object.fromEntries(def.props.map((p) => [p.name, p.default]))
		);
	}

	let activeSnippet = $state(0);
	let dropdownOpen = $state(false);
	let propValues = $state<Record<string, string | number | boolean>[]>(makeDefaults());
	let dropdownEl: HTMLDivElement;

	function handlePropChange(name: string, value: string | number | boolean) {
		propValues[activeSnippet] = { ...propValues[activeSnippet], [name]: value };
	}

	function resetProps() {
		propValues = makeDefaults();
	}

	let hasChanges = $derived.by(() => {
		const def = SNIPPET_DEFS[activeSnippet];
		const vals = propValues[activeSnippet];
		return def.props.some((p) => vals[p.name] !== p.default);
	});

	onMount(() => {
		const onClickOutside = (e: PointerEvent) => {
			if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
				dropdownOpen = false;
			}
		};
		document.addEventListener('pointerdown', onClickOutside);
		return () => document.removeEventListener('pointerdown', onClickOutside);
	});

	let accentColor = $derived(propValues[0].color as string);
	let accentDerived = $derived.by(() => {
		const [ar, ag, ab] = parseHexRgb(accentColor);
		const lum = (0.2126 * ar + 0.7152 * ag + 0.0722 * ab) / 255;
		return {
			accentFg: lum > 0.5 ? '#000' : '#fff',
			dotGradientFrom: `rgba(${ar}, ${ag}, ${ab}, 0.35)`,
			dotGradientTo: `rgba(${Math.min(ar + 12, 255)}, ${Math.min(ag + 66, 255)}, ${Math.min(ab + 16, 255)}, 0.25)`
		};
	});

	$effect(() => {
		const hsv = hexToHsv(accentColor);
		const dark = hsvToHex(hsv.h, Math.min(hsv.s + 0.1, 1), Math.max(hsv.v * 0.7, 0));
		const light = hsvToHex(
			(hsv.h + 30) % 360,
			Math.max(hsv.s * 0.8, 0),
			Math.min(hsv.v * 1.15, 1)
		);
		const [r, g, b] = parseHexRgb(accentColor);
		const root = document.documentElement;
		const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
		root.style.setProperty('--pro-dark', dark);
		root.style.setProperty('--pro-base', accentColor);
		root.style.setProperty('--pro-light', light);
		root.style.setProperty('--pro-glow', `${r}, ${g}, ${b}`);
		root.style.setProperty('--pro-fg', lum > 0.5 ? '#000' : '#fff');
		return () => {
			root.style.removeProperty('--pro-dark');
			root.style.removeProperty('--pro-base');
			root.style.removeProperty('--pro-light');
			root.style.removeProperty('--pro-glow');
			root.style.removeProperty('--pro-fg');
		};
	});

	// Cast for HeroBand spread (props[0] is ColorBends snippet props)
	let bandProps = $derived(propValues[0] as Record<string, number | string>);
	let dotProps = $derived(propValues[1] as Record<string, number | boolean>);
</script>

<section class="ln-hero">
	<div class="ln-hero-dots" aria-hidden="true">
		<DotField
			dotRadius={dotProps.dotRadius as number}
			dotSpacing={dotProps.dotSpacing as number}
			cursorRadius={dotProps.cursorRadius as number}
			cursorForce={dotProps.cursorForce as number}
			bulgeOnly={dotProps.bulgeOnly as boolean}
			bulgeStrength={dotProps.bulgeStrength as number}
			glowRadius={dotProps.glowRadius as number}
			sparkle={dotProps.sparkle as boolean}
			waveAmplitude={dotProps.waveAmplitude as number}
			gradientFrom={accentDerived.dotGradientFrom}
			gradientTo={accentDerived.dotGradientTo}
			glowColor="#14110E"
		/>
	</div>
	<HeroBand
		class="ln-hero-band"
		color={bandProps.color as string}
			speed={bandProps.speed as number}
			frequency={bandProps.frequency as number}
			noise={bandProps.noise as number}
			bandWidth={bandProps.bandWidth as number}
			rotation={bandProps.rotation as number}
			fadeTop={bandProps.fadeTop as number}
			iterations={bandProps.iterations as number}
			intensity={bandProps.intensity as number}
			scale={1}
			warpStrength={1}
			yOffset={0.3}
			mouseInfluence={0.3}
	/>
	<svg class="ln-hero-bottom-fade" preserveAspectRatio="none" viewBox="0 0 1 1">
		<defs>
			<linearGradient id="hero-bottom-fade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#14110E" stop-opacity="0" />
				<stop offset="50%" stop-color="#14110E" stop-opacity="0" />
				<stop offset="60%" stop-color="#14110E" stop-opacity="0.03" />
				<stop offset="68%" stop-color="#14110E" stop-opacity="0.1" />
				<stop offset="74%" stop-color="#14110E" stop-opacity="0.22" />
				<stop offset="80%" stop-color="#14110E" stop-opacity="0.38" />
				<stop offset="85%" stop-color="#14110E" stop-opacity="0.55" />
				<stop offset="90%" stop-color="#14110E" stop-opacity="0.72" />
				<stop offset="94%" stop-color="#14110E" stop-opacity="0.87" />
				<stop offset="97%" stop-color="#14110E" stop-opacity="0.95" />
				<stop offset="100%" stop-color="#14110E" stop-opacity="1" />
			</linearGradient>
		</defs>
		<rect width="1" height="1" fill="url(#hero-bottom-fade)" />
	</svg>

	<div class="ln-hero-content">
		<div class="ln-hero-left">
			<a href="/backgrounds/dot-field" class="ln-hero-tag">
				<span
					class="ln-hero-tag-new"
					style="background: {accentColor}; color: {accentDerived.accentFg};"
				>
					New Component
				</span>
				DotField
				<svg width="10" height="10" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
					<path
						d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
					/>
				</svg>
			</a>
			<h1 class="ln-hero-headline">
				<span class="ln-hero-headline-line">Svelte components for</span><br /><span
					class="ln-hero-headline-line">creative developers</span
				>
			</h1>
			<p class="ln-hero-description">
				Highly customizable animated components & backgrounds that drop into your project and
				instantly make it stand out
			</p>
			<div class="ln-hero-buttons">
				<a
					href="/get-started/index"
					class="ln-hero-btn ln-hero-btn-primary"
					style="background: {accentColor}; border-color: {accentColor}; color: {accentDerived.accentFg};"
				>
					Browse Components
				</a>
			</div>
		</div>
		<div class="ln-hero-right">
			<div class="ln-hero-code-window" onpointerenter={preloadSounds}>
				<div class="ln-hero-code-titlebar">
					<div class="ln-hero-code-dots">
						<span></span><span></span><span></span>
					</div>
					<div class="ln-hero-code-titlebar-actions">
						{#if hasChanges}
							<button
								class="ln-hero-code-reset"
								onclick={resetProps}
								aria-label="Reset to defaults"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
									<path d="M3 3v5h5" />
								</svg>
							</button>
						{/if}
						<div class="ln-hero-code-dropdown" bind:this={dropdownEl}>
							<button
								class="ln-hero-code-dropdown-trigger"
								onclick={() => (dropdownOpen = !dropdownOpen)}
							>
								{SNIPPET_DEFS[activeSnippet].label}
								<svg
									class="ln-hero-code-caret{dropdownOpen ? ' open' : ''}"
									width="8"
									height="5"
									viewBox="0 0 8 5"
									fill="none"
								>
									<path
										d="M1 1L4 4L7 1"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
							<div class="ln-hero-code-dropdown-menu{dropdownOpen ? ' open' : ''}">
								{#each SNIPPET_DEFS as def, i (def.label)}
									<button
										class="ln-hero-code-dropdown-item{i === activeSnippet ? ' active' : ''}"
										onclick={() => {
											activeSnippet = i;
											dropdownOpen = false;
										}}
									>
										{def.label}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
				<div class="ln-hero-code-body">
					<InteractiveCode
						def={SNIPPET_DEFS[activeSnippet]}
						values={propValues[activeSnippet]}
						onChange={handlePropChange}
					/>
				</div>
				<p class="ln-hero-code-hint">Drag or click values to edit</p>
			</div>
		</div>
	</div>
</section>
