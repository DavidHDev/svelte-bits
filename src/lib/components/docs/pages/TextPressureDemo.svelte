<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TextPressure from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte';
	import source from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte?raw';

	const DEFAULTS = {
		text: 'Hello!',
		flex: true,
		alpha: false,
		stroke: false,
		width: true,
		weight: true,
		italic: true,
		textColor: '#ffffff',
		strokeColor: '#5227FF'
	};

	let text = $state(DEFAULTS.text);
	let flex = $state(DEFAULTS.flex);
	let alpha = $state(DEFAULTS.alpha);
	let stroke = $state(DEFAULTS.stroke);
	let width = $state(DEFAULTS.width);
	let weight = $state(DEFAULTS.weight);
	let italic = $state(DEFAULTS.italic);
	let textColor = $state(DEFAULTS.textColor);
	let strokeColor = $state(DEFAULTS.strokeColor);
	let replay = $state(0);

	const hasChanges = $derived(
		text !== DEFAULTS.text ||
			flex !== DEFAULTS.flex ||
			alpha !== DEFAULTS.alpha ||
			stroke !== DEFAULTS.stroke ||
			width !== DEFAULTS.width ||
			weight !== DEFAULTS.weight ||
			italic !== DEFAULTS.italic ||
			textColor !== DEFAULTS.textColor ||
			strokeColor !== DEFAULTS.strokeColor
	);

	function reset() {
		text = DEFAULTS.text;
		flex = DEFAULTS.flex;
		alpha = DEFAULTS.alpha;
		stroke = DEFAULTS.stroke;
		width = DEFAULTS.width;
		weight = DEFAULTS.weight;
		italic = DEFAULTS.italic;
		textColor = DEFAULTS.textColor;
		strokeColor = DEFAULTS.strokeColor;
		replay++;
	}

	const usage = $derived(`<TextPressure
  text="${text}"
  flex={${flex}}
  alpha={${alpha}}
  stroke={${stroke}}
  width={${width}}
  weight={${weight}}
  italic={${italic}}
  textColor="${textColor}"
  strokeColor="${strokeColor}"
  minFontSize={36}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '"Hello!"', description: 'Text content that will be displayed and animated.' },
		{ name: 'fontFamily', type: 'string', default: '"Compressa VF"', description: 'Name of the variable font family.' },
		{ name: 'fontUrl', type: 'string', default: 'CompressaPRO-GX.woff2', description: 'URL for the variable font file (needed).' },
		{ name: 'flex', type: 'boolean', default: 'true', description: 'Whether the characters are spaced using flex layout.' },
		{ name: 'scale', type: 'boolean', default: 'false', description: 'If true, vertically scales the text to fill its container height.' },
		{ name: 'alpha', type: 'boolean', default: 'false', description: 'If true, applies an opacity effect based on cursor distance.' },
		{ name: 'stroke', type: 'boolean', default: 'false', description: 'If true, adds a stroke effect around characters.' },
		{ name: 'width', type: 'boolean', default: 'true', description: 'If true, varies the variable-font "width" axis.' },
		{ name: 'weight', type: 'boolean', default: 'true', description: 'If true, varies the variable-font "weight" axis.' },
		{ name: 'italic', type: 'boolean', default: 'true', description: 'If true, varies the variable-font "italics" axis.' },
		{ name: 'textColor', type: 'string', default: '"#FFFFFF"', description: 'The fill color of the text.' },
		{ name: 'strokeColor', type: 'string', default: '"#FF0000"', description: 'The stroke color applied when "stroke" is true.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class for styling the <h1> wrapper.' },
		{ name: 'minFontSize', type: 'number', default: '24', description: 'Minimum font-size to avoid overly tiny text on smaller screens.' }
	];
</script>

<svelte:head><title>Text Pressure - svelte-bits</title></svelte:head>

<h1 class="sub-category">Text Pressure</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="TextPressure" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden"
			style="height:400px;max-height:450px;display:flex;align-items:center;justify-content:center;"
		>
			<ReplayButton onClick={() => replay++} />
			<div style="width:100%;height:100%;">
				{#key replay}
					<TextPressure
						{text}
						{flex}
						{alpha}
						{stroke}
						{width}
						{weight}
						{italic}
						{textColor}
						{strokeColor}
						minFontSize={36}
					/>
				{/key}
			</div>
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="text-pressure" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker
				title="Text Color"
				value={textColor}
				onChange={(v) => {
					textColor = v;
					replay++;
				}}
			/>
			<PreviewColorPicker
				title="Stroke Color"
				value={strokeColor}
				onChange={(v) => {
					strokeColor = v;
					replay++;
				}}
			/>
			<PreviewInput
				title="Text"
				value={text}
				placeholder="Your text here..."
				maxlength={10}
				onChange={(v) => {
					text = v;
				}}
			/>
			<PreviewSwitch
				title="Flex"
				checked={flex}
				onChange={(v) => {
					flex = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Alpha"
				checked={alpha}
				onChange={(v) => {
					alpha = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Stroke"
				checked={stroke}
				onChange={(v) => {
					stroke = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Width"
				checked={width}
				onChange={(v) => {
					width = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Weight"
				checked={weight}
				onChange={(v) => {
					weight = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Italic"
				checked={italic}
				onChange={(v) => {
					italic = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
