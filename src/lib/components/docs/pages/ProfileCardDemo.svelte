<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import ProfileCard from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte';
	import source from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte?raw';

	const DEFAULT_PROPS = {
		iconPattern: true,
		backdropColor: '',
		holo: 0.8,
		glare: 0.5,
		tiltStrength: 12,
		parallax: 8,
		radius: 16,
		enableTilt: true,
		intro: true,
		showUserInfo: true,
		enableMobileTilt: false
	};

	const propData = [
		{ name: 'avatarUrl', type: 'string', default: "''", description: 'Portrait shown on the card.' },
		{
			name: 'iconUrl',
			type: 'string',
			default: '-',
			description: 'Tileable pattern, like a logo pattern. The holo foil shows only through it.'
		},
		{
			name: 'miniAvatarUrl',
			type: 'string',
			default: '-',
			description: 'Small round image next to the handle. Hidden when not set.'
		},
		{ name: 'name', type: 'string', default: "'Javi A. Torres'", description: 'Name shown over the portrait.' },
		{ name: 'title', type: 'string', default: "'Software Engineer'", description: 'Role shown under the name.' },
		{ name: 'handle', type: 'string', default: "'javicodes'", description: 'Handle shown in the footer, without the @.' },
		{ name: 'status', type: 'string', default: "'Online'", description: 'Status text shown under the handle.' },
		{ name: 'statusColor', type: 'string', default: "'#22c55e'", description: 'Color of the status dot.' },
		{ name: 'contactText', type: 'string', default: "'Contact'", description: 'Label of the contact button.' },
		{
			name: 'showUserInfo',
			type: 'boolean',
			default: 'true',
			description: 'Shows the footer with the handle, status and contact button.'
		},
		{
			name: 'onContactClick',
			type: '() => void',
			default: '-',
			description: 'Called when the contact button is clicked.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the frame and footer.' },
		{
			name: 'backdropColor',
			type: 'string',
			default: '-',
			description: 'Color behind the portrait. Shows around cut-out photos. Uses the theme color when not set.'
		},
		{ name: 'radius', type: 'number', default: '16', description: 'Corner radius of the photo, in px.' },
		{
			name: 'holo',
			type: 'number',
			default: '0.8',
			description: 'Strength of the holographic foil, from 0 to 1. It lights up where the cursor catches it.'
		},
		{
			name: 'glare',
			type: 'number',
			default: '0.5',
			description: 'Strength of the light that follows the cursor, from 0 to 1.'
		},
		{ name: 'enableTilt', type: 'boolean', default: 'true', description: 'Tilts the card toward the cursor.' },
		{ name: 'tiltStrength', type: 'number', default: '12', description: 'Largest tilt angle, in degrees.' },
		{
			name: 'parallax',
			type: 'number',
			default: '8',
			description: 'How far the portrait shifts as the card tilts, in px.'
		},
		{
			name: 'enableMobileTilt',
			type: 'boolean',
			default: 'false',
			description: 'Tilts the card with the motion of the phone after a tap. Needs HTTPS.'
		},
		{
			name: 'mobileTiltSensitivity',
			type: 'number',
			default: '5',
			description: 'How strongly phone motion tilts the card.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Catches the light once as the card appears, then settles.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the card.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const usage = `${scriptOpen}
  import ProfileCard from '$lib/components/ProfileCard.svelte';
${scriptClose}

<ProfileCard
  name="Javi A. Torres"
  title="Software Engineer"
  handle="javicodes"
  status="Online"
  contactText="Contact"
  avatarUrl="/path/to/portrait.png"
  iconUrl="/path/to/pattern.png"
  holo={0.8}
  glare={0.5}
  tiltStrength={12}
  parallax={8}
  radius={16}
  enableTilt={true}
  intro={true}
  showUserInfo={true}
  enableMobileTilt={false}
  theme="dark"
  onContactClick={() => console.log('Contact clicked')}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const cardProps = $derived.by(() => {
		const { iconPattern: _iconPattern, backdropColor: _backdropColor, ...rest } = settings;
		return rest;
	});
	const cardTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const iconUrl = $derived(settings.iconPattern ? '/assets/demo/iconpattern.png' : undefined);
	const computedProps = $derived({
		...(iconUrl ? { iconUrl } : {}),
		...(settings.backdropColor ? { backdropColor: settings.backdropColor } : {}),
		...(cardTheme === 'light' ? { theme: 'light' } : {})
	});
	let key = $state(0);
</script>

<TabsLayout
	propsState={demo}
	componentName="ProfileCard"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['iconPattern', 'backdropColor']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 640px; overflow: hidden;">
			{#key key}
				<ProfileCard
					name="Javi A. Torres"
					title="Software Engineer"
					handle="javicodes"
					status="Online"
					contactText="Contact"
					avatarUrl="/assets/demo/person.webp"
					{iconUrl}
					backdropColor={settings.backdropColor || undefined}
					theme={cardTheme}
					{...cardProps}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Backdrop Color"
				color={settings.backdropColor || (cardTheme === 'light' ? '#f8f7f5' : '#332d28')}
				onChange={(value) => demo.updateProp('backdropColor', value)}
			/>

			<PreviewSlider
				title="Holo"
				min={0}
				max={1}
				step={0.05}
				value={settings.holo}
				onChange={(value) => demo.updateProp('holo', value)}
			/>

			<PreviewSlider
				title="Glare"
				min={0}
				max={1}
				step={0.05}
				value={settings.glare}
				onChange={(value) => demo.updateProp('glare', value)}
			/>

			<PreviewSlider
				title="Tilt Strength"
				min={0}
				max={25}
				step={1}
				value={settings.tiltStrength}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tiltStrength', value)}
			/>

			<PreviewSlider
				title="Parallax"
				min={0}
				max={20}
				step={1}
				value={settings.parallax}
				valueUnit="px"
				onChange={(value) => demo.updateProp('parallax', value)}
			/>

			<PreviewSlider
				title="Radius"
				min={0}
				max={28}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>

			<PreviewSwitch
				title="Icon Pattern"
				isChecked={settings.iconPattern}
				onChange={(value) => demo.updateProp('iconPattern', value)}
			/>

			<PreviewSwitch
				title="Tilt"
				isChecked={settings.enableTilt}
				onChange={(value) => demo.updateProp('enableTilt', value)}
			/>

			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>

			<PreviewSwitch
				title="User Info"
				isChecked={settings.showUserInfo}
				onChange={(value) => demo.updateProp('showUserInfo', value)}
			/>

			<PreviewSwitch
				title="Mobile Tilt"
				isChecked={settings.enableMobileTilt}
				onChange={(value) => demo.updateProp('enableMobileTilt', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
