<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import { Share03Icon } from '@hugeicons/core-free-icons';
	import SpotlightCard, { type SpotlightShape } from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte';
	import source from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte?raw';

	const DEFAULT_PROPS = {
		spotlightColor: '#ffffff',
		intensity: 0.15,
		spotlightSize: 240,
		softness: 0.7,
		shape: 'circle' as SpotlightShape,
		borderGlow: 0.6,
		proximity: 80,
		smoothing: 0.3,
		grain: 0,
		ambient: false,
		flare: true
	};

	const SHAPE_OPTIONS = [
		{ value: 'circle', label: 'Circle' },
		{ value: 'beam', label: 'Beam' }
	];

	const AVATAR =
		'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=240&h=240&fit=crop&crop=focalpoint&fp-x=0.64&fp-y=0.355&fp-z=1.45&sat=-100&q=80';

	const Bookmark02Icon = [
		[
			'path',
			{
				d: 'M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z',
				stroke: 'currentColor',
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeWidth: '1.5'
			}
		]
	] as const;

	const SKILLS = ['Figma', 'UX Design'];

	const STATS = [
		{ value: '4.5', label: 'Rating', star: true },
		{ value: '$15K+', label: 'Earned' },
		{ value: '$80/hr', label: 'Rate' }
	];

	const GLASS = {
		dark: {
			bg: 'rgba(255, 255, 255, 0.08)',
			hover: 'rgba(255, 255, 255, 0.13)',
			shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 24px -12px rgba(0, 0, 0, 0.7)'
		},
		light: {
			bg: 'rgba(24, 24, 27, 0.05)',
			hover: 'rgba(24, 24, 27, 0.08)',
			shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 24px -14px rgba(24, 24, 27, 0.3)'
		}
	};

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const theme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	let saved = $state(false);

	const inkDefault = $derived(theme === 'light' && settings.spotlightColor === DEFAULT_PROPS.spotlightColor);
	const spotlightColor = $derived(inkDefault ? undefined : settings.spotlightColor);

	const computedProps = $derived({
		...(inkDefault ? { spotlightColor: '#18181b' } : {}),
		...(theme === 'light' ? { theme: 'light' } : {})
	});

	const glass = $derived(GLASS[theme] ?? GLASS.dark);
	const glassVars = $derived(
		`--spotlight-demo-glass-bg: ${glass.bg}; --spotlight-demo-glass-hover: ${glass.hover}; --spotlight-demo-glass-shadow: ${glass.shadow};`
	);

	const propData = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content of the card.' },
		{
			name: 'spotlightColor',
			type: 'string',
			default: 'undefined',
			description:
				'Color of the light. Any CSS color works and its alpha is respected. Defaults to white on dark cards and near black on light ones.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '0.15',
			description: 'Brightness of the light on the card surface, from 0 to 1.'
		},
		{
			name: 'spotlightSize',
			type: 'number',
			default: '240',
			description: 'Radius of the light in px.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.7',
			description: 'How gradually the light fades out. 0 gives a crisp disc, 1 a soft glow that fades from the center.'
		},
		{
			name: 'shape',
			type: "'circle' | 'beam'",
			default: "'circle'",
			description:
				'Circle is a round spotlight around the pointer. Beam pours light down from the top edge toward it, like a stage light.'
		},
		{
			name: 'borderGlow',
			type: 'number',
			default: '0.6',
			description: 'How much the card edge catches the light near the pointer, from 0 to 1.'
		},
		{
			name: 'proximity',
			type: 'number',
			default: '80',
			description:
				'Distance in px outside the card at which the light starts to reach it. Cards placed together share one light this way. 0 lights a card only while hovered.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.3',
			description: 'How far the light floats behind the pointer. 0 sticks to it.'
		},
		{
			name: 'ambient',
			type: 'boolean',
			default: 'false',
			description:
				'Lets the light drift slowly across the card while nothing points at it, which keeps cards alive on touch screens.'
		},
		{
			name: 'flare',
			type: 'boolean',
			default: 'true',
			description: 'The light swells and brightens while the card is pressed.'
		},
		{
			name: 'grain',
			type: 'number',
			default: '0',
			description: 'Film grain inside the light, from 0 to 1. A little removes banding from large soft gradients.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description:
				'Surface, border and light treatment for dark or light pages. Override the colors with the --spotlight-card-surface and --spotlight-card-border CSS variables.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the card.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the card.' },
		{
			name: '...rest',
			type: 'HTMLAttributes<HTMLDivElement>',
			default: '-',
			description: 'Any other div props, such as onclick, id or aria attributes, are passed to the card.'
		}
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import SpotlightCard from '$lib/components/SpotlightCard.svelte';
${scriptClose}

<SpotlightCard
  theme="dark"
  spotlightColor="#ffffff"
  intensity={0.15}
  spotlightSize={240}
  softness={0.7}
  shape="circle"
  borderGlow={0.6}
  proximity={80}
  smoothing={0.3}
  grain={0}
  ambient={false}
  flare
>
  <h3>Ethan Harrison</h3>
  <p>Product designer</p>
  <button>Get in touch</button>
