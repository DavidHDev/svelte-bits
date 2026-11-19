<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import { Icon } from 'svelte-icons-pack';
	import { VscSparkleFill } from 'svelte-icons-pack/vsc';
	import BorderGlow from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte';
	import source from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte?raw';

	const DEFAULT_PROPS = {
		edgeSensitivity: 30,
		glowColor: '40 80 80',
		backgroundColor: '#14110E',
		borderRadius: 28,
		glowRadius: 40,
		glowIntensity: 1.0,
		coneSpread: 25,
		animated: false
	};

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let colors = $state(['#FF8A4C', '#fbbf24', '#38bdf8']);

	const renderedBackgroundColor = $derived(
		theme.isLight && settings.backgroundColor === DEFAULT_PROPS.backgroundColor ? '#ffffff' : settings.backgroundColor
	);
	const renderedGlowColor = $derived(
		theme.isLight && settings.glowColor === DEFAULT_PROPS.glowColor ? '21 90 48' : settings.glowColor
	);
	const renderedGlowIntensity = $derived(
		theme.isLight && settings.glowIntensity === DEFAULT_PROPS.glowIntensity ? 1.25 : settings.glowIntensity
	);
	const renderedFillOpacity = $derived(theme.isLight ? 0.22 : 0.5);

	const updateColor = (index: number, value: string) => {
		const next = [...colors];
		next[index] = value;
		colors = next;
	};

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import BorderGlow from '$lib/components/BorderGlow.svelte';
${scriptClose}

<BorderGlow
  edgeSensitivity={30}
  glowColor="40 80 80"
  backgroundColor="#14110E"
  borderRadius={28}
  glowRadius={40}
  glowIntensity={1.0}
  coneSpread={25}
  animated={false}
  colors={['#FF8A4C', '#fbbf24', '#38bdf8']}
>
  <div style="padding: 2em;">
    <h2>Your Content Here</h2>
    <p>Hover near the edges to see the glow.</p>
  </div>
</BorderGlow>`;

	const propData = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content rendered inside the card.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' },
		{
			name: 'edgeSensitivity',
			type: 'number',
			default: '30',
			description: 'How close the pointer must be to the edge for the glow to appear (0-100).'
		},
		{
			name: 'glowColor',
			type: 'string',
			default: '"40 80 80"',
			description: 'HSL values for the glow color, as "H S L" (e.g. "40 80 80").'
		},
		{ name: 'backgroundColor', type: 'string', default: '"#14110E"', description: 'Background color of the card.' },
		{ name: 'borderRadius', type: 'number', default: '28', description: 'Corner radius of the card in pixels.' },
		{
			name: 'glowRadius',
			type: 'number',
			default: '40',
			description: 'How far the outer glow extends beyond the card in pixels.'
		},
		{ name: 'glowIntensity', type: 'number', default: '1.0', description: 'Multiplier for glow opacity (0.1-3.0).' },
		{
			name: 'coneSpread',
			type: 'number',
			default: '25',
			description: 'Width of the directional cone mask as a percentage (5-45).'
		},
		{ name: 'animated', type: 'boolean', default: 'false', description: 'Play an intro sweep animation on mount.' },
		{
			name: 'colors',
			type: 'string[]',
			default: '[...]',
			description: 'Array of 3 hex colors for the mesh gradient border, distributed across positions.'
		}
	];
</script>

<TabsLayout propsState={demo} componentName="BorderGlow" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding-top: 40px; padding-bottom: 40px;">
			<BorderGlow
				{...settings}
				backgroundColor={renderedBackgroundColor}
				glowColor={renderedGlowColor}
				glowIntensity={renderedGlowIntensity}
				fillOpacity={renderedFillOpacity}
				{colors}
			>
				<div
					style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 2em; min-height: 200px;"
				>
					<span style="display: inline-flex; margin-bottom: 12px;">
						<Icon src={VscSparkleFill} size="40" />
					</span>
					<p style="font-weight: 600; font-size: 1.4rem; letter-spacing: -0.5px;">Hover Near the Edges</p>
					<p style="color: var(--text-muted); font-size: 14px; max-width: 40ch; margin-top: 4px;">
						Move your cursor close to the card border to see the colored glow effect follow your pointer direction.
					</p>
				</div>
			</BorderGlow>
		</div>

		<Customize>
			<PreviewSlider
				min={0}
				max={80}
				step={1}
				title="Edge Sensitivity"
				value={settings.edgeSensitivity}
				onChange={(v) => demo.updateProp('edgeSensitivity', v)}
			/>
			<PreviewSlider
				min={0}
				max={50}
				step={1}
				title="Border Radius"
				value={settings.borderRadius}
				onChange={(v) => demo.updateProp('borderRadius', v)}
			/>
			<PreviewSlider
				min={10}
				max={80}
				step={1}
				title="Glow Radius"
				value={settings.glowRadius}
				onChange={(v) => demo.updateProp('glowRadius', v)}
			/>
			<PreviewSlider
				min={0.1}
				max={3}
				step={0.1}
				title="Glow Intensity"
				value={settings.glowIntensity}
				onChange={(v) => demo.updateProp('glowIntensity', v)}
			/>
			<PreviewSlider
				min={5}
				max={45}
				step={1}
				title="Cone Spread"
				value={settings.coneSpread}
				onChange={(v) => demo.updateProp('coneSpread', v)}
			/>
			<PreviewSwitch
				title="Animated Intro"
				isChecked={settings.animated}
				onChange={(v) => demo.updateProp('animated', v)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={renderedBackgroundColor}
				onChange={(v) => demo.updateProp('backgroundColor', v)}
			/>
			<p style="font-size: 14px; margin-top: 16px;">Gradient Colors</p>
			<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
				{#each colors as c, i (i)}
					<PreviewColorPickerCustom title={`Color ${i + 1}`} color={c} onChange={(v) => updateColor(i, v)} />
				{/each}
			</div>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
