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
	import TearTicket, {
		type TearTicketProps,
	} from '$lib/components/library/Micro/TearTicket/TearTicket.svelte';
	import source from '$lib/components/library/Micro/TearTicket/TearTicket.svelte?raw';
	const IMAGE =
		'https://images.unsplash.com/photo-1604852961945-155837ffebe2?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const DEFAULT_PROPS: Pick<
		Required<TearTicketProps>,
		| 'orientation'
		| 'scrim'
		| 'width'
		| 'height'
		| 'stubSize'
		| 'radius'
		| 'holes'
		| 'holeSize'
		| 'notch'
		| 'roughness'
		| 'tearAngle'
		| 'stretch'
		| 'resistance'
		| 'rotate'
		| 'tilt'
		| 'tiltMax'
		| 'tiltReach'
		| 'parallax'
		| 'perspective'
		| 'background'
		| 'color'
		| 'border'
		| 'borderColor'
		| 'borderWidth'
		| 'recenter'
		| 'disabled'
	> = {
		orientation: 'horizontal',
		scrim: false,
		width: 460,
		height: 250,
		stubSize: 150,
		radius: 16,
		holes: 12,
		holeSize: 6,
		notch: 3,
		roughness: 0,
		tearAngle: 30,
		stretch: 30,
		resistance: 0.45,
		rotate: 4,
		tilt: true,
		tiltMax: 9,
		tiltReach: 260,
		parallax: 6,
		perspective: 1000,
		background: '#3A312A',
		color: '#F5EFE9',
		border: true,
		borderColor: '',
		borderWidth: 1,
		recenter: true,
		disabled: false,
	};
	const ORIENTATION_OPTIONS = [
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' },
	];
	const SIZES = {
		horizontal: { width: 460, height: 250, stubSize: 150 },
		vertical: { width: 300, height: 440, stubSize: 130 },
	};
	const PAD = 24;
	let props = $state({ ...DEFAULT_PROPS });
	const {
		orientation,
		scrim,
		width,
		height,
		stubSize,
		radius,
		holes,
		holeSize,
		notch,
		roughness,
		tearAngle,
		stretch,
		resistance,
		rotate,
		tilt,
		tiltMax,
		tiltReach,
		parallax,
		perspective,
		background,
		color,
		border,
		borderColor,
		borderWidth,
		recenter,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		run++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedBackground = $derived(background);
	const renderedColor = $derived(color);
	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Content of the ticket body.',
		},
		{
			name: 'stub',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Content of the tear-off stub.',
		},
		{
			name: 'image',
			type: 'string',
			default: '""',
			description:
				'Artwork behind the body. It shifts against the tilt for parallax and turns grey once used.',
		},
		{ name: 'imageAlt', type: 'string', default: '""', description: 'Alt text for the artwork.' },
		{
			name: 'scrim',
			type: 'boolean',
			default: 'true',
			description:
				'A fade from the paper colour up over the artwork, so text stays readable on busy images.',
		},
		{
			name: 'imageRadius',
			type: 'number',
			default: '8',
			description:
				'Corner radius of the artwork panel, in px. Set it to the ticket radius minus 8 to stay concentric.',
		},
		{
			name: 'orientation',
			type: "'horizontal' | 'vertical'",
			default: "'horizontal'",
			description:
				'Horizontal puts the stub on the right. Vertical puts the artwork on top and the stub at the bottom.',
		},
		{
			name: 'torn',
			type: 'boolean',
			default: '-',
			description: 'Controlled state. Set it back to false to restore the stub.',
		},
		{ name: 'defaultTorn', type: 'boolean', default: 'false', description: 'Start already used.' },
		{
			name: 'onTear',
			type: '() => void',
			default: '-',
			description: 'Fires once the stub has come free and gone.',
		},
		{
			name: 'width',
			type: 'number',
			default: '460',
			description: 'Ticket width in px. It scales down to fit a narrower parent.',
		},
		{ name: 'height', type: 'number', default: '250', description: 'Ticket height in px.' },
		{
			name: 'stubSize',
			type: 'number',
			default: '150',
			description:
				'Size of the stub along the ticket, in px: its width when horizontal, its height when vertical.',
		},
		{ name: 'radius', type: 'number', default: '16', description: 'Outer corner radius in px.' },
		{
			name: 'holes',
			type: 'number',
			default: '12',
			description: 'Perforation holes along the tear line.',
		},
		{ name: 'holeSize', type: 'number', default: '6', description: 'Hole diameter in px.' },
		{
			name: 'notch',
			type: 'number',
			default: '3',
			description: 'Radius of the notches at both ends of the tear line.',
		},
		{
			name: 'roughness',
			type: 'number',
			default: '0',
			description:
				'Optional jitter of the torn line between holes, in px. 0 keeps the edge perfectly straight and symmetrical.',
		},
		{
			name: 'tearAngle',
			type: 'number',
			default: '30',
			description: 'Degrees of pull at which the last bridge gives way and the stub comes free.',
		},
		{
			name: 'stretch',
			type: 'number',
			default: '30',
			description:
				'How far a paper bridge stretches before it snaps, in px. Bridges far from the hinge reach it first.',
		},
		{
			name: 'resistance',
			type: 'number',
			default: '0.45',
			description:
				'How much the intact fibres hold the stub back, 0 to 1. The pull eases as bridges give way, so the paper fights hardest at the start.',
		},
		{
			name: 'rotate',
			type: 'number',
			default: '4',
			description: 'A resting tilt of the whole ticket in the page plane, in degrees.',
		},
		{
			name: 'tilt',
			type: 'boolean',
			default: 'true',
			description: 'The ticket leans toward the cursor in 3D.',
		},
		{
			name: 'tiltMax',
			type: 'number',
			default: '9',
			description: 'Largest tilt angle in degrees.',
		},
		{
			name: 'tiltReach',
			type: 'number',
			default: '260',
			description:
				'How far beyond the ticket the pointer still steers the tilt, in px. The tilt tracks the whole page.',
		},
		{
			name: 'parallax',
			type: 'number',
			default: '6',
			description: 'How far the artwork travels against the tilt, in px.',
		},
		{
			name: 'perspective',
			type: 'number',
			default: '1000',
			description: 'Viewing distance in px.',
		},
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'Paper colour, also used by the fibres.',
		},
		{ name: 'color', type: 'string', default: '"#F5EFE9"', description: 'Text colour.' },
		{
			name: 'border',
			type: 'boolean',
			default: 'true',
			description:
				'A hairline drawn along the cut edge of each piece, following every hole and notch.',
		},
		{
			name: 'borderColor',
			type: 'string',
			default: '""',
			description: 'Colour of that hairline. Empty derives a faint tint of the text colour.',
		},
		{
			name: 'borderWidth',
			type: 'number',
			default: '1',
			description: 'Thickness of the hairline in px.',
		},
		{
			name: 'stubBackground',
			type: 'string',
			default: '""',
			description: 'Stub paper colour. Empty follows background.',
		},
		{
			name: 'recenter',
			type: 'boolean',
			default: 'true',
			description:
				'Once the stub is gone, the remaining ticket glides over to sit centred in its original box.',
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Dimmed and inert.' },
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Tear off the stub"',
			description: 'Accessible name of the stub. Enter or Space tears it.',
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
	let run = $state(0);
	function setRun(next: number | ((v: number) => number)) {
		run = typeof next === 'function' ? next(run) : next;
	}
	const innerRadius = $derived(Math.max(0, radius - 8));
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import TearTicket from \'./TearTicket.svelte\';\n<\/script>\n\n<TearTicket\n' +
			Object.entries({ ...props, ...{ image: '/artwork.jpg' } })
				.filter(([key]) =>
					[
						'children',
						'stub',
						'image',
						'imageAlt',
						'scrim',
						'imageRadius',
						'orientation',
						'torn',
						'defaultTorn',
						'onTear',
						'width',
						'height',
						'stubSize',
						'radius',
						'holes',
						'holeSize',
						'notch',
						'roughness',
						'tearAngle',
						'stretch',
						'resistance',
						'rotate',
						'tilt',
						'tiltMax',
						'tiltReach',
						'parallax',
						'perspective',
						'background',
						'color',
						'border',
						'borderColor',
						'borderWidth',
						'stubBackground',
						'recenter',
						'disabled',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  {#snippet children()}<div class="flex h-full items-end p-6">Admit one</div>{/snippet}\n  {#snippet stub()}<div class="p-6">Ticket 001</div>{/snippet}\n</TearTicket>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

{#snippet Face()}<div
		style={css({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 14,
			height: '100%',
			paddingTop: 'calc(var(--tt-body-h) * var(--tt-span) - var(--tt-inset))',
			paddingRight: PAD,
			paddingLeft: PAD,
			boxSizing: 'border-box',
		})}
	>
		<span style={css({ fontSize: 15, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em' })}
			>Spectrum</span
		> <span style={css({ fontSize: 13, lineHeight: 1, opacity: 0.45 })}>14 Nov</span>
	</div>{/snippet}
{#snippet Details()}<div style={css({ display: 'flex', flexDirection: 'column' })}>
		<span style={css({ fontSize: 17, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em' })}
			>Admit one</span
		>
		<span style={css({ marginTop: 8, fontSize: 12, lineHeight: 1.55, opacity: 0.5 })}>
			Rooftop gallery <br /> Until 30 Nov
		</span>
	</div>{/snippet}
{#snippet Stub(vertical: boolean)}{#if vertical}<div
			style={css({
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				height: '100%',
				paddingTop: 32,
				paddingRight: PAD,
				paddingBottom: 30,
				paddingLeft: PAD,
				boxSizing: 'border-box',
				textAlign: 'left',
			})}
		>
			<span style={css({ fontSize: 17, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em' })}
				>Admit one</span
			>
			<div
				style={css({
					display: 'flex',
					alignItems: 'flex-end',
					justifyContent: 'space-between',
					gap: 14,
				})}
			>
				<span style={css({ fontSize: 12, lineHeight: 1, opacity: 0.5 })}
					>Rooftop gallery · Until 30 Nov</span
				>
				<span
					style={css({
						fontSize: 13,
						lineHeight: 1,
						opacity: 0.45,
						fontVariantNumeric: 'tabular-nums',
					})}
				>
					No. 284619
				</span>
			</div>
		</div>{:else}<div style={css({ position: 'relative', height: '100%', textAlign: 'left' })}>
			<div style={css({ padding: '30px 20px 0 26px' })}>{@render Details()}</div>
			<span
				style={css({
					position: 'absolute',
					bottom: 30,
					left: 26,
					lineHeight: 1,
					fontSize: 13,
					opacity: 0.45,
					fontVariantNumeric: 'tabular-nums',
				})}
			>
				No. 284619
			</span>
		</div>{/if}{/snippet}
<svelte:head><title>Tear Ticket - svelte-bits</title></svelte:head>
<h1 class="sub-category">Tear Ticket</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="TearTicket"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:500px;"
			>
				<ReplayButton onClick={() => run++} />{#key run + epoch}<div
						class="flex w-full justify-center px-8"
					>
						<TearTicket
							{...props}
							image={IMAGE}
							imageAlt="Abstract artwork"
							imageRadius={innerRadius}
							>{#snippet children()}{@render Face()}{/snippet}{#snippet stub()}{@render Stub(
									orientation === 'vertical',
								)}{/snippet}</TearTicket
						>
					</div>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="tear-ticket" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Orientation"
				options={ORIENTATION_OPTIONS}
				value={orientation}
				onChange={(val) => {
					updateProp('orientation', val);
					Object.entries(SIZES[val as keyof typeof SIZES] ?? SIZES.horizontal).forEach(
						([key, size]) => updateProp(key as keyof typeof props, size),
					);
					setRun((r) => r + 1);
				}}
			></PreviewSelect>
			<PreviewSwitch title="Scrim" checked={scrim} onChange={(val) => updateProp('scrim', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Width"
				min={220}
				max={560}
				step={10}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={140}
				max={460}
				step={10}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stub Size"
				min={70}
				max={180}
				step={2}
				value={stubSize}
				valueUnit="px"
				onChange={(val) => updateProp('stubSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Holes"
				min={6}
				max={44}
				step={1}
				value={holes}
				onChange={(val) => updateProp('holes', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Hole Size"
				min={1}
				max={8}
				step={0.2}
				value={holeSize}
				valueUnit="px"
				onChange={(val) => updateProp('holeSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Notch"
				min={0}
				max={16}
				step={1}
				value={notch}
				valueUnit="px"
				onChange={(val) => updateProp('notch', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Roughness"
				min={0}
				max={3}
				step={0.1}
				value={roughness}
				valueUnit="px"
				onChange={(val) => updateProp('roughness', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tear Angle"
				min={12}
				max={60}
				step={1}
				value={tearAngle}
				valueUnit="°"
				onChange={(val) => updateProp('tearAngle', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stretch"
				min={2}
				max={60}
				step={1}
				value={stretch}
				valueUnit="px"
				onChange={(val) => updateProp('stretch', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Resistance"
				min={0}
				max={0.9}
				step={0.05}
				value={resistance}
				onChange={(val) => updateProp('resistance', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rotate"
				min={-20}
				max={20}
				step={1}
				value={rotate}
				valueUnit="°"
				onChange={(val) => updateProp('rotate', val)}
			></PreviewSlider>
			<PreviewSwitch title="Tilt" checked={tilt} onChange={(val) => updateProp('tilt', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Tilt Max"
				min={0}
				max={24}
				step={1}
				value={tiltMax}
				valueUnit="°"
				isDisabled={!tilt}
				onChange={(val) => updateProp('tiltMax', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tilt Reach"
				min={0}
				max={700}
				step={20}
				value={tiltReach}
				valueUnit="px"
				isDisabled={!tilt}
				onChange={(val) => updateProp('tiltReach', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={32}
				step={1}
				value={parallax}
				valueUnit="px"
				isDisabled={!tilt}
				onChange={(val) => updateProp('parallax', val)}
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
			<PreviewSwitch title="Border" checked={border} onChange={(val) => updateProp('border', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Border Width"
				min={0.5}
				max={4}
				step={0.5}
				value={borderWidth}
				valueUnit="px"
				isDisabled={!border}
				onChange={(val) => updateProp('borderWidth', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Recenter"
				checked={recenter}
				onChange={(val) => updateProp('recenter', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
