<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import Crosshair, {
		type CrosshairLineStyle,
		type CrosshairTargetEffect
	} from '$lib/components/library/Animations/Crosshair/Crosshair.svelte';
	import source from '$lib/components/library/Animations/Crosshair/Crosshair.svelte?raw';

	type BlendMode = 'normal' | 'difference';

	const LIGHT_INK = '#18181b';

	const DEFAULT_PROPS = {
		color: '#ffffff',
		scope: 'container',
		targetEffect: 'lock' as CrosshairTargetEffect,
		lineStyle: 'solid' as CrosshairLineStyle,
		blendMode: 'normal' as BlendMode,
		thickness: 1,
		opacity: 0.85,
		gap: 0,
		fade: 0,
		smoothing: 0.35,
		showCoordinates: true,
		clickPulse: true,
		hideCursor: false
	};

	const SCOPE_OPTIONS = [
		{ value: 'container', label: 'Container' },
		{ value: 'viewport', label: 'Viewport' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'lock', label: 'Lock' },
		{ value: 'glitch', label: 'Glitch' },
		{ value: 'none', label: 'None' }
	];

	const LINE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' }
	];

	const BLEND_OPTIONS = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'difference', label: 'Difference' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#ffffff'", description: 'Color of the lines, labels and brackets.' },
		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description:
				'Keeps the crosshair inside this element, which needs a position other than static. Without it the crosshair covers the whole viewport.'
		},
		{ name: 'thickness', type: 'number', default: '1', description: 'Line thickness in px.' },
		{ name: 'opacity', type: 'number', default: '0.85', description: 'Opacity of everything the crosshair draws.' },
		{
			name: 'lineStyle',
			type: "'solid' | 'dashed' | 'dotted'",
			default: "'solid'",
			description: 'Stroke style of the two lines.'
		},
		{
			name: 'gap',
			type: 'number',
			default: '0',
			description: 'Empty space in px left around the pointer where the lines would cross.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'How much the lines fade out toward the edges, from 0 to 1.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.35',
			description: 'How far the lines trail behind the pointer. 0 sticks to it.'
		},
		{
			name: 'showCoordinates',
			type: 'boolean',
			default: 'true',
			description: 'Shows the pointer position where the lines meet the edges, and the size of a locked target.'
		},
		{
			name: 'targetEffect',
			type: "'lock' | 'glitch' | 'none'",
			default: "'lock'",
			description:
				'What happens over a target. Lock frames it with corner brackets and measures it, glitch shakes the lines like a bad signal.'
		},
		{
			name: 'targetSelector',
			type: 'string',
			default: "'a, button, [data-crosshair-target]'",
			description: 'CSS selector for the elements the crosshair reacts to.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Sends a ring out from the pointer on every click or tap.'
		},
		{
			name: 'hideCursor',
			type: 'boolean',
			default: 'false',
			description: 'Hides the system cursor inside the crosshair area and marks the pointer with a dot instead.'
		},
		{
			name: 'blendMode',
			type: "'normal' | 'difference'",
			default: "'normal'",
			description: 'Difference inverts whatever is under the lines, so they stay visible on any background.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the canvas.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the canvas.' }
	];

	const usage = `<script lang="ts">
  import Crosshair from '$lib/components/Crosshair.svelte';

  let container = $state<HTMLElement | null>(null);
</${'script'}>

<div bind:this={container} style="position: relative; height: 400px;">
  <Crosshair
    containerRef={container}
    color="#ffffff"
    targetEffect="lock"
    thickness={1}
    opacity={0.85}
    smoothing={0.35}
    showCoordinates
  />
  <a href="/docs">Read the docs</a>
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const crosshairProps = $derived.by(() => {
		const { scope: _scope, color: _color, ...rest } = settings;
		return rest;
	});
	const inkDefault = $derived(theme.isLight && settings.color === DEFAULT_PROPS.color);
	const color = $derived(inkDefault ? LIGHT_INK : settings.color);
	const computedProps = $derived<{ color?: string }>(inkDefault ? { color: LIGHT_INK } : {});

	let containerEl = $state<HTMLElement | null>(null);
</script>

<TabsLayout
	propsState={demo}
	componentName="Crosshair"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['scope']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={containerEl}
			class="demo-container"
			style="position: relative; min-height: 440px; overflow: hidden;"
		>
			<Crosshair {...crosshairProps} {color} containerRef={settings.scope === 'viewport' ? null : containerEl} />

			<div class="flex select-none flex-col items-center px-6 text-center">
				<p
					data-crosshair-target
					class="m-0 text-[2.1rem] font-semibold leading-[1.05] tracking-[-1.5px] md:text-[3.4rem]"
				>
					Built to the pixel
				</p>
				<p class="mt-4 mb-0 max-w-[380px] text-[15px]" style="color: var(--text-muted);">
					Move around, then hover the buttons and the heading.
				</p>
				<div class="mt-8 flex flex-wrap justify-center gap-3">
					<button
						type="button"
						class="h-[44px] cursor-pointer rounded-[10px] border-0 px-5 text-[15px] font-medium"
						style="background: var(--text-primary); color: var(--bg-body);"
					>
						Get started
					</button>
					<a
						href="https://github.com/DavidHDev/svelte-bits"
						target="_blank"
						rel="noreferrer"
						class="crosshair-demo-ghost inline-flex h-[44px] items-center rounded-[10px] px-5 text-[15px] font-medium no-underline"
					>
						View on GitHub
					</a>
				</div>
			</div>
		</div>

		<Customize>
			<PreviewColorPickerCustom title="Color" {color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSelect
				title="Scope"
				options={SCOPE_OPTIONS}
				value={settings.scope}
				onChange={(v) => demo.updateProp('scope', v)}
			/>
			<PreviewSelect
				title="Target Effect"
				options={EFFECT_OPTIONS}
				value={settings.targetEffect}
				onChange={(v) => demo.updateProp('targetEffect', v)}
			/>
			<PreviewSelect
				title="Line Style"
				options={LINE_OPTIONS}
				value={settings.lineStyle}
				onChange={(v) => demo.updateProp('lineStyle', v)}
			/>
			<PreviewSelect
				title="Blend Mode"
				options={BLEND_OPTIONS}
				value={settings.blendMode}
				onChange={(v) => demo.updateProp('blendMode', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={4}
				step={0.5}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(v) => demo.updateProp('opacity', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={40}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(v) => demo.updateProp('fade', v)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0}
				max={1}
				step={0.05}
				value={settings.smoothing}
				onChange={(v) => demo.updateProp('smoothing', v)}
			/>
			<PreviewSwitch
				title="Coordinates"
				isChecked={settings.showCoordinates}
				onChange={(v) => demo.updateProp('showCoordinates', v)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(v) => demo.updateProp('clickPulse', v)}
			/>
			<PreviewSwitch
				title="Hide Cursor"
				isChecked={settings.hideCursor}
				onChange={(v) => demo.updateProp('hideCursor', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.crosshair-demo-ghost {
		color: var(--text-primary);
		background: var(--surface-ghost);
	}

	.crosshair-demo-ghost:hover {
		background: var(--surface-ghost-hover);
	}
</style>
