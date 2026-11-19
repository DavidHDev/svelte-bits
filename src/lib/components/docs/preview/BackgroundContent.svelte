<script module lang="ts">
	let rememberedMode = 'none';
</script>

<script lang="ts">
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { ArrowRight01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
	import logo from '$lib/assets/logo/svelte-bits-logo.svg';
	import mark from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import { getPreviewStage } from './lib/componentProps.svelte';
	import { DEMO_NARROW_WIDTH, demoModesFor, demoView } from './lib/demoModes';
	import { portal } from './lib/portal';
	import { tooltip } from './lib/tooltip';

	type Props = { headline?: string };

	let { headline = 'Build interfaces that feel alive' }: Props = $props();

	const DESCRIPTION = 'Svelte Bits brings motion and character to your interface, one copy-paste component at a time.';
	const LINKS = ['Docs', 'Showcase', 'Pricing'];
	const FADE_MS = 200;
	const MORPH_MS = 440;
	const PHONE_HEIGHT = 844;
	const PHONE_MARGIN = 36;

	const stage = getPreviewStage();
	const demo = $derived(stage?.demo ?? null);

	let rootEl = $state<HTMLDivElement | null>(null);
	let localMode = $state(rememberedMode);
	let narrow = $state(false);
	const target = $derived(demo ? demo.mode : localMode);
	const view = $derived(demoView(target, narrow));

	let shape = $state(demoView(rememberedMode, false));
	let clip = $state(demoView(rememberedMode, false));
	let shown = $state<string | null>(demoView(rememberedMode, false));
	let hidden = $state(false);
	let current = demoView(rememberedMode, false);
	let animateReady = false;
	let timers: ReturnType<typeof setTimeout>[] = [];

	$effect(() => {
		if (!rootEl) return;
		const root = rootEl;
		const fitPhone = () => {
			const host = root.parentElement;
			if (!host) return;
			host.style.removeProperty('--bgc-phone-scale');
			const base = parseFloat(getComputedStyle(host).getPropertyValue('--bgc-phone-scale')) || 0.6;
			const fit = (host.clientHeight - PHONE_MARGIN * 2) / PHONE_HEIGHT;
			if (fit > 0 && fit < base) host.style.setProperty('--bgc-phone-scale', fit.toFixed(4));
		};
		const measure = () => {
			narrow = root.clientWidth < DEMO_NARROW_WIDTH;
			fitPhone();
		};
		measure();
		const frame = requestAnimationFrame(() => (animateReady = true));
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			root.parentElement?.style.removeProperty('--bgc-phone-scale');
		};
	});

	$effect(() => () => timers.forEach(clearTimeout));

	$effect(() => {
		stage?.demo?.setNarrow(narrow);
	});

	$effect(() => {
		const setPresent = stage?.demo?.setPresent;
		if (!setPresent) return;
		setPresent(true);
		return () => setPresent(false);
	});

	$effect.pre(() => {
		const next = view;
		if (next === current) return;
		current = next;
		timers.forEach(clearTimeout);
		shape = next;
		if (!animateReady || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			clip = next;
			shown = next;
			hidden = false;
			return;
		}
		hidden = true;
		shown = null;
		timers = [
			setTimeout(() => (clip = next), FADE_MS),
			setTimeout(() => {
				shown = next;
				hidden = false;
			}, MORPH_MS)
		];
	});

	function select(next: string) {
		if (demo) {
			demo.setMode(next);
			return;
		}
		rememberedMode = next;
		localMode = next;
	}

	const modes = $derived(demoModesFor(narrow));
	const modeIndex = $derived(Math.max(0, modes.findIndex((item) => item.value === view)));
</script>

{#snippet copy()}
	<div class="bgc-copy">
		<p class="bgc-title">{headline}</p>
		<p class="bgc-text">{DESCRIPTION}</p>
		<div class="bgc-cta">
			<span class="bgc-button bgc-button--primary">
				Start building
				<HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
			</span>
			<span class="bgc-button bgc-button--ghost">Browse components</span>
		</div>
	</div>
{/snippet}

{#snippet modeSwitch()}
	<div class="bgc-switch" role="group" aria-label="Demo content" style="--bgc-index: {modeIndex};">
		<span class="bgc-switch-pill" aria-hidden="true"></span>
		{#each modes as item (item.value)}
			<button
				type="button"
				class="bgc-switch-button"
				aria-label={item.label}
				aria-pressed={view === item.value}
				onclick={() => select(item.value)}
				use:tooltip={{ label: item.label, placement: 'bottom' }}
			>
				<HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.6} aria-hidden="true" />
			</button>
		{/each}
	</div>
{/snippet}

<div bind:this={rootEl} class="bgc" data-mode={shape} data-clip={clip} data-hidden={hidden ? '' : undefined}>
	<span class="bgc-veil"></span>

	<div class="bgc-window" aria-hidden="true" data-active={shown === 'landing' ? '' : undefined}>
		<div class="bgc-window-bar">
			<span class="bgc-window-dots"><i></i><i></i><i></i></span>
			<span class="bgc-window-url">sveltebits.xyz</span>
		</div>
		<div class="bgc-site">
			<div class="bgc-nav">
				<img class="bgc-logo" src={logo} alt="" draggable="false" />
				<div class="bgc-links">
					{#each LINKS as link (link)}
						<span>{link}</span>
					{/each}
				</div>
				<span class="bgc-button bgc-button--primary bgc-button--small">Get started</span>
			</div>
			{@render copy()}
		</div>
	</div>

	<div class="bgc-phone" aria-hidden="true" data-active={shown === 'mobile' ? '' : undefined}>
		<div class="bgc-phone-screen">
			<div class="bgc-phone-status">
				<span>9:41</span>
				<span class="bgc-phone-island"></span>
				<span class="bgc-phone-battery"><i></i></span>
			</div>
			<div class="bgc-nav">
				<img class="bgc-logo" src={logo} alt="" draggable="false" />
				<span class="bgc-menu">
					<HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.6} />
				</span>
			</div>
			{@render copy()}
			<span class="bgc-phone-home"></span>
		</div>
	</div>

	<div class="bgc-card" aria-hidden="true" data-active={shown === 'card' ? '' : undefined}>
		<div class="bgc-card-fade"></div>
		<span class="bgc-card-badge">
			<img src={mark} alt="" draggable="false" />
		</span>
		<div class="bgc-card-body">
			<p class="bgc-card-title">{headline}</p>
			<p class="bgc-card-text">{DESCRIPTION}</p>
			<div class="bgc-card-actions">
				<span class="bgc-button bgc-button--primary bgc-button--small">Get started</span>
				<span class="bgc-card-link">
					Learn more
					<HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={1.8} />
				</span>
			</div>
		</div>
	</div>

	<span class="bgc-shell"></span>

	{#if !stage?.hasControls}
		{@render modeSwitch()}
	{:else if stage.controls}
		{#key stage.controls}
			<div use:portal={stage.controls} style="display: contents;">
				{@render modeSwitch()}
			</div>
		{/key}
	{/if}
</div>
