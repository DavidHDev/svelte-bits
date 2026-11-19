<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import ElasticMesh, {
		type ElasticMeshMaterial
	} from '$lib/components/library/Animations/ElasticMesh/ElasticMesh.svelte';
	import source from '$lib/components/library/Animations/ElasticMesh/ElasticMesh.svelte?raw';

	const BALLOON = {
		material: 'balloon' as ElasticMeshMaterial,
		color: '#3b5bff',
		inflate: 1,
		stiffness: 0.5,
		wobble: 0.6
	};

	const DEFAULT_PROPS = {
		preset: 'balloon',
		content: 'text',
		text: 'Squish',
		...BALLOON,
		grabRadius: 70,
		stretch: 0.5,
		press: 0.5,
		shadow: 0.5,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		balloon: BALLOON,
		chrome: { ...BALLOON, material: 'chrome', color: '#ffffff', stiffness: 0.65, wobble: 0.5 },
		jelly: { ...BALLOON, material: 'jelly', color: '#ff5a1f', stiffness: 0.35, wobble: 0.85 },
		clay: { ...BALLOON, material: 'clay', color: '#ece6dc', inflate: 0.85, stiffness: 0.6, wobble: 0.35 }
	};

	const PRESET_OPTIONS = [
		{ value: 'balloon', label: 'Balloon' },
		{ value: 'chrome', label: 'Chrome' },
		{ value: 'jelly', label: 'Jelly' },
		{ value: 'clay', label: 'Clay' }
	];

	const CONTENT_OPTIONS = [
		{ value: 'text', label: 'Text' },
		{ value: 'logo', label: 'Logo' }
	];

	const MATERIAL_OPTIONS = [
		{ value: 'balloon', label: 'Balloon' },
		{ value: 'chrome', label: 'Chrome' },
		{ value: 'jelly', label: 'Jelly' },
		{ value: 'clay', label: 'Clay' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: "'Squish'", description: 'Text to inflate. Use \\n for more lines.' },
		{
			name: 'src',
			type: 'string',
			default: "''",
			description: 'URL of an SVG or PNG to inflate instead of text. Its transparent pixels define the shape.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: "'system-ui, sans-serif'",
			description: 'Font used for the text. Heavy, rounded faces inflate best.'
		},
		{ name: 'fontWeight', type: 'number', default: '900', description: 'Weight of the text.' },
		{ name: 'color', type: 'string', default: "'#3b5bff'", description: 'Base color of the material.' },
		{
			name: 'imageColors',
			type: 'boolean',
			default: 'true',
			description: 'Keeps the colors of the image passed to src instead of using color.'
		},
		{
			name: 'material',
			type: "'balloon' | 'chrome' | 'jelly' | 'clay'",
			default: "'balloon'",
			description: 'Surface finish: glossy balloon, mirror chrome, glowing jelly or soft matte clay.'
		},
		{ name: 'inflate', type: 'number', default: '1', description: 'How puffy the shape is. 1 gives round tubes.' },
		{
			name: 'stiffness',
			type: 'number',
			default: '0.5',
			description: 'How firm the material feels, from 0 for soft and stretchy to 1 for firm and quick.'
		},
		{
			name: 'wobble',
			type: 'number',
			default: '0.6',
			description: 'How long it jiggles after a poke or a pull, from 0 to 1.'
		},
		{
			name: 'grabRadius',
			type: 'number',
			default: '70',
			description: 'Size of the area the cursor grabs and presses, in pixels.'
		},
		{ name: 'stretch', type: 'number', default: '0.5', description: 'How far the material can be pulled, from 0 to 1.' },
		{ name: 'press', type: 'number', default: '0.5', description: 'Depth of the dent under the cursor and of a poke.' },
		{ name: 'shadow', type: 'number', default: '0.5', description: 'Strength of the soft drop shadow.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Inflates the shape letter by letter on mount.' },
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Lighting setup for dark or light pages.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ElasticMesh from '$lib/components/ElasticMesh.svelte';
</${'script'}>

<div style="width: 100%; height: 500px; position: relative;">
  <ElasticMesh
    text="Squish"
    material="balloon"
    color="#3b5bff"
    inflate={1}
    stiffness={0.5}
    wobble={0.6}
    theme="dark"
  />
</div>

<div style="width: 100%; height: 500px; position: relative;">
  <ElasticMesh src="/logo.svg" material="chrome" imageColors={false} />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, content: _content, text: _text, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	let key = $state(0);
	let typed = $state(demo.props.text);

	$effect(() => {
		const text = settings.text;
		const timer = setTimeout(() => (typed = text), 350);
		return () => clearTimeout(timer);
	});

	const computedProps = $derived<Record<string, unknown>>(
		settings.content === 'logo' ? { src: logo, imageColors: false } : { text: typed }
	);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], content: settings.content, text: settings.text, preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="ElasticMesh"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'content', 'text']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<ElasticMesh {...componentProps} {...computedProps} {theme} />
			{/key}
			<p
				class="pointer-events-none absolute bottom-5 left-1/2 m-0 -translate-x-1/2 text-sm whitespace-nowrap select-none"
				style="color: var(--text-dimmed);"
			>
				Press, poke and pull
			</p>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Content"
				options={CONTENT_OPTIONS}
				value={settings.content}
				onChange={(v) => demo.updateProp('content', v)}
			/>
			<PreviewInput
				title="Text"
				value={settings.text}
				maxLength={24}
				isDisabled={settings.content !== 'text'}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewSelect
				title="Material"
				options={MATERIAL_OPTIONS}
				value={settings.material}
				onChange={(v) => demo.updateProp('material', v)}
			/>
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Inflate"
				min={0.4}
				max={1.6}
				step={0.05}
				value={settings.inflate}
				onChange={(v) => demo.updateProp('inflate', v)}
			/>
			<PreviewSlider
				title="Stiffness"
				min={0}
				max={1}
				step={0.05}
				value={settings.stiffness}
				onChange={(v) => demo.updateProp('stiffness', v)}
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
				title="Grab Radius"
				min={30}
				max={160}
				step={5}
				value={settings.grabRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('grabRadius', v)}
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
				title="Press"
				min={0}
				max={1}
				step={0.05}
				value={settings.press}
				onChange={(v) => demo.updateProp('press', v)}
			/>
			<PreviewSlider
				title="Shadow"
				min={0}
				max={1}
				step={0.05}
				value={settings.shadow}
				onChange={(v) => demo.updateProp('shadow', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
