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
	import { theme } from '$lib/theme.svelte';
	import MetallicPaint from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte';
	import source from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';

	const LOOK = {
		content: 'logo',
		text: 'Svelte Bits',
		color: '#ffffff',
		density: 2,
		softness: 0.1,
		dispersion: 0.3,
		distortion: 0.07,
		edgeBend: 0.6,
		angle: 70,
		scale: 0.6
	};

	const DEFAULT_PROPS = {
		preset: 'chrome',
		...LOOK,
		speed: 1,
		rotation: 0,
		mouseTilt: 0.5,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		chrome: LOOK,
		liquid: { ...LOOK, edgeBend: 0.92, distortion: 0.22, density: 2.6, dispersion: 0.45 },
		noir: {
			...LOOK,
			color: '#b4b4ba',
			softness: 0.6,
			density: 1.6,
			dispersion: 0,
			distortion: 0.05,
			edgeBend: 0.5,
			angle: 90
		},
		gold: { ...LOOK, content: 'text', text: 'Gold', color: '#f2c46b', dispersion: 0.15, scale: 0.7 },
		prism: {
			...LOOK,
			color: '#9cc4ff',
			softness: 0.8,
			density: 6,
			dispersion: 1,
			distortion: 0.4,
			edgeBend: 0.4,
			angle: 0
		},
		brushed: { ...LOOK, softness: 1, density: 2.5, dispersion: 0, distortion: 0, edgeBend: 0.5, angle: 100 }
	};

	const PRESET_OPTIONS = [
		{ value: 'chrome', label: 'Chrome' },
		{ value: 'liquid', label: 'Liquid' },
		{ value: 'noir', label: 'Noir' },
		{ value: 'gold', label: 'Gold' },
		{ value: 'prism', label: 'Prism' },
		{ value: 'brushed', label: 'Brushed' }
	];

	const CONTENT_OPTIONS = [
		{ value: 'logo', label: 'Logo' },
		{ value: 'text', label: 'Text' }
	];

	const propData: PropRow[] = [
		{
			name: 'imageSrc',
			type: 'string',
			default: 'undefined',
			description: 'URL of the logo or image to paint. SVGs work best. Transparent pixels are left empty.'
		},
		{
			name: 'text',
			type: 'string',
			default: 'undefined',
			description: 'Text to paint instead of an image. Takes priority over imageSrc.'
		},
		{ name: 'fontFamily', type: 'string', default: "'system-ui, sans-serif'", description: 'Font used for text.' },
		{ name: 'fontWeight', type: 'number', default: '800', description: 'Font weight used for text.' },
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Tint of the metal. White keeps it chrome, warm tones turn it gold or copper.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Color behind the shape. By default the canvas is transparent.'
		},
		{ name: 'density', type: 'number', default: '2', description: 'How many reflection bands run across the shape.' },
		{
			name: 'softness',
			type: 'number',
			default: '0.1',
			description: 'Softness of the reflection edges, from 0 for crisp chrome to 1 for brushed metal.'
		},
		{
			name: 'dispersion',
			type: 'number',
			default: '0.3',
			description: 'Rainbow fringes where the reflections bend, from 0 to 1.'
		},
		{
			name: 'distortion',
			type: 'number',
			default: '0.07',
			description: 'How much the reflections ripple as they flow, from 0 to 1.'
		},
		{
			name: 'edgeBend',
			type: 'number',
			default: '0.6',
			description: 'How strongly the reflections bend around the edges of the shape, from 0 to 1.'
		},
		{ name: 'angle', type: 'number', default: '70', description: 'Direction the reflections flow in, in degrees.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Speed of the flow. 0 freezes it.' },
		{ name: 'scale', type: 'number', default: '0.6', description: 'Size of the shape inside the canvas.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation of the shape, in degrees.' },
		{
			name: 'mouseTilt',
			type: 'number',
			default: '0.5',
			description: 'How much the reflections shift as the cursor moves, as if tilting the metal.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Adds a soft dark rim and dims the brightest highlights so the shape reads on light pages.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Pours the metal in from the outline on mount.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Device pixel ratio cap. Renders at 2× or more for clean edges.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: 'undefined', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import MetallicPaint from '$lib/components/MetallicPaint.svelte';
  import logo from './logo.svg';
</${'script'}>

<div style="width: 100%; height: 500px;">
  <MetallicPaint imageSrc={logo} />
</div>

<div style="width: 100%; height: 300px;">
  <MetallicPaint text="Liquid" color="#f2c46b" edgeBend={0.9} />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let key = $state(0);
	let upload = $state<{ url: string; name: string } | null>(null);
	let inputEl = $state<HTMLInputElement>();

	$effect(() => {
		const current = upload;
		if (!current) return;
		return () => URL.revokeObjectURL(current.url);
	});

	const onFile = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		upload = { url: URL.createObjectURL(file), name: file.name };
	};

	const resetAll = () => {
		demo.resetProps();
		upload = null;
	};

	const propsState = {
		get props() {
			return demo.props;
		},
		get defaultProps() {
			return demo.defaultProps;
		},
		get hasChanges() {
			return demo.hasChanges || Boolean(upload);
		},
		updateProp: demo.updateProp,
		updateProps: demo.updateProps,
		resetProps: resetAll
	} as unknown as typeof demo;

	const contentSource = $derived(
		settings.content === 'text'
			? { text: settings.text || 'Svelte Bits', fontFamily: 'Geist, system-ui, sans-serif' }
			: { imageSrc: upload?.url || logo }
	);

	const componentProps = $derived.by(() => {
		const { preset: _preset, content: _content, text: _text, ...rest } = settings;
		return { ...rest, ...contentSource };
	});

	const computedProps = $derived({ ...contentSource, ...(theme.isLight ? { lightMode: true } : {}) });

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	{propsState}
	componentName="MetallicPaint"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'content', 'text']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container h-[380px] md:h-[500px]" style="position: relative; padding: 0; overflow: hidden;">
			{#key key}
				<MetallicPaint {...componentProps} lightMode={theme.isLight} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Content"
				options={CONTENT_OPTIONS}
				value={settings.content}
				onChange={(v) => demo.updateProp('content', v)}
			/>
			{#if settings.content === 'logo'}
				<div class="scrubber">
					<button type="button" class="scrubber-track scrubber-track--select" onclick={() => inputEl?.click()}>
						<span class="scrubber-label">Upload</span>
						<span class="scrubber-select-right">
							<span
								class="scrubber-value"
								style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
							>
								{upload ? upload.name : 'SVG or PNG'}
							</span>
						</span>
					</button>
					<input
						bind:this={inputEl}
						type="file"
						accept="image/svg+xml,image/png,image/webp"
						hidden
						onchange={onFile}
					/>
				</div>
			{/if}
			<PreviewInput
				title="Text"
				value={settings.text}
				maxLength={24}
				isDisabled={settings.content !== 'text'}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Density"
				min={0.5}
				max={8}
				step={0.1}
				value={settings.density}
				onChange={(v) => demo.updateProp('density', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.01}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Dispersion"
				min={0}
				max={1}
				step={0.01}
				value={settings.dispersion}
				onChange={(v) => demo.updateProp('dispersion', v)}
			/>
			<PreviewSlider
				title="Distortion"
				min={0}
				max={1}
				step={0.01}
				value={settings.distortion}
				onChange={(v) => demo.updateProp('distortion', v)}
			/>
			<PreviewSlider
				title="Edge Bend"
				min={0}
				max={1}
				step={0.01}
				value={settings.edgeBend}
				onChange={(v) => demo.updateProp('edgeBend', v)}
			/>
			<PreviewSlider
				title="Angle"
				min={0}
				max={360}
				step={1}
				value={settings.angle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('angle', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.2}
				max={1.2}
				step={0.01}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-180}
				max={180}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(v) => demo.updateProp('rotation', v)}
			/>
			<PreviewSlider
				title="Mouse Tilt"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.mouseTilt}
				onChange={(v) => demo.updateProp('mouseTilt', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
