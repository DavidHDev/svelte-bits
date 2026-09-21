<script lang="ts">
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import FlipCard, {
		type FlipCardProps,
	} from '$lib/components/library/Micro/FlipCard/FlipCard.svelte';
	import source from '$lib/components/library/Micro/FlipCard/FlipCard.svelte?raw';
	const IMAGE =
		'https://images.unsplash.com/photo-1632231484562-3d2bed7e808d?q=80&w=1318&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const DEFAULT_PROPS: Pick<
		Required<FlipCardProps>,
		| 'axis'
		| 'flipOnClick'
		| 'draggable'
		| 'dragDistance'
		| 'tilt'
		| 'tiltMax'
		| 'glare'
		| 'glareOpacity'
		| 'hoverScale'
		| 'perspective'
		| 'stiffness'
		| 'damping'
		| 'width'
		| 'height'
		| 'radius'
		| 'background'
		| 'color'
		| 'shadow'
		| 'shadowColor'
		| 'shadowOpacity'
		| 'disabled'
	> = {
		axis: 'y',
		flipOnClick: true,
		draggable: true,
		dragDistance: 0,
		tilt: true,
		tiltMax: 12,
		glare: true,
		glareOpacity: 0.22,
		hoverScale: 1.03,
		perspective: 1100,
		stiffness: 170,
		damping: 20,
		width: 300,
		height: 400,
		radius: 22,
		background: '#3A312A',
		color: '#F5EFE9',
		shadow: true,
		shadowColor: '#000000',
		shadowOpacity: 0.45,
		disabled: false,
	};
	const AXIS_OPTIONS = [
		{ value: 'y', label: 'Horizontal' },
		{ value: 'x', label: 'Vertical' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		axis,
		flipOnClick,
		draggable,
		dragDistance,
		tilt,
		tiltMax,
		glare,
		glareOpacity,
		hoverScale,
		perspective,
		stiffness,
		damping,
		width,
		height,
		radius,
		background,
		color,
		shadow,
		shadowColor,
		shadowOpacity,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedBackground = $derived(background);
	const renderedColor = $derived(color);
	const renderedShadowOpacity = $derived(shadowOpacity);
	const propData: PropRow[] = [
		{
			name: 'front',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Content of the front face.',
		},
		{
			name: 'back',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Content of the back face.',
		},
		{
			name: 'flipped',
			type: 'boolean',
			default: '-',
			description: 'Controlled state: true shows the back. Omit it to let the card manage itself.',
		},
		{
			name: 'defaultFlipped',
			type: 'boolean',
			default: 'false',
			description: 'Start on the back face.',
		},
		{
			name: 'onFlipChange',
			type: '(flipped: boolean) => void',
			default: '-',
			description: 'Fires when a click, drag, flick or key lands on the other face.',
		},
		{
			name: 'axis',
			type: "'y' | 'x'",
			default: "'y'",
			description:
				'y turns the card sideways and drags horizontally. x turns it over the top and drags vertically.',
		},
		{
			name: 'flipOnClick',
			type: 'boolean',
			default: 'true',
			description: 'A press without movement flips the card.',
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description:
				'Drag to turn the card by hand. On release it springs to the nearest face, carrying the flick velocity.',
		},
		{
			name: 'dragDistance',
			type: 'number',
			default: '0',
			description:
				'Pixels of drag for a half turn. 0 uses the card width, or its height on the x axis.',
		},
		{
			name: 'tilt',
			type: 'boolean',
			default: 'true',
			description: 'The card leans toward the cursor on hover.',
		},
		{
			name: 'tiltMax',
			type: 'number',
			default: '12',
			description: 'Largest tilt angle in degrees.',
		},
		{
			name: 'glare',
			type: 'boolean',
			default: 'true',
			description: 'A soft sheen that follows the cursor.',
		},
		{
			name: 'glareOpacity',
			type: 'number',
			default: '0.22',
			description: 'Strength of the sheen at its centre.',
		},
		{
			name: 'hoverScale',
			type: 'number',
			default: '1.03',
			description: 'Lift while hovered or held.',
		},
		{
			name: 'perspective',
			type: 'number',
			default: '1100',
			description: 'Viewing distance in px. Smaller is more dramatic.',
		},
		{
			name: 'stiffness',
			type: 'number',
			default: '170',
			description: 'Stiffness of the flip spring.',
		},
		{
			name: 'damping',
			type: 'number',
			default: '20',
			description: 'Damping of the flip spring. Lower overshoots more.',
		},
		{
			name: 'width',
			type: 'number',
			default: '300',
			description: 'Card width in px, capped at the parent.',
		},
		{ name: 'height', type: 'number', default: '400', description: 'Card height in px.' },
		{ name: 'radius', type: 'number', default: '22', description: 'Corner radius in px.' },
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'Surface of both faces.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Text colour of both faces.',
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'true',
			description: 'A soft shadow beneath the card that narrows as it turns edge on.',
		},
		{ name: 'shadowColor', type: 'string', default: '"#000000"', description: 'Shadow colour.' },
		{ name: 'shadowOpacity', type: 'number', default: '0.45', description: 'Shadow strength.' },
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Dimmed, flat and inert.' },
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Flip card"',
			description: 'Accessible name. The face is carried by aria-pressed.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	type CSSProperties = Record<string, string | number | undefined | null>;
	function css(value: CSSProperties | undefined): string {
		const unitless =
			/^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio|strokeWidth|strokeDashoffset|strokeDasharray|fillOpacity|strokeOpacity|stopOpacity|pathLength)$/;
		return Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([key, value]) => {
				const name = key.startsWith('--')
					? key
					: key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return (
					name +
					':' +
					(typeof value === 'number' && value !== 0 && !key.startsWith('--') && !unitless.test(key)
						? value + 'px'
						: value)
				);
			})
			.join(';');
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import FlipCard from \'./FlipCard.svelte\';\n<\/script>\n\n<FlipCard\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'front',
						'back',
						'flipped',
						'defaultFlipped',
						'onFlipChange',
						'axis',
						'flipOnClick',
						'draggable',
						'dragDistance',
						'tilt',
						'tiltMax',
						'glare',
						'glareOpacity',
						'hoverScale',
						'perspective',
						'stiffness',
						'damping',
						'width',
						'height',
						'radius',
						'background',
						'color',
						'shadow',
						'shadowColor',
						'shadowOpacity',
						'disabled',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  {#snippet front()}<div class="grid h-full place-items-center">Front</div>{/snippet}\n  {#snippet back()}<div class="grid h-full place-items-center">Back</div>{/snippet}\n</FlipCard>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

{#snippet Front()}<img
		src={IMAGE}
		alt="Wooded Landscape, 17th century"
		draggable={false}
		style={css({ display: 'block', width: '100%', height: '100%', objectFit: 'cover' })}
	/>{/snippet}
{#snippet Back()}<div style={css({ position: 'relative', height: '100%', textAlign: 'left' })}>
		<img
			src={IMAGE}
			alt=""
			draggable={false}
			style={css({
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				transform: 'scaleX(-1)',
				filter: 'grayscale(1) contrast(1.1)',
				opacity: 0.34,
			})}
		/>
		<div
			style={css({
				position: 'absolute',
				inset: 0,
				background:
					'linear-gradient(to bottom, var(--fc-bg) 0%, color-mix(in srgb, var(--fc-bg) 55%, transparent) 26%, transparent 46%, transparent 58%, color-mix(in srgb, var(--fc-bg) 60%, transparent) 80%, var(--fc-bg) 100%)',
			})}
		></div>
		<div
			style={css({
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				height: '100%',
				padding: '26px 28px',
				boxSizing: 'border-box',
			})}
		>
			<span
				style={css({
					fontSize: 27,
					fontWeight: 500,
					lineHeight: 1.1,
					letterSpacing: '-0.03em',
					whiteSpace: 'nowrap',
				})}
			>
				Wooded Landscape
			</span>
			<div
				style={css({
					display: 'flex',
					alignItems: 'baseline',
					justifyContent: 'space-between',
					gap: 16,
					fontSize: 14,
					lineHeight: 1.2,
					letterSpacing: '0.01em',
					opacity: 0.7,
				})}
			>
				<span>17th century</span> <span>Rijksmuseum</span>
			</div>
		</div>
	</div>{/snippet}
<svelte:head><title>Flip Card - svelte-bits</title></svelte:head>
<h1 class="sub-category">Flip Card</h1>
<TabsLayout onreset={reset} {hasChanges} componentName="FlipCard" {usage} {source} props={propData}>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:500px;"
			>
				{#key epoch}<FlipCard {...props}
						>{#snippet front()}{@render Front()}{/snippet}{#snippet back()}{@render Back()}{/snippet}</FlipCard
					>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="flip-card" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Axis"
				options={AXIS_OPTIONS}
				value={axis}
				onChange={(val) => updateProp('axis', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Flip On Click"
				checked={flipOnClick}
				onChange={(val) => updateProp('flipOnClick', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Draggable"
				checked={draggable}
				onChange={(val) => updateProp('draggable', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Drag Distance"
				min={0}
				max={600}
				step={10}
				value={dragDistance}
				valueUnit="px"
				isDisabled={!draggable}
				onChange={(val) => updateProp('dragDistance', val)}
			></PreviewSlider>
			<PreviewSwitch title="Tilt" checked={tilt} onChange={(val) => updateProp('tilt', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Tilt Max"
				min={0}
				max={30}
				step={1}
				value={tiltMax}
				valueUnit="°"
				isDisabled={!tilt}
				onChange={(val) => updateProp('tiltMax', val)}
			></PreviewSlider>
			<PreviewSwitch title="Glare" checked={glare} onChange={(val) => updateProp('glare', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Glare Opacity"
				min={0}
				max={0.6}
				step={0.02}
				value={glareOpacity}
				isDisabled={!glare}
				onChange={(val) => updateProp('glareOpacity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Hover Scale"
				min={1}
				max={1.1}
				step={0.01}
				value={hoverScale}
				onChange={(val) => updateProp('hoverScale', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Perspective"
				min={400}
				max={2400}
				step={50}
				value={perspective}
				valueUnit="px"
				onChange={(val) => updateProp('perspective', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stiffness"
				min={60}
				max={500}
				step={10}
				value={stiffness}
				onChange={(val) => updateProp('stiffness', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Damping"
				min={6}
				max={50}
				step={1}
				value={damping}
				onChange={(val) => updateProp('damping', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Width"
				min={180}
				max={380}
				step={10}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={220}
				max={460}
				step={10}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={48}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Color"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewSwitch title="Shadow" checked={shadow} onChange={(val) => updateProp('shadow', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Shadow Color"
				value={shadowColor}
				onChange={(val) => updateProp('shadowColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Shadow Opacity"
				min={0}
				max={1}
				step={0.05}
				value={renderedShadowOpacity}
				isDisabled={!shadow}
				onChange={(val) => updateProp('shadowOpacity', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
