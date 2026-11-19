<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import CurvedInput, {
		type CurvedInputShadowSize,
		type CurvedInputTheme
	} from '$lib/components/library/Components/CurvedInput/CurvedInput.svelte';
	import source from '$lib/components/library/Components/CurvedInput/CurvedInput.svelte?raw';

	const DEFAULT_PROPS = {
		theme: 'dark' as CurvedInputTheme,
		width: 450,
		bend: 28,
		height: 64,
		cornerRadius: 18,
		borderWidth: 1.5,
		fontSize: 16,
		backgroundColor: '#1D1814',
		textColor: '#f5f5f5',
		borderColor: '#3D342C',
		buttonColor: '#ff3e00',
		buttonTextColor: '#ffffff',
		buttonText: 'Get Started',
		shadowSize: 'md' as CurvedInputShadowSize,
		showButton: true,
		showIcon: true
	};

	type Palette = Pick<
		typeof DEFAULT_PROPS,
		'backgroundColor' | 'textColor' | 'borderColor' | 'buttonColor' | 'buttonTextColor'
	>;

	const THEME_COLORS: Record<CurvedInputTheme, Palette> = {
		dark: {
			backgroundColor: '#1D1814',
			textColor: '#f5f5f5',
			borderColor: '#3D342C',
			buttonColor: '#ff3e00',
			buttonTextColor: '#ffffff'
		},
		light: {
			backgroundColor: '#ffffff',
			textColor: '#1d2050',
			borderColor: '#262a56',
			buttonColor: '#4763eb',
			buttonTextColor: '#ffffff'
		}
	};

	const THEME_OPTIONS = [
		{ value: 'dark', label: 'Dark' },
		{ value: 'light', label: 'Light' }
	];

	const SHADOW_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'sm', label: 'Soft' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Heavy' }
	];

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);

	const siteTheme = $derived<CurvedInputTheme>(colorTheme.isLight ? 'light' : 'dark');
	const usesDefaultPalette = $derived(
		settings.theme === DEFAULT_PROPS.theme &&
			settings.backgroundColor === DEFAULT_PROPS.backgroundColor &&
			settings.textColor === DEFAULT_PROPS.textColor &&
			settings.borderColor === DEFAULT_PROPS.borderColor &&
			settings.buttonColor === DEFAULT_PROPS.buttonColor &&
			settings.buttonTextColor === DEFAULT_PROPS.buttonTextColor
	);
	const renderedTheme = $derived<CurvedInputTheme>(usesDefaultPalette ? siteTheme : settings.theme);
	const renderedColors = $derived<Palette>(
		usesDefaultPalette
			? THEME_COLORS[renderedTheme]
			: {
					backgroundColor: settings.backgroundColor,
					textColor: settings.textColor,
					borderColor: settings.borderColor,
					buttonColor: settings.buttonColor,
					buttonTextColor: settings.buttonTextColor
				}
	);

	const handleThemeChange = (nextTheme: CurvedInputTheme) => {
		demo.updateProps({ theme: nextTheme, ...THEME_COLORS[nextTheme] });
	};

	const usage = `<script lang="ts">
  import CurvedInput from '$lib/components/CurvedInput.svelte';
</${'script'}>

<CurvedInput
  placeholder="david@sveltebits.xyz"
  buttonText="Get Started"
  theme="dark"
  bend={28}
  height={64}
  width={450}
  onSubmit={(value) => console.log(value)}
/>

<CurvedInput
  theme="light"
  bend={0}
  showButton={false}
  showIcon={false}
  placeholder="Search components..."
  type="text"
/>`;

	const propData = [
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controlled value; leave undefined for uncontrolled usage.'
		},
		{ name: 'defaultValue', type: 'string', default: '""', description: 'Initial value when the input is uncontrolled.' },
		{ name: 'onChange', type: '(value) => void', default: '-', description: 'Called with the new value on every keystroke.' },
		{
			name: 'onSubmit',
			type: '(value) => void',
			default: '-',
			description: 'Called when the button is pressed or Enter is hit.'
		},
		{
			name: 'placeholder',
			type: 'string',
			default: '"Enter your email"',
			description: 'Placeholder text rendered along the curve when empty.'
		},
		{ name: 'buttonText', type: 'string', default: '"Get Started"', description: 'Label of the curved submit button.' },
		{
			name: 'type',
			type: 'string',
			default: '"email"',
			description: 'Semantic input type; email/number map to the matching mobile keyboard.'
		},
		{ name: 'name', type: 'string', default: 'undefined', description: 'Name attribute forwarded to the underlying input.' },
		{
			name: 'ariaLabel',
			type: 'string',
			default: 'undefined',
			description: 'Accessible label; falls back to the placeholder.'
		},
		{
			name: 'theme',
			type: '"dark" | "light"',
			default: '"dark"',
			description: 'Color preset; any explicit color prop overrides its theme value.'
		},
		{
			name: 'width',
			type: 'number | string',
			default: '450',
			description: 'Width of the input bar (pixels or any CSS width value, e.g. "100%").'
		},
		{
			name: 'bend',
			type: 'number',
			default: '28',
			description: 'How many pixels the center of the bar arches above its ends; negative bends downward, 0 is flat.'
		},
		{ name: 'height', type: 'number', default: '64', description: 'Thickness of the input bar in pixels.' },
		{
			name: 'cornerRadius',
			type: 'number',
			default: '18',
			description: 'Corner rounding of the bar; the button rounds proportionally.'
		},
		{ name: 'borderWidth', type: 'number', default: '1.5', description: 'Outline stroke width in pixels.' },
		{ name: 'fontSize', type: 'number', default: '16', description: 'Font size of the curved text and button label.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: 'undefined',
			description: 'Fill color of the input bar; overrides the theme.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: 'undefined',
			description: 'Color of the typed text and caret; overrides the theme.'
		},
		{
			name: 'placeholderColor',
			type: 'string',
			default: 'undefined',
			description: 'Color of the placeholder text; overrides the theme.'
		},
		{
			name: 'borderColor',
			type: 'string',
			default: 'undefined',
			description: 'Color of the outline stroke; overrides the theme.'
		},
		{
			name: 'buttonColor',
			type: 'string',
			default: 'undefined',
			description: 'Fill of the submit button, the focus ring and the default icon chip; overrides the theme.'
		},
		{
			name: 'buttonTextColor',
			type: 'string',
			default: 'undefined',
			description: 'Color of the button label; overrides the theme.'
		},
		{
			name: 'iconColor',
			type: 'string',
			default: 'undefined',
			description: 'Fill of the icon chip; defaults to the button color.'
		},
		{
			name: 'shadowSize',
			type: '"none" | "sm" | "md" | "lg"',
			default: '"md"',
			description: 'Size of the soft drop shadow under the bar.'
		},
		{
			name: 'shadowColor',
			type: 'string',
			default: 'undefined',
			description: 'Tint of the drop shadow; overrides the theme.'
		},
		{ name: 'showButton', type: 'boolean', default: 'true', description: 'Render the curved submit button.' },
		{ name: 'showIcon', type: 'boolean', default: 'true', description: 'Render the leading icon chip.' },
		{
			name: 'icon',
			type: 'Snippet',
			default: 'undefined',
			description: 'Custom SVG content for the icon, centered at the origin; replaces the default envelope chip.'
		},
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the wrapper form.' },
		{ name: 'style', type: 'string', default: 'undefined', description: 'Inline styles for the wrapper form.' }
	];
