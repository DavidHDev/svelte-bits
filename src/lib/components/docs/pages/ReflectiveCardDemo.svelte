<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import ReflectiveCard from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte';
	import source from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte?raw';

	type Source = 'video' | 'studio' | 'camera';

	const LOOK = {
		tint: '#ffffff',
		metalness: 1,
		roughness: 0.3,
		blurStrength: 6,
		grayscale: 1,
		warp: 0.6,
		warpScale: 1,
		shine: 1,
		bevel: 3,
		glare: 0.5
	};

	const DEFAULT_PROPS = {
		preset: 'steel',
		source: 'video' as Source,
		name: 'Alexander Doe',
		role: 'Senior Developer',
		...LOOK,
		tiltStrength: 12,
		radius: 24,
		enableTilt: true,
		intro: true
	};

	const PRESETS: Record<string, Partial<typeof LOOK>> = {
		steel: {},
		brushed: { roughness: 0.85, blurStrength: 8, shine: 1.2 },
		mirror: { roughness: 0, blurStrength: 1.5, warp: 0.3 },
		gold: { tint: '#f3cf8a', shine: 1.1 },
		rose: { tint: '#f1b9a4' },
		satin: { blurStrength: 14, roughness: 0.5, glare: 0.4 }
	};

	const PRESET_OPTIONS = [
		{ value: 'steel', label: 'Steel' },
		{ value: 'brushed', label: 'Brushed' },
		{ value: 'mirror', label: 'Mirror' },
		{ value: 'gold', label: 'Gold' },
		{ value: 'rose', label: 'Rose' },
		{ value: 'satin', label: 'Satin' }
	];

	const SOURCE_OPTIONS = [
		{ value: 'video', label: 'Video' },
		{ value: 'studio', label: 'Studio' },
		{ value: 'camera', label: 'Camera' }
	];

	const VIDEOS = {
		light: '/assets/demo/reflection-day.mp4',
		dark: '/assets/demo/reflection-night.mp4'
	};

	const propData = [
		{ name: 'name', type: 'string', default: "'Alexander Doe'", description: 'Name shown on the card.' },
		{ name: 'role', type: 'string', default: "'Senior Developer'", description: 'Role shown under the name.' },
		{ name: 'badge', type: 'string', default: "'Verified'", description: 'Label of the badge in the top left corner.' },
		{
			name: 'status',
			type: 'string',
			default: "'Active'",
			description: 'Label of the status chip in the top right corner.'
		},
		{ name: 'statusColor', type: 'string', default: "'#22c55e'", description: 'Color of the status dot.' },
		{ name: 'idLabel', type: 'string', default: "'ID number'", description: 'Small label above the ID number.' },
		{ name: 'idValue', type: 'string', default: "'8901 2345 6789'", description: 'ID number shown in the footer.' },
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Custom content for the card. Replaces the badge, name and footer.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Dark graphite or light silver metal, with matching text.'
		},
		{
			name: 'videoSrc',
			type: 'string',
			default: '-',
			description: 'Looping video the card reflects when the camera is off. Without one it reflects a soft studio.'
		},
		{
			name: 'webcam',
			type: 'boolean',
			default: 'false',
			description: 'Reflects the camera feed, mirrored. Asks for camera access and falls back to the video.'
		},
		{
			name: 'onWebcamError',
			type: '(error: Error) => void',
			default: '-',
			description: 'Called when camera access is denied or unavailable.'
		},
		{ name: 'tint', type: 'string', default: "'#ffffff'", description: 'Color of the metal. White gives plain steel.' },
		{
			name: 'metalness',
			type: 'number',
			default: '1',
			description: 'How strongly the surface mirrors the scene, from 0 to 1. At 0 the card turns matte.'
		},
		{
			name: 'roughness',
			type: 'number',
			default: '0.3',
			description: 'Brushed grain of the metal, from 0 to 1. Stretches reflections along the grain.'
		},
		{ name: 'blurStrength', type: 'number', default: '6', description: 'Blur of the reflection, in px.' },
		{
			name: 'grayscale',
			type: 'number',
			default: '1',
			description: 'Removes color from the reflection, from 0 to 1. Lower it to see the scene in color.'
		},
		{
			name: 'warp',
			type: 'number',
			default: '0.6',
			description: 'Gentle bends in the surface that ripple the reflection.'
		},
		{ name: 'warpScale', type: 'number', default: '1', description: 'Size of the bends.' },
		{
			name: 'shine',
			type: 'number',
			default: '1',
			description: 'Brightness of the light band that sweeps across the card as it tilts.'
		},
		{
			name: 'bevel',
			type: 'number',
			default: '3',
			description: 'Width of the polished edge that catches the light, in px.'
		},
		{
			name: 'glare',
			type: 'number',
			default: '0.5',
			description: 'Strength of the light that follows the cursor, from 0 to 1.'
		},
		{ name: 'enableTilt', type: 'boolean', default: 'true', description: 'Tilts the card toward the cursor.' },
		{ name: 'tiltStrength', type: 'number', default: '12', description: 'Largest tilt angle, in degrees.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Fades the card in and sweeps the light across it once.'
		},
		{ name: 'width', type: 'number | string', default: '320', description: 'Width of the card. Numbers are in px.' },
		{ name: 'height', type: 'number | string', default: '500', description: 'Height of the card. Numbers are in px.' },
		{ name: 'radius', type: 'number', default: '24', description: 'Corner radius, in px.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the card.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the card.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import ReflectiveCard from '$lib/components/ReflectiveCard.svelte';
${scriptClose}

<ReflectiveCard
  name="Alexander Doe"
  role="Senior Developer"
  videoSrc="/videos/reflection.mp4"
  webcam={false}
  tint="#ffffff"
  metalness={1}
  roughness={0.3}
  blurStrength={6}
  shine={1}
  glare={0.5}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, source: _source, ...rest } = props;
		return rest;
	});
	const cardTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof typeof LOOK]])
		);
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		...(props.source === 'camera' ? { webcam: true } : {}),
		...(cardTheme === 'light' ? { theme: 'light' } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="ReflectiveCard"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'source']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 640px; overflow: hidden;">
			{#key key}
				<ReflectiveCard
					theme={cardTheme}
					videoSrc={props.source === 'studio' ? undefined : VIDEOS[cardTheme]}
					webcam={props.source === 'camera'}
					onWebcamError={() => demo.updateProp('source', 'video')}
					{...settings}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Reflection"
				options={SOURCE_OPTIONS}
				value={props.source}
				onChange={(value) => demo.updateProp('source', value as Source)}
			/>
			<PreviewColorPickerCustom title="Tint" color={settings.tint} onChange={(value) => demo.updateProp('tint', value)} />
			<PreviewInput
				title="Name"
				value={settings.name}
				maxLength={28}
				onChange={(value) => demo.updateProp('name', value)}
			/>
			<PreviewInput
				title="Role"
				value={settings.role}
				maxLength={32}
				onChange={(value) => demo.updateProp('role', value)}
			/>
			<PreviewSlider
				title="Metalness"
				min={0}
				max={1}
				step={0.05}
				value={settings.metalness}
				onChange={(value) => demo.updateProp('metalness', value)}
			/>
			<PreviewSlider
				title="Roughness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roughness}
				onChange={(value) => demo.updateProp('roughness', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={20}
				step={0.5}
				value={settings.blurStrength}
				valueUnit="px"
				onChange={(value) => demo.updateProp('blurStrength', value)}
			/>
			<PreviewSlider
				title="Grayscale"
				min={0}
				max={1}
				step={0.05}
				value={settings.grayscale}
				onChange={(value) => demo.updateProp('grayscale', value)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={2}
				step={0.05}
				value={settings.shine}
				onChange={(value) => demo.updateProp('shine', value)}
			/>
			<PreviewSlider
				title="Glare"
				min={0}
				max={1}
				step={0.05}
				value={settings.glare}
				onChange={(value) => demo.updateProp('glare', value)}
			/>
			<PreviewSlider
				title="Warp"
				min={0}
				max={2}
				step={0.05}
				value={settings.warp}
				onChange={(value) => demo.updateProp('warp', value)}
			/>
			<PreviewSlider
				title="Warp Scale"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.warpScale}
				onChange={(value) => demo.updateProp('warpScale', value)}
			/>
			<PreviewSlider
				title="Bevel"
				min={0}
				max={12}
				step={0.5}
				value={settings.bevel}
				valueUnit="px"
				onChange={(value) => demo.updateProp('bevel', value)}
			/>
			<PreviewSlider
				title="Tilt Strength"
				min={0}
				max={25}
				step={1}
				value={settings.tiltStrength}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tiltStrength', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSwitch
				title="Tilt"
				isChecked={settings.enableTilt}
				onChange={(value) => demo.updateProp('enableTilt', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
