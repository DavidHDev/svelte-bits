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
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ElectricLogo from '$lib/components/library/Animations/ElectricLogo/ElectricLogo.svelte';
	import source from '$lib/components/library/Animations/ElectricLogo/ElectricLogo.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import apple from '$lib/assets/logos/apple.svg';
	import tesla from '$lib/assets/logos/tesla.svg';
	import openai from '$lib/assets/logos/openai.svg';

	type PaletteName = 'logo' | 'apple' | 'tesla' | 'openai';
	type Palette = { color: string; glowColor: string };

	const LOGOS: Record<PaletteName, string> = { logo, apple, tesla, openai };

	const PALETTES: Record<PaletteName, { dark: Palette; light: Palette }> = {
		logo: {
			dark: { color: '#ffd9c4', glowColor: '#ff8a4c' },
			light: { color: '#ea580c', glowColor: '#ffb089' }
		},
		apple: {
			dark: { color: '#cadcff', glowColor: '#528aff' },
			light: { color: '#3377ff', glowColor: '#99b8ff' }
		},
		tesla: {
			dark: { color: '#ffcdd2', glowColor: '#ff5260' },
			light: { color: '#ef3848', glowColor: '#ffa3ab' }
		},
		openai: {
			dark: { color: '#c2fff1', glowColor: '#1fd8b6' },
			light: { color: '#0ea88f', glowColor: '#7fe6d5' }
		}
	};

	const LIGHT_BEND = 0.5;

	const lightFor = (name: keyof Palette, value: string) =>
		Object.values(PALETTES).find((palette) => palette.dark[name] === value)?.light[name] ?? value;

	const DEFAULT_PROPS = {
		color: PALETTES.logo.dark.color,
		glowColor: PALETTES.logo.dark.glowColor,
		scale: 0.7,
		intensity: 1,
		glow: 1,
		thickness: 1.5,
		strands: 4,
		bend: 0.6,
		crackle: 1.5,
		arcs: 1,
		flicker: 0.6,
		fill: 0,
		speed: 2.5,
		interactive: true,
		cursorIntensity: 0.75,
		cursorRadius: 100
	};

	const propData: PropRow[] = [
		{
			name: 'src',
			type: 'string',
			default: 'lightning bolt',
			description:
				'Any image URL. SVGs and transparent PNGs are traced by their alpha, opaque images by keying out their backdrop colour.'
		},
		{ name: 'color', type: 'string', default: "'#ffd9c4'", description: 'Colour of the hot core of every strand.' },
		{
			name: 'glowColor',
			type: 'string',
			default: "'#ff8a4c'",
			description: 'Colour of the glow around the strands, the bloom and the interior fill.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '0.7',
			description: 'Size of the logo as a fraction of the container. The glow and arcs extend beyond it.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Overall brightness of the effect.' },
		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Strength of the halo around strands and the soft bloom around the shape.'
		},
		{
			name: 'thickness',
			type: 'number',
			default: '1.5',
			description:
				'Width of the main strand, in px. Satellite strands are thinner, and every strand swells and thins as it flows.'
		},
		{
			name: 'strands',
			type: 'number',
			default: '4',
			description: 'Number of filaments tracing the outline, from 1 to 6. Extra strands come and go along the edge.'
		},
		{
			name: 'bend',
			type: 'number',
			default: '0.6',
			description: 'How far the strands sway and ripple away from the outline. The main strand stays closest.'
		},
		{
			name: 'crackle',
			type: 'number',
			default: '1.5',
			description: 'Size of the fine crinkle along every strand and arc.'
		},
		{
			name: 'arcs',
			type: 'number',
			default: '1',
			description: 'How often short arcs leap off the edge and land further along it. 0 turns them off.'
		},
		{
			name: 'flicker',
			type: 'number',
			default: '0.6',
			description: 'How much the whole effect pulses and each strand shimmers in brightness.'
		},
		{
			name: 'fill',
			type: 'number',
			default: '0',
			description: 'Translucent glow inside the shape, brightest near its edges.'
		},
		{ name: 'speed', type: 'number', default: '2.5', description: 'Animation speed. 0 freezes the current frame.' },
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description:
				'Turn on pointer interactions. Hovering charges the lightning around the cursor, and a click sends a ripple through it with a burst of arcs.'
		},
		{
			name: 'cursorIntensity',
			type: 'number',
			default: '0.75',
			description: 'How strongly the lightning charges up around the cursor. 0 turns the hover charge off.'
		},
		{
			name: 'cursorRadius',
			type: 'number',
			default: '100',
			description: 'Radius of the charged area around the cursor, in px.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description:
				'The background the logo sits on. Dark renders the lightning as emitted light. Light renders crisp electric ink with a white-hot core and a lighter fill.'
		},
		{
			name: 'onRender',
			type: '(canvas: HTMLCanvasElement) => void',
			default: 'undefined',
			description:
				'Called immediately after each rendered frame. Copy the canvas synchronously to capture the current frame for effects such as live reflections.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra classes on the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles on the container.' }
	];

	const usage = `<script lang="ts">
  import ElectricLogo from '$lib/components/ElectricLogo.svelte';
</${'script'}>

<div style="width: 100%; height: 480px; position: relative;">
  <ElectricLogo
    src="/logo.svg"
    color="#ffd9c4"
    glowColor="#ff8a4c"
    scale={0.7}
    strands={4}
    bend={0.6}
    crackle={1.5}
    arcs={1}
    speed={2.5}
    interactive
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let key = $state(0);

	let image = $state<string>(
		(Object.keys(PALETTES) as PaletteName[]).find((name) => PALETTES[name].dark.color === demo.props.color) || 'logo'
	);
	let upload = $state<{ url: string; name: string } | null>(null);
	let inputEl = $state<HTMLInputElement>();

	const baseReset = demo.resetProps;
	demo.resetProps = () => {
		baseReset();
		image = 'logo';
	};

	$effect(() => {
		const current = upload;
		if (!current) return;
		return () => URL.revokeObjectURL(current.url);
	});

	const handleFile = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		upload = { url: URL.createObjectURL(file), name: file.name };
		image = 'upload';
	};

	const imageOptions = $derived([
		{ label: 'Svelte Bits', value: 'logo' },
		{ label: 'Apple', value: 'apple' },
		{ label: 'Tesla', value: 'tesla' },
		{ label: 'OpenAI', value: 'openai' },
		...(upload ? [{ label: 'Your upload', value: 'upload' }] : [])
	]);

	const src = $derived(image === 'upload' && upload ? upload.url : LOGOS[image as PaletteName] || logo);

	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const renderedColor = $derived(colorModeValue(lightFor('color', settings.color), settings.color));
	const renderedGlow = $derived(colorModeValue(lightFor('glowColor', settings.glowColor), settings.glowColor));
	const renderedBend = $derived(
		colorModeValue(settings.bend === DEFAULT_PROPS.bend ? LIGHT_BEND : settings.bend, settings.bend)
	);

	const selectImage = (value: string) => {
		image = value;
		const palette = PALETTES[value as PaletteName];
		if (palette) demo.updateProps({ color: palette.dark.color, glowColor: palette.dark.glowColor });
	};
</script>

<TabsLayout propsState={demo} componentName="ElectricLogo" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<ElectricLogo
					{src}
					color={renderedColor}
					glowColor={renderedGlow}
					scale={settings.scale}
					intensity={settings.intensity}
					glow={settings.glow}
					thickness={settings.thickness}
					strands={settings.strands}
					bend={renderedBend}
					crackle={settings.crackle}
					arcs={settings.arcs}
					flicker={settings.flicker}
					fill={settings.fill}
					speed={settings.speed}
					interactive={settings.interactive}
					cursorIntensity={settings.cursorIntensity}
					cursorRadius={settings.cursorRadius}
					{theme}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Image" options={imageOptions} value={image} onChange={selectImage} />
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
					accept="image/svg+xml,image/png,image/webp,image/jpeg"
					hidden
					onchange={handleFile}
				/>
			</div>

			<PreviewColorPickerCustom title="Color" color={renderedColor} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Glow Color"
				color={renderedGlow}
				onChange={(v) => demo.updateProp('glowColor', v)}
			/>

			<PreviewSlider
				title="Scale"
				min={0.2}
				max={1}
				step={0.05}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Fill"
				min={0}
				max={1}
				step={0.05}
				value={settings.fill}
				onChange={(v) => demo.updateProp('fill', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={3}
				step={0.1}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Strands"
				min={1}
				max={6}
				step={1}
				value={settings.strands}
				onChange={(v) => demo.updateProp('strands', v)}
			/>
			<PreviewSlider
				title="Bend"
				min={0}
				max={2}
				step={0.05}
				value={renderedBend}
				onChange={(v) => demo.updateProp('bend', v)}
			/>
			<PreviewSlider
				title="Crackle"
				min={0}
				max={2}
				step={0.05}
				value={settings.crackle}
				onChange={(v) => demo.updateProp('crackle', v)}
			/>
			<PreviewSlider
				title="Arcs"
				min={0}
				max={2}
				step={0.05}
				value={settings.arcs}
				onChange={(v) => demo.updateProp('arcs', v)}
			/>
			<PreviewSlider
				title="Flicker"
				min={0}
				max={1}
				step={0.05}
				value={settings.flicker}
				onChange={(v) => demo.updateProp('flicker', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v) => demo.updateProp('interactive', v)}
			/>
			<PreviewSlider
				title="Cursor Intensity"
				min={0}
				max={2}
				step={0.05}
				isDisabled={!settings.interactive}
				value={settings.cursorIntensity}
				onChange={(v) => demo.updateProp('cursorIntensity', v)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={40}
				max={300}
				step={5}
				isDisabled={!settings.interactive}
				value={settings.cursorRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cursorRadius', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
