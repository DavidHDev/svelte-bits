<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import DecayCard from '$lib/components/library/Components/DecayCard/DecayCard.svelte';
	import source from '$lib/components/library/Components/DecayCard/DecayCard.svelte?raw';

	type Scope = 'window' | 'card';

	const IMAGE = 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=900&q=80&auto=format&fit=crop';

	const SCOPE_OPTIONS = [
		{ value: 'window', label: 'Window' },
		{ value: 'card', label: 'Card' }
	];

	const DEFAULT_PROPS = {
		preset: 'torn',
		width: 300,
		height: 400,
		intensity: 0.5,
		sensitivity: 0.5,
		hoverDecay: 0.05,
		recovery: 0.6,
		idle: 0.35,
		grain: 0.25,
		detail: 5,
		pattern: 4,
		flow: 0,
		chroma: 0,
		travel: 50,
		tilt: 10,
		scope: 'window' as Scope,
		radius: 0,
		grayscale: false
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		torn: {},
		shatter: { intensity: 0.7, grain: 0.5, detail: 6, sensitivity: 0.65, recovery: 0.45 },
		melt: { intensity: 0.45, grain: 0.1, detail: 2, recovery: 1, flow: 0.4 },
		prism: { intensity: 0.4, chroma: 0.6, flow: 0.3, radius: 16 },
		subtle: { intensity: 0.25, sensitivity: 0.35, hoverDecay: 0.1, idle: 0.2, travel: 20, tilt: 4, radius: 16 },
		still: { intensity: 0.4, scope: 'card', travel: 0, tilt: 0, hoverDecay: 0.15, radius: 16 }
	};

	const PRESET_OPTIONS = [
		{ value: 'torn', label: 'Torn' },
		{ value: 'shatter', label: 'Shatter' },
		{ value: 'melt', label: 'Melt' },
		{ value: 'prism', label: 'Prism' },
		{ value: 'subtle', label: 'Subtle' },
		{ value: 'still', label: 'Still' }
	];

	const propData: PropRow[] = [
		{ name: 'image', type: 'string', default: '-', description: 'Image URL. It fills the card like a cover.' },
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content shown over the bottom of the image.' },
		{ name: 'width', type: 'number', default: '300', description: 'Card width in pixels.' },
		{ name: 'height', type: 'number', default: '400', description: 'Card height in pixels.' },
		{
			name: 'intensity',
			type: 'number',
			default: '0.5',
			description:
				'How far the image tears apart at full decay, from 0 to 2. The edges tear the most so the photo stays readable.'
		},
		{
			name: 'sensitivity',
			type: 'number',
			default: '0.5',
			description: 'How little pointer movement it takes to reach full decay, from 0 to 1.'
		},
		{
			name: 'hoverDecay',
			type: 'number',
			default: '0.05',
			description: 'Decay that stays while the pointer rests on the card, from 0 to 1.'
		},
		{
			name: 'recovery',
			type: 'number',
			default: '0.6',
			description: 'Seconds the image takes to pull itself back together once the pointer slows down.'
		},
		{
			name: 'idle',
			type: 'number',
			default: '0.35',
			description: 'Keeps the edges slowly fraying and soft patches drifting while nobody interacts, from 0 to 1.'
		},
		{
			name: 'grain',
			type: 'number',
			default: '0.25',
			description: 'Size of the tears, from broad melting shapes at 0 to fine shards at 1.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '5',
			description: 'Layers of noise in the tears, from 1 to 8. More layers give rougher edges.'
		},
		{ name: 'pattern', type: 'number', default: '4', description: 'Picks a different tear pattern.' },
		{
			name: 'flow',
			type: 'number',
			default: '0',
			description: 'Lets the tears churn while the card is decaying. 0 keeps them still.'
		},
		{ name: 'chroma', type: 'number', default: '0', description: 'Splits the color channels apart inside the tears.' },
		{
			name: 'travel',
			type: 'number',
			default: '50',
			description: 'How far in pixels the card drifts toward the pointer before it slows down.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '10',
			description: 'How far in degrees the card rotates as the pointer moves sideways.'
		},
		{
			name: 'scope',
			type: "'window' | 'card'",
			default: "'window'",
			description: 'Window follows the pointer anywhere on the page. Card only reacts while it is hovered.'
		},
		{ name: 'radius', type: 'number', default: '0', description: 'Corner radius of the image in pixels.' },
		{ name: 'grayscale', type: 'boolean', default: 'false', description: 'Shows the image in grayscale.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the root.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the root.' }
	];

	const usage = `<script lang="ts">
  import DecayCard from '$lib/components/DecayCard.svelte';
</${'script'}>

<DecayCard
  image="https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=900&q=80&auto=format&fit=crop"
  width={300}
  height={400}
  intensity={0.5}
  sensitivity={0.5}
  hoverDecay={0.05}
  recovery={0.6}
  idle={0.35}
  grain={0.25}
  detail={5}
  pattern={4}
  flow={0}
  chroma={0}
  travel={50}
  tilt={10}
  scope="window"
  radius={0}
  grayscale={false}
>
  <h3>Afterglow</h3>
</DecayCard>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });

	const computedProps = { image: IMAGE };
</script>

<TabsLayout
	propsState={demo}
	componentName="DecayCard"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 560px; overflow: hidden;">
			<div class="flex h-full w-full items-center justify-center">
				<DecayCard {...componentProps} image={IMAGE}>
					<p class="mb-1 text-[12px] text-[rgba(255,255,255,0.72)]">No. 01</p>
					<p class="text-[22px] leading-[1.15] font-semibold tracking-[-0.4px]">Afterglow</p>
				</DecayCard>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Intensity"
				min={0}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Sensitivity"
				min={0}
				max={1}
				step={0.05}
				value={settings.sensitivity}
				onChange={(v) => demo.updateProp('sensitivity', v)}
			/>
			<PreviewSlider
				title="Hover Decay"
				min={0}
				max={1}
				step={0.05}
				value={settings.hoverDecay}
				onChange={(v) => demo.updateProp('hoverDecay', v)}
			/>
			<PreviewSlider
				title="Recovery"
				min={0.1}
				max={3}
				step={0.1}
				valueUnit="s"
				value={settings.recovery}
				onChange={(v) => demo.updateProp('recovery', v)}
			/>
			<PreviewSlider title="Idle" min={0} max={1} step={0.05} value={settings.idle} onChange={(v) => demo.updateProp('idle', v)} />
			<PreviewSlider title="Grain" min={0} max={1} step={0.01} value={settings.grain} onChange={(v) => demo.updateProp('grain', v)} />
			<PreviewSlider title="Detail" min={1} max={8} step={1} value={settings.detail} onChange={(v) => demo.updateProp('detail', v)} />
			<PreviewSlider
				title="Pattern"
				min={0}
				max={50}
				step={1}
				value={settings.pattern}
				onChange={(v) => demo.updateProp('pattern', v)}
			/>
			<PreviewSlider title="Flow" min={0} max={2} step={0.05} value={settings.flow} onChange={(v) => demo.updateProp('flow', v)} />
			<PreviewSlider
				title="Chroma"
				min={0}
				max={2}
				step={0.05}
				value={settings.chroma}
				onChange={(v) => demo.updateProp('chroma', v)}
			/>
			<PreviewSlider
				title="Travel"
				min={0}
				max={150}
				step={5}
				valueUnit="px"
				value={settings.travel}
				onChange={(v) => demo.updateProp('travel', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={30}
				step={1}
				valueUnit="°"
				value={settings.tilt}
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSelect
				title="Scope"
				options={SCOPE_OPTIONS}
				value={settings.scope}
				onChange={(v) => demo.updateProp('scope', v as Scope)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				valueUnit="px"
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Width"
				min={200}
				max={420}
				step={10}
				valueUnit="px"
				value={settings.width}
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Height"
				min={260}
				max={480}
				step={10}
				valueUnit="px"
				value={settings.height}
				onChange={(v) => demo.updateProp('height', v)}
			/>
			<PreviewSwitch title="Grayscale" isChecked={settings.grayscale} onChange={(v) => demo.updateProp('grayscale', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
