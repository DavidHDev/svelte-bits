<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { FavouriteIcon, PlayIcon, Share08Icon } from '@hugeicons/core-free-icons';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import TargetCursor from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte';
	import source from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte?raw';

	type BlendMode = 'difference' | 'exclusion' | 'normal';

	const LOOK = {
		spinDuration: 2,
		hoverDuration: 0.2,
		size: 36,
		cornerSize: 12,
		thickness: 3,
		padding: 6,
		dotSize: 4
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		cursorColor: '#ffffff',
		cursorColorOnTarget: '#ffffff',
		blendMode: 'difference' as BlendMode,
		parallaxOn: true,
		matchRadius: true,
		showLabel: true,
		clickEffect: true,
		hideDefaultCursor: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		classic: { ...LOOK },
		calm: { ...LOOK, spinDuration: 0, thickness: 1.5, cornerSize: 10, padding: 8, size: 30, hoverDuration: 0.35 },
		bold: { ...LOOK, spinDuration: 3, thickness: 4, cornerSize: 18, padding: 10, size: 46, dotSize: 6 },
		tight: { ...LOOK, spinDuration: 1.2, thickness: 2, cornerSize: 8, padding: 2, size: 24, hoverDuration: 0.12 }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'calm', label: 'Calm' },
		{ value: 'bold', label: 'Bold' },
		{ value: 'tight', label: 'Tight' }
	];

	const BLEND_OPTIONS = [
		{ value: 'difference', label: 'Difference' },
		{ value: 'exclusion', label: 'Exclusion' },
		{ value: 'normal', label: 'Normal' }
	];

	const propData: PropRow[] = [
		{
			name: 'targetSelector',
			type: 'string',
			default: "'.cursor-target'",
			description: 'CSS selector for the elements the brackets lock onto.'
		},
		{ name: 'cursorColor', type: 'string', default: "'#ffffff'", description: 'Color of the brackets and dot.' },
		{
			name: 'cursorColorOnTarget',
			type: 'string',
			default: '-',
			description: 'Color the cursor blends to while locked onto a target.'
		},
		{
			name: 'spinDuration',
			type: 'number',
			default: '2',
			description: 'Seconds per turn while the cursor roams. 0 stops the spin.'
		},
		{
			name: 'hoverDuration',
			type: 'number',
			default: '0.2',
			description: 'How long the brackets take to snap onto a target, in seconds.'
		},
		{
			name: 'parallaxOn',
			type: 'boolean',
			default: 'true',
			description: 'Lets the locked brackets lean slightly toward the cursor.'
		},
		{
			name: 'hideDefaultCursor',
			type: 'boolean',
			default: 'true',
			description: 'Hides the system cursor while this cursor is shown.'
		},
		{ name: 'size', type: 'number', default: '36', description: 'Size of the reticle while roaming, in px.' },
		{ name: 'cornerSize', type: 'number', default: '12', description: 'Length of each bracket arm, in px.' },
		{ name: 'thickness', type: 'number', default: '3', description: 'Stroke width of the brackets, in px.' },
		{
			name: 'padding',
			type: 'number',
			default: '6',
			description: 'Gap between a locked target and the brackets, in px.'
		},
		{
			name: 'matchRadius',
			type: 'boolean',
			default: 'true',
			description: "Rounds the brackets to follow the target's corner radius."
		},
		{ name: 'dotSize', type: 'number', default: '4', description: 'Size of the center dot, in px. 0 hides it.' },
		{
			name: 'blendMode',
			type: 'string',
			default: "'difference'",
			description: 'CSS blend mode of the cursor. Difference keeps it visible on any background.'
		},
		{
			name: 'showLabel',
			type: 'boolean',
			default: 'true',
			description: 'Shows the data-cursor-label text of a locked target above the brackets.'
		},
		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'true',
			description: 'Squeezes the brackets and dot while the mouse button is held.'
		},
		{
			name: 'container',
			type: '{ current: HTMLElement } | HTMLElement',
			default: '-',
			description: 'Limits the cursor to one element. By default it works across the whole page.'
		}
	];

	const usage = `<script lang="ts">
  import TargetCursor from '$lib/components/TargetCursor.svelte';
</${'script'}>

<div>
  <TargetCursor
    spinDuration={2}
    hideDefaultCursor
    parallaxOn
  />

  <h1>Hover over the elements below</h1>
  <button class="cursor-target" data-cursor-label="Open">Click me!</button>
  <div class="cursor-target">Hover target</div>
</div>`;

	let stage = $state<HTMLDivElement | null>(null);
	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const photo = $derived(`/assets/demo/${theme === 'light' ? 'day' : 'night'}-sky.webp`);

	const roundClass = 'cursor-target grid h-[48px] w-[48px] place-items-center rounded-full';
	const roundStyle =
		'background: var(--bg-elevated); border: 1px solid var(--border-subtle); color: var(--text-primary);';

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((key) => [key, demo.defaultProps[key as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({
			...base,
			...PRESETS[value],
			cursorColor: settings.cursorColor,
			cursorColorOnTarget: settings.cursorColorOnTarget,
			blendMode: settings.blendMode,
			preset: value
		});
	};
</script>

<TabsLayout propsState={demo} componentName="TargetCursor" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div
			bind:this={stage}
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden;"
		>
			<div class="flex flex-col items-center gap-[20px]">
				<div
					class="cursor-target h-[170px] w-[260px] overflow-hidden rounded-[20px] md:h-[200px] md:w-[320px]"
					data-cursor-label="View"
					style="background: var(--bg-elevated);"
				>
					<img
						src={photo}
						alt=""
						draggable={false}
						style="width: 100%; height: 100%; object-fit: cover; display: block;"
					/>
				</div>
				<div class="flex items-center gap-[12px]">
					<button
						type="button"
						class="cursor-target flex h-[48px] items-center gap-[8px] rounded-[12px] px-[22px] text-[15px] font-semibold"
						data-cursor-label="Play"
						style="background: var(--text-primary); color: var(--bg-body);"
					>
						<HugeiconsIcon icon={PlayIcon} size={18} strokeWidth={2} />
						Play
					</button>
					<button type="button" class={roundClass} style={roundStyle} data-cursor-label="Like">
						<HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.8} />
					</button>
					<button type="button" class={roundClass} style={roundStyle} data-cursor-label="Share">
						<HugeiconsIcon icon={Share08Icon} size={20} strokeWidth={1.8} />
					</button>
				</div>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Cursor Color"
				color={settings.cursorColor}
				onChange={(v) => demo.updateProp('cursorColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Color On Target"
				color={settings.cursorColorOnTarget}
				onChange={(v) => demo.updateProp('cursorColorOnTarget', v)}
			/>
			<PreviewSelect
				title="Blend Mode"
				options={BLEND_OPTIONS}
				value={settings.blendMode}
				onChange={(v) => demo.updateProp('blendMode', v as BlendMode)}
			/>
			<PreviewSlider
				title="Spin Duration"
				min={0}
				max={5}
				step={0.1}
				value={settings.spinDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('spinDuration', v)}
			/>
			<PreviewSlider
				title="Hover Duration"
				min={0.05}
				max={1}
				step={0.05}
				value={settings.hoverDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('hoverDuration', v)}
			/>
			<PreviewSlider
				title="Size"
				min={16}
				max={80}
				step={1}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Corner Size"
				min={4}
				max={30}
				step={1}
				value={settings.cornerSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cornerSize', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={1}
				max={6}
				step={0.5}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Padding"
				min={0}
				max={24}
				step={1}
				value={settings.padding}
				valueUnit="px"
				onChange={(v) => demo.updateProp('padding', v)}
			/>
			<PreviewSlider
				title="Dot Size"
				min={0}
				max={12}
				step={1}
				value={settings.dotSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('dotSize', v)}
			/>
			<PreviewSwitch
				title="Match Radius"
				isChecked={settings.matchRadius}
				onChange={(v) => demo.updateProp('matchRadius', v)}
			/>
			<PreviewSwitch
				title="Parallax"
				isChecked={settings.parallaxOn}
				onChange={(v) => demo.updateProp('parallaxOn', v)}
			/>
			<PreviewSwitch
				title="Show Label"
				isChecked={settings.showLabel}
				onChange={(v) => demo.updateProp('showLabel', v)}
			/>
			<PreviewSwitch
				title="Click Effect"
				isChecked={settings.clickEffect}
				onChange={(v) => demo.updateProp('clickEffect', v)}
			/>
			<PreviewSwitch
				title="Hide Default Cursor"
				isChecked={settings.hideDefaultCursor}
				onChange={(v) => demo.updateProp('hideDefaultCursor', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<TargetCursor {...componentProps} container={stage} />
