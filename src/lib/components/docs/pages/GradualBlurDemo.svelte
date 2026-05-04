<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import GradualBlur from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte';
	import source from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte?raw';

	type Position = 'top' | 'bottom' | 'left' | 'right';
	const DEFAULTS = { position: 'bottom' as Position, strength: 2, height: '6rem', divCount: 5, exponential: true, opacity: 1 };
	let position = $state<Position>(DEFAULTS.position);
	let strength = $state(DEFAULTS.strength);
	let height = $state(DEFAULTS.height);
	let divCount = $state(DEFAULTS.divCount);
	let exponential = $state(DEFAULTS.exponential);
	let opacity = $state(DEFAULTS.opacity);

	const hasChanges = $derived(position !== DEFAULTS.position || strength !== DEFAULTS.strength || height !== DEFAULTS.height || divCount !== DEFAULTS.divCount || exponential !== DEFAULTS.exponential || opacity !== DEFAULTS.opacity);
	function reset() { position = DEFAULTS.position; strength = DEFAULTS.strength; height = DEFAULTS.height; divCount = DEFAULTS.divCount; exponential = DEFAULTS.exponential; opacity = DEFAULTS.opacity; }

	const usage = $derived(`<GradualBlur position="${position}" strength={${strength}} height="${height}" divCount={${divCount}} exponential={${exponential}} opacity={${opacity}} />`);

	const props: PropRow[] = [
		{ name: 'position', type: '"top" | "bottom" | "left" | "right"', default: '"bottom"', description: 'Edge to apply blur.' },
		{ name: 'strength', type: 'number', default: '2', description: 'Maximum blur strength.' },
		{ name: 'height', type: 'string', default: '"6rem"', description: 'Overlay thickness.' },
		{ name: 'width', type: 'string', default: 'undefined', description: 'Overlay width (for left/right).' },
		{ name: 'divCount', type: 'number', default: '5', description: 'Number of stacked blur layers.' },
		{ name: 'exponential', type: 'boolean', default: 'false', description: 'Exponential blur ramp.' },
		{ name: 'curve', type: '"linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out"', default: '"linear"', description: 'Blur ramp curve.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity.' },
		{ name: 'animated', type: 'boolean | "scroll"', default: 'false', description: 'Enable transition / scroll-reveal.' },
		{ name: 'duration', type: 'string', default: '"0.3s"', description: 'Transition duration.' },
		{ name: 'easing', type: 'string', default: '"ease-out"', description: 'Transition easing.' },
		{ name: 'hoverIntensity', type: 'number', default: 'undefined', description: 'Multiplier on hover.' },
		{ name: 'target', type: '"parent" | "page"', default: '"parent"', description: 'Whether to attach to parent or fixed to viewport.' },
		{ name: 'preset', type: 'string', default: 'undefined', description: 'Apply a built-in preset.' }
	];
</script>

<svelte:head><title>Gradual Blur - svelte-bits</title></svelte:head>
<h1 class="sub-category">Gradual Blur</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GradualBlur" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;">
			<div style="position:absolute;inset:0;overflow-y:auto;">
				<div style="padding:1.5rem;color:#fff;display:flex;flex-direction:column;gap:1rem;">
					{#each Array(20) as _, i}
						<div style="padding:1.5rem;background:linear-gradient(135deg, rgba(255,138,76,0.15), rgba(255,138,76,0.04));border:1px solid #2a2a2a;border-radius:12px;">
							<h3 style="margin:0 0 .5rem;font-size:1.1rem;font-weight:700;">Card #{i + 1}</h3>
							<p style="margin:0;color:#aaa;font-size:.9rem;line-height:1.5;">Scroll to see the gradual blur fade content behind the overlay edge. The blur stacks multiple layers with progressively higher strength.</p>
						</div>
					{/each}
				</div>
			</div>
			<GradualBlur {position} {strength} {height} {divCount} {exponential} {opacity} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="gradual-blur" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Position" value={position} options={[{ label: 'Bottom', value: 'bottom' }, { label: 'Top', value: 'top' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]} onChange={(v) => (position = v as Position)} />
			<PreviewSlider title="Strength" min={0} max={10} step={0.1} value={strength} onChange={(v) => (strength = v)} />
			<PreviewSlider title="Div Count" min={1} max={20} step={1} value={divCount} onChange={(v) => (divCount = v)} />
			<PreviewSlider title="Opacity" min={0} max={1} step={0.05} value={opacity} onChange={(v) => (opacity = v)} />
			<PreviewSwitch title="Exponential" checked={exponential} onChange={(v) => (exponential = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
