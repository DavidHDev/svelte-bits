<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import { Bookmark02Icon, Comment01Icon, FavouriteIcon, RepostIcon } from '@hugeicons/core-free-icons';
	import ClickSpark, {
		type ClickSparkEasing,
		type ClickSparkShape
	} from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte';
	import source from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte?raw';
	import { LOOK, PRESET_OPTIONS, presetProps } from './presets/ClickSpark';

	const INK = {
		dark: {
			text: '#f5f5f5',
			muted: 'rgba(245, 245, 245, 0.62)',
			tile: 'linear-gradient(180deg, #3d342c 0%, #2a241f 100%)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			hover: 'brightness(1.12)',
			press: 'brightness(0.85)'
		},
		light: {
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.62)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f8f7f5 100%)',
			rim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.25)',
			hover: 'brightness(0.97)',
			press: 'brightness(0.92)'
		}
	};

	const DEFAULT_PROPS = {
		demo: 'buttons',
		preset: 'classic',
		...LOOK,
		layer: 'back' as 'front' | 'back'
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#ffffff': '#18181b',
		'#fde68a': '#d97706',
		'#fbbf24': '#f59e0b',
		'#7dd3fc': '#0284c7'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const DEMO_OPTIONS = [
		{ value: 'buttons', label: 'Buttons' },
		{ value: 'basic', label: 'Basic' }
	];

	const LAYER_OPTIONS = [
		{ value: 'back', label: 'Behind' },
		{ value: 'front', label: 'In Front' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'line', label: 'Line' },
		{ value: 'streak', label: 'Streak' },
		{ value: 'dot', label: 'Dot' },
		{ value: 'star', label: 'Star' }
	];

	const EASING_OPTIONS = [
		{ value: 'ease-out', label: 'Ease Out' },
		{ value: 'ease-in-out', label: 'Ease In Out' },
		{ value: 'ease-in', label: 'Ease In' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'spring', label: 'Spring' }
	];

	const propData: PropRow[] = [
		{
			name: 'sparkColor',
			type: 'string | string[]',
			default: "'#fff'",
			description: 'Color of the sparks. Pass a list to mix colors through each burst.'
		},
		{
			name: 'shape',
			type: "'line' | 'streak' | 'dot' | 'star'",
			default: "'line'",
			description: 'Look of each spark: a short dash, a comet with a fading tail, a round dot, or a twinkling star.'
		},
		{ name: 'sparkCount', type: 'number', default: '8', description: 'Number of sparks in each burst.' },
		{ name: 'sparkSize', type: 'number', default: '14', description: 'Length of each spark, in px.' },
		{ name: 'sparkWidth', type: 'number', default: '2', description: 'Thickness of each spark, in px.' },
		{
			name: 'sparkRadius',
			type: 'number',
			default: '30',
			description: 'How far the sparks travel from the click, in px.'
		},
		{ name: 'duration', type: 'number', default: '500', description: 'Length of a burst, in ms.' },
		{
			name: 'easing',
			type: "'ease-out' | 'ease-in-out' | 'ease-in' | 'linear' | 'spring'",
			default: "'ease-out'",
			description: 'How the sparks slow down as they fly out. Spring overshoots a little and settles back.'
		},
		{
			name: 'randomness',
			type: 'number',
			default: '0.2',
			description: 'Varies the angle, length and speed of each spark, from 0 to 1. 0 gives a perfect star.'
		},
		{ name: 'gravity', type: 'number', default: '0', description: 'Pulls the sparks down as they fly, from 0 to 2.' },
		{
			name: 'spread',
			type: 'number',
			default: '360',
			description: 'Angle the sparks fan across, in degrees. 360 is a full circle.'
		},
		{
			name: 'direction',
			type: 'number',
			default: '0',
			description: 'Where a partial spread points, in degrees. 0 is up and 90 is right.'
		},
		{ name: 'glow', type: 'number', default: '0', description: 'Soft light around each spark, from 0 to 1.' },
		{ name: 'ring', type: 'boolean', default: 'false', description: 'Adds a thin ring that expands from the click.' },
		{
			name: 'layer',
			type: "'front' | 'back'",
			default: "'front'",
			description: 'Draws the sparks over your content, or behind it so they burst out around buttons and cards.'
		},
		{
			name: 'extraScale',
			type: 'number',
			default: '1',
			description: 'Multiplies how far the sparks travel.'
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Stops new bursts.' },
		{
			name: 'spark',
			type: '(x?: number, y?: number) => void',
			default: '-',
			description:
				'Call spark() on the bind:this instance to fire a burst from code. x and y are in px from the top left; it centers without them.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the wrapper.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the wrapper.' },
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content to wrap. Clicks anywhere inside it send sparks, which can spill past its edges.'
		}
	];

	const usage = `<script lang="ts">
  import ClickSpark from '$lib/components/ClickSpark.svelte';
</${'script'}>

<ClickSpark
  sparkColor="#fff"
  shape="line"
  sparkCount={8}
  sparkSize={14}
  sparkRadius={30}
  duration={500}
>
  <!-- Your content here -->
</ClickSpark>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { demo: _demo, preset: _preset, sparkColor: _sparkColor, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(INK[theme]);

	const colors = $derived.by(() => {
		const sparkColor = settings.sparkColor;
		const palette = Array.isArray(sparkColor) && sparkColor.length ? sparkColor : LOOK.sparkColor;
		const swap = theme === 'light' ? LIGHT_SWAP : DARK_SWAP;
		return palette.map((color) => swap[color.toLowerCase()] ?? color);
	});

	const computedProps = $derived({ sparkColor: colors.length === 1 ? colors[0] : colors });

	let key = $state(0);
	let sparkRef = $state<ClickSpark | null>(null);
	let stageRef = $state<HTMLDivElement | null>(null);
	let likeRef = $state<HTMLButtonElement | null>(null);
	let liked = $state(false);
	let reposted = $state(false);
	let saved = $state(false);

	type Action = {
		label: string;
		icon: typeof Comment01Icon;
		count?: number;
		active?: boolean;
		tone?: string;
		toggle?: () => void;
	};

	const actions: Action[] = $derived([
		{ label: 'Reply', icon: Comment01Icon, count: 12 },
		{
			label: 'Repost',
			icon: RepostIcon,
			count: reposted ? 5 : 4,
			active: reposted,
			tone: '#22c55e',
			toggle: () => (reposted = !reposted)
		},
		{
			label: 'Like',
			icon: FavouriteIcon,
			count: liked ? 129 : 128,
			active: liked,
			tone: '#f43f5e',
			toggle: () => (liked = !liked)
		},
		{ label: 'Save', icon: Bookmark02Icon, active: saved, tone: ink.text, toggle: () => (saved = !saved) }
	]);

	const captureLike = (node: HTMLButtonElement, isLike: boolean) => {
		if (isLike) likeRef = node;
		return {
			destroy() {
				if (likeRef === node) likeRef = null;
			}
		};
	};

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};

	const demoMode = $derived(settings.demo);

	$effect(() => {
		const mode = demoMode;
		void key;
		liked = false;
		reposted = false;
		saved = false;
		const timers: number[] = [];
		const fire = (fx: number, fy: number, delay: number) =>
			timers.push(
				window.setTimeout(() => {
					if (!stageRef) return;
					sparkRef?.spark(stageRef.clientWidth * fx, stageRef.clientHeight * fy);
				}, delay)
			);
		if (mode === 'basic') {
			fire(0.34, 0.42, 450);
			fire(0.64, 0.6, 750);
			fire(0.5, 0.3, 1050);
		} else {
			timers.push(
				window.setTimeout(() => {
					if (!stageRef || !likeRef) return;
					const a = stageRef.getBoundingClientRect();
					const b = likeRef.getBoundingClientRect();
					liked = true;
					sparkRef?.spark(b.left - a.left + b.width / 2, b.top - a.top + b.height / 2);
				}, 600)
			);
		}
		return () => timers.forEach(window.clearTimeout);
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="ClickSpark"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['demo', 'preset', 'sparkColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={stageRef}
			class="demo-container"
			style="position: relative; height: 420px; padding: 0; overflow: hidden; cursor: crosshair;"
		>
			{#key key}
				<ClickSpark bind:this={sparkRef} sparkColor={colors} {...componentProps}>
					<div class="click-spark-demo-stage">
						{#if settings.demo === 'buttons'}
							<div class="click-spark-demo-actions">
								{#each actions as action (action.label)}
									<div class="click-spark-demo-action">
										<button
											use:captureLike={action.label === 'Like'}
											type="button"
											class="click-spark-demo-button"
											aria-label={action.label}
											aria-pressed={action.active}
											onclick={action.toggle}
											style:background={ink.tile}
											style:box-shadow={ink.rim}
											style:color={action.active ? action.tone : ink.text}
											style:--click-spark-hover={ink.hover}
											style:--click-spark-press={ink.press}
										>
											{@render actionIcon(action)}
										</button>
										{#if action.count !== undefined}
											<span class="click-spark-demo-count" style:color={action.active ? ink.text : ink.muted}>
												{action.count}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</ClickSpark>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				{colors}
				min={1}
				max={6}
				onChange={(value) => demo.updateProp('sparkColor', value)}
			/>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={settings.demo}
				onChange={(value) => demo.updateProp('demo', String(value))}
			/>
			<PreviewSelect
				title="Preset"
				options={PRESET_OPTIONS}
				value={settings.preset}
				onChange={(value) => applyPreset(String(value))}
			/>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value) => demo.updateProp('shape', value as ClickSparkShape)}
			/>
			<PreviewSelect
				title="Easing"
				options={EASING_OPTIONS}
				value={settings.easing}
				onChange={(value) => demo.updateProp('easing', value as ClickSparkEasing)}
			/>
			<PreviewSelect
				title="Layer"
				options={LAYER_OPTIONS}
				value={settings.layer}
				onChange={(value) => demo.updateProp('layer', value as 'front' | 'back')}
			/>
			<PreviewSlider
				title="Count"
				min={1}
				max={32}
				step={1}
				value={settings.sparkCount}
				onChange={(value) => demo.updateProp('sparkCount', value)}
			/>
			<PreviewSlider
				title="Size"
				min={4}
				max={40}
				step={1}
				value={settings.sparkSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('sparkSize', value)}
			/>
			<PreviewSlider
				title="Width"
				min={1}
				max={6}
				step={0.5}
				value={settings.sparkWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('sparkWidth', value)}
			/>
			<PreviewSlider
				title="Distance"
				min={8}
				max={120}
				step={1}
				value={settings.sparkRadius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('sparkRadius', value)}
			/>
			<PreviewSlider
				title="Duration"
				min={200}
				max={1600}
				step={50}
				value={settings.duration}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('duration', value)}
			/>
			<PreviewSlider
				title="Randomness"
				min={0}
				max={1}
				step={0.05}
				value={settings.randomness}
				onChange={(value) => demo.updateProp('randomness', value)}
			/>
			<PreviewSlider
				title="Gravity"
				min={0}
				max={2}
				step={0.05}
				value={settings.gravity}
				onChange={(value) => demo.updateProp('gravity', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={20}
				max={360}
				step={5}
				value={settings.spread}
				valueUnit="°"
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Direction"
				min={-180}
				max={180}
				step={5}
				value={settings.direction}
				valueUnit="°"
				isDisabled={settings.spread >= 360}
				onChange={(value) => demo.updateProp('direction', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSwitch title="Ring" isChecked={settings.ring} onChange={(value) => demo.updateProp('ring', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

{#snippet actionIcon(action: Action)}
	<span
		class="click-spark-demo-icon"
		class:is-active={action.active}
		style:transform={action.active ? 'scale(1.12)' : 'scale(1)'}
	>
		<HugeIcon icon={action.icon} size={18} strokeWidth={1.8} />
	</span>
{/snippet}

<style>
	.click-spark-demo-stage {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		height: 100%;
		padding: 16px;
	}

	.click-spark-demo-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.click-spark-demo-action {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.click-spark-demo-button {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 0;
		padding: 0;
		border-radius: 12px;
		cursor: pointer;
		transition: filter 200ms ease;
	}

	.click-spark-demo-button:hover {
		filter: var(--click-spark-hover);
	}

	.click-spark-demo-button:active {
		filter: var(--click-spark-press);
	}

	.click-spark-demo-icon {
		display: inline-grid;
		transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.click-spark-demo-icon.is-active :global(svg) {
		fill: currentColor;
	}

	.click-spark-demo-count {
		min-width: 24px;
		font-size: 13px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	@media (min-width: 768px) {
		.click-spark-demo-stage {
			padding: 24px;
		}

		.click-spark-demo-actions {
			gap: 22px;
		}
	}
</style>