</script>

<TabsLayout propsState={demo} componentName="CurvedInput" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container curved-input-stage">
			<div class="curved-input-frame">
				<CurvedInput
					{...settings}
					theme={renderedTheme}
					{...renderedColors}
					placeholder="david@sveltebits.xyz"
					onSubmit={(value) => console.log('Submitted:', value)}
				/>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Theme" options={THEME_OPTIONS} value={settings.theme} onChange={handleThemeChange} />
			<PreviewColorPickerCustom
				title="Background"
				color={renderedColors.backgroundColor}
				onChange={(v) => demo.updateProp('backgroundColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Text"
				color={renderedColors.textColor}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Border"
				color={renderedColors.borderColor}
				onChange={(v) => demo.updateProp('borderColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Button"
				color={renderedColors.buttonColor}
				onChange={(v) => demo.updateProp('buttonColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Button Text"
				color={renderedColors.buttonTextColor}
				onChange={(v) => demo.updateProp('buttonTextColor', v)}
			/>
			<PreviewInput
				title="Button Label"
				value={settings.buttonText}
				maxLength={24}
				onChange={(v) => demo.updateProp('buttonText', v)}
			/>
			<PreviewSelect
				title="Shadow"
				options={SHADOW_OPTIONS}
				value={settings.shadowSize}
				onChange={(v) => demo.updateProp('shadowSize', v)}
			/>
			<PreviewSlider
				title="Width"
				min={340}
				max={720}
				step={10}
				value={settings.width}
				valueUnit="px"
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Bend"
				min={-60}
				max={60}
				step={1}
				value={settings.bend}
				valueUnit="px"
				onChange={(v) => demo.updateProp('bend', v)}
			/>
			<PreviewSlider
				title="Height"
				min={48}
				max={96}
				step={1}
				value={settings.height}
				valueUnit="px"
				onChange={(v) => demo.updateProp('height', v)}
			/>
			<PreviewSlider
				title="Corner Radius"
				min={0}
				max={36}
				step={1}
				value={settings.cornerRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cornerRadius', v)}
			/>
			<PreviewSlider
				title="Border Width"
				min={0}
				max={4}
				step={0.5}
				value={settings.borderWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('borderWidth', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={13}
				max={22}
				step={1}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSwitch
				title="Show Button"
				isChecked={settings.showButton}
				onChange={(v) => demo.updateProp('showButton', v)}
			/>
			<PreviewSwitch
				title="Show Icon"
				isChecked={settings.showIcon}
				onChange={(v) => demo.updateProp('showIcon', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.curved-input-stage {
		position: relative;
		height: 500px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 16px;
	}

	.curved-input-frame {
		width: 100%;
		max-width: 720px;
		display: flex;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.curved-input-stage {
			padding: 0 48px;
		}
	}
</style>
