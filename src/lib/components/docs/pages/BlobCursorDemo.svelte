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
	import BlobCursor, {
		type BlobCursorBlend as Blend,
		type BlobCursorMaterial as Material
	} from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte';
	import source from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte?raw';

	const MATERIAL_OPTIONS = [
		{ label: 'Chrome', value: 'chrome' },
		{ label: 'Jelly', value: 'jelly' },
		{ label: 'Pearl', value: 'pearl' },
		{ label: 'Ink', value: 'ink' }
	];

	const BLEND_OPTIONS = [
		{ label: 'Normal', value: 'normal' },
		{ label: 'Difference', value: 'difference' },
		{ label: 'Exclusion', value: 'exclusion' },
		{ label: 'Multiply', value: 'multiply' },
		{ label: 'Screen', value: 'screen' },
		{ label: 'Overlay', value: 'overlay' }
	];

	const DEFAULT_PROPS = {
		material: 'chrome' as Material,
		color: '#3B82F6',
		blend: 'normal' as Blend,
		size: 140,
		morph: 0,
		morphSpeed: 0.4,
		depth: 1,
		trail: 16,
		lag: 0.55,
		goo: 1,
		stretch: 0.6,
		wobble: 1,
		drip: 0,
		shine: 1,
		splash: true,
		splashCount: 6,
		splashSpeed: 0.5,
		splashSize: 0.5,
		splashGravity: 0,
		regrow: 0.5,
		shadow: false,
		hideCursor: true
	};

	const propData: PropRow[] = [
		{
			name: 'material',
			type: "'chrome' | 'jelly' | 'pearl' | 'ink'",
			default: "'chrome'",
			description:
				'What the blob is made of. Chrome is liquid metal, jelly a glossy colored gel, pearl an iridescent shell and ink a flat goo.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'#3B82F6'",
			description: 'Color of the blob. Tints the reflections on chrome and pearl, and fills jelly and ink.'
		},
		{
			name: 'blend',
			type: "'normal' | 'difference' | 'exclusion' | 'multiply' | 'screen' | 'overlay'",
			default: "'normal'",
			description:
				'How the blob mixes with the page under it. Difference with a white ink blob inverts whatever it covers.'
		},
		{ name: 'size', type: 'number', default: '140', description: 'Diameter of the main blob in pixels.' },
		{
			name: 'morph',
			type: 'number',
			default: '0',
			description:
				'How far the blob drifts from a perfect sphere, from 0 for a round bead to 1 for a restless, shapeshifting puddle.'
		},
		{
			name: 'morphSpeed',
			type: 'number',
			default: '0.4',
			description: 'How fast the shape keeps changing, from 0 for a frozen shape to 1 for a boiling one.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '1',
			description: 'How tall the liquid stands, from 0 for a flat puddle to 1 for a full, round bead.'
		},
		{
			name: 'trail',
			type: 'number',
			default: '16',
			description:
				'How many links the liquid tail has, from 0 for no tail to 16 for a long tail that curves along your path.'
		},
		{
			name: 'lag',
			type: 'number',
			default: '0.55',
			description: 'How lazily the blob follows the pointer, from 0 for tight to 1 for slow and floaty.'
		},
		{
			name: 'goo',
			type: 'number',
			default: '1',
			description:
				'How thick and syrupy the liquid is where the tail and droplets meet the blob, from 0 for crisp to 1 for gooey.'
		},
		{
			name: 'stretch',
			type: 'number',
			default: '0.6',
			description: 'How far the blob pulls out into a teardrop as it moves, from 0 for short to 1 for a long comet.'
		},
		{
			name: 'wobble',
			type: 'number',
			default: '1',
			description: 'How bouncy and jelly-like it is when it stops, turns or gets clicked.'
		},
		{
			name: 'drip',
			type: 'number',
			default: '0',
			description:
				'How many droplets fling off the tail on fast moves. They stay on the page until they dry up or the blob soaks them back up.'
		},
		{
			name: 'shine',
			type: 'number',
			default: '1',
			description: 'Strength of the highlights and reflections.'
		},
		{
			name: 'splash',
			type: 'boolean',
			default: 'true',
			description: 'Clicking bursts droplets out of the blob. They fly off the page and the blob grows back.'
		},
		{
			name: 'splashCount',
			type: 'number',
			default: '6',
			description: 'How many droplets each click throws out, from 1 to 32.'
		},
		{
			name: 'splashSpeed',
			type: 'number',
			default: '0.5',
			description: 'How fast the droplets fly, from 0 for a gentle spill to 1 for a hard burst.'
		},
		{
			name: 'splashSize',
			type: 'number',
			default: '0.5',
			description: 'Size of the droplets relative to the blob. Bigger droplets take more of the blob with them.'
		},
		{
			name: 'splashGravity',
			type: 'number',
			default: '0',
			description: 'Pulls the droplets down as they fly, from 0 for straight lines to 1 for a heavy arc.'
		},
		{
			name: 'regrow',
			type: 'number',
			default: '0.5',
			description: 'How quickly the blob grows back to full size after a splash.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'false',
			description: 'Casts a soft shadow under the blob so it sits on the page.'
		},
		{
			name: 'hideCursor',
			type: 'boolean',
			default: 'true',
			description: 'Hides the system cursor over the area so the blob becomes the cursor.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import BlobCursor from '$lib/components/BlobCursor.svelte';
</${'script'}>

<div style="position: relative; height: 500px;">
  <BlobCursor
    material="chrome"
    color="#3B82F6"
    size={140}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="BlobCursor" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; overflow: hidden;">
			<p
				class="absolute bottom-5 left-1/2 m-0 -translate-x-1/2 text-sm select-none"
				style="color: var(--text-dimmed);"
			>
				Move and click
			</p>
			<BlobCursor {...settings} />
		</div>

		<Customize>
			<PreviewSelect
				title="Material"
				options={MATERIAL_OPTIONS}
				value={settings.material}
				onChange={(v) => demo.updateProp('material', v as Material)}
			/>
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSelect
				title="Blend"
				options={BLEND_OPTIONS}
				value={settings.blend}
				onChange={(v) => demo.updateProp('blend', v as Blend)}
			/>

			<PreviewSlider
				title="Size"
				min={24}
				max={240}
				step={2}
				value={settings.size}
				onChange={(v) => demo.updateProp('size', v)}
				displayValue={(v) => `${v}px`}
			/>
			<PreviewSlider
				title="Morph"
				min={0}
				max={1}
				step={0.05}
				value={settings.morph}
				onChange={(v) => demo.updateProp('morph', v)}
			/>
			<PreviewSlider
				title="Morph Speed"
				min={0}
				max={1}
				step={0.05}
				value={settings.morphSpeed}
				onChange={(v) => demo.updateProp('morphSpeed', v)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.05}
				value={settings.depth}
				onChange={(v) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={16}
				step={1}
				value={settings.trail}
				onChange={(v) => demo.updateProp('trail', v)}
			/>
			<PreviewSlider
				title="Lag"
				min={0}
				max={1}
				step={0.05}
				value={settings.lag}
				onChange={(v) => demo.updateProp('lag', v)}
			/>
			<PreviewSlider
				title="Goo"
				min={0}
				max={1}
				step={0.05}
				value={settings.goo}
				onChange={(v) => demo.updateProp('goo', v)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={1}
				step={0.05}
				value={settings.stretch}
				onChange={(v) => demo.updateProp('stretch', v)}
			/>
			<PreviewSlider
				title="Wobble"
				min={0}
				max={1}
				step={0.05}
				value={settings.wobble}
				onChange={(v) => demo.updateProp('wobble', v)}
			/>
			<PreviewSlider
				title="Drip"
				min={0}
				max={1}
				step={0.05}
				value={settings.drip}
				onChange={(v) => demo.updateProp('drip', v)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={1}
				step={0.05}
				value={settings.shine}
				onChange={(v) => demo.updateProp('shine', v)}
			/>

			<PreviewSwitch title="Splash" isChecked={settings.splash} onChange={(v) => demo.updateProp('splash', v)} />
			<PreviewSlider
				title="Splash Count"
				min={1}
				max={32}
				step={1}
				value={settings.splashCount}
				onChange={(v) => demo.updateProp('splashCount', v)}
			/>
			<PreviewSlider
				title="Splash Speed"
				min={0}
				max={1}
				step={0.05}
				value={settings.splashSpeed}
				onChange={(v) => demo.updateProp('splashSpeed', v)}
			/>
			<PreviewSlider
				title="Splash Size"
				min={0}
				max={1}
				step={0.05}
				value={settings.splashSize}
				onChange={(v) => demo.updateProp('splashSize', v)}
			/>
			<PreviewSlider
				title="Splash Gravity"
				min={0}
				max={1}
				step={0.05}
				value={settings.splashGravity}
				onChange={(v) => demo.updateProp('splashGravity', v)}
			/>
			<PreviewSlider
				title="Regrow"
				min={0}
				max={1}
				step={0.05}
				value={settings.regrow}
				onChange={(v) => demo.updateProp('regrow', v)}
			/>
			<PreviewSwitch title="Shadow" isChecked={settings.shadow} onChange={(v) => demo.updateProp('shadow', v)} />
			<PreviewSwitch title="Hide Cursor" isChecked={settings.hideCursor} onChange={(v) => demo.updateProp('hideCursor', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