</SpotlightCard>`;
</script>

<TabsLayout
	propsState={demo}
	componentName="SpotlightCard"
	{usage}
	{source}
	{propData}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 480px; padding-top: 40px; padding-bottom: 40px;">
			<SpotlightCard
				{...settings}
				{spotlightColor}
				{theme}
				style="width: 100%; max-width: 330px; padding: 24px; border-radius: 28px;"
			>
				<div class="profile" style={glassVars}>
					<div class="top">
						<div class="avatar" style:background-image={`url(${AVATAR})`} role="img" aria-label="Ethan Harrison"></div>
						<button type="button" aria-label="Share profile" class="share">
							<HugeiconsIcon icon={Share03Icon} size={20} strokeWidth={1.6} />
						</button>
					</div>

					<p class="name">Ethan Harrison</p>
					<p class="role">Product designer</p>

					<div class="skills">
						{#each SKILLS as skill (skill)}
							<span class="skill">{skill}</span>
						{/each}
					</div>

					<div class="stats">
						{#each STATS as stat (stat.label)}
							<div class="stat">
								<div class="stat-value">
									{#if stat.star}
										<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
											<path
												d="M12 2.8l2.83 5.73 6.33.92-4.58 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3-4.58-4.46 6.33-.92z"
											/>
										</svg>
									{/if}
									{stat.value}
								</div>
								<p class="stat-label">{stat.label}</p>
							</div>
						{/each}
					</div>

					<div class="actions">
						<button type="button" class="glass cta">Get in touch</button>
						<button
							type="button"
							aria-label={saved ? 'Remove bookmark' : 'Bookmark profile'}
							aria-pressed={saved}
							class="glass save"
							class:is-saved={saved}
							onclick={() => (saved = !saved)}
						>
							<HugeiconsIcon icon={Bookmark02Icon} size={20} strokeWidth={1.7} />
						</button>
					</div>
				</div>
			</SpotlightCard>
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Spotlight Color"
				color={inkDefault ? '#18181b' : settings.spotlightColor}
				onChange={(value) => demo.updateProp('spotlightColor', value)}
			/>

			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value) => demo.updateProp('shape', value as SpotlightShape)}
			/>

			<PreviewSlider
				title="Intensity"
				min={0}
				max={1}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>

			<PreviewSlider
				title="Size"
				min={80}
				max={600}
				step={10}
				value={settings.spotlightSize}
				onChange={(value) => demo.updateProp('spotlightSize', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(value) => demo.updateProp('softness', value)}
			/>

			<PreviewSlider
				title="Border Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.borderGlow}
				onChange={(value) => demo.updateProp('borderGlow', value)}
			/>

			<PreviewSlider
				title="Proximity"
				min={0}
				max={240}
				step={10}
				value={settings.proximity}
				onChange={(value) => demo.updateProp('proximity', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Smoothing"
				min={0}
				max={1}
				step={0.05}
				value={settings.smoothing}
				onChange={(value) => demo.updateProp('smoothing', value)}
			/>

			<PreviewSlider
				title="Grain"
				min={0}
				max={1}
				step={0.05}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>

			<PreviewSwitch title="Ambient" isChecked={settings.ambient} onChange={(value) => demo.updateProp('ambient', value)} />

			<PreviewSwitch title="Flare" isChecked={settings.flare} onChange={(value) => demo.updateProp('flare', value)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.profile {
		display: flex;
		flex-direction: column;
		user-select: none;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: #9a9a9a;
		background-size: cover;
		background-position: 50% 50%;
		background-repeat: no-repeat;
	}

	.share {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		margin-right: -6px;
		margin-top: -4px;
		border: none;
		border-radius: 50%;
		color: inherit;
		background: transparent;
		cursor: pointer;
	}

	.share:hover {
		background: var(--surface-ghost);
	}

	.name {
		margin: 1rem 0 0;
		font-size: 1.45rem;
		font-weight: 500;
		letter-spacing: -0.4px;
		line-height: 1.2;
	}

	.role {
		margin: 0.25rem 0 0;
		font-size: 15px;
		color: var(--text-muted);
	}

	.skills {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.875rem;
	}

	.skill {
		padding: 5px 10px;
		border-radius: 8px;
		background: var(--surface-ghost);
		font-size: 12px;
		font-weight: 500;
		line-height: 1;
	}

	.stats {
		display: flex;
		align-items: stretch;
		margin-top: 1.5rem;
	}

	.stat {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-value {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 15px;
		font-weight: 500;
	}

	.stat-label {
		margin: 0;
		font-size: 12px;
		color: var(--text-muted);
	}

	.actions {
		display: flex;
		gap: 0.625rem;
		margin-top: 1.5rem;
	}

	.glass {
		border: none;
		background: var(--spotlight-demo-glass-bg);
		box-shadow: var(--spotlight-demo-glass-shadow);
		backdrop-filter: blur(14px) saturate(1.6);
		-webkit-backdrop-filter: blur(14px) saturate(1.6);
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.glass:hover {
		background: var(--spotlight-demo-glass-hover);
	}

	.cta {
		flex: 1;
		height: 48px;
		border-radius: 999px;
		font-size: 15px;
		font-weight: 500;
	}

	.save {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
	}

	.save.is-saved,
	.save.is-saved:hover {
		background: var(--text-primary);
		color: var(--bg-body);
	}
</style>
