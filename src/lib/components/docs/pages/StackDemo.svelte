<script lang="ts">
	import { createRawSnippet } from 'svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Stack, { type StackLayout } from '$lib/components/library/Components/Stack/Stack.svelte';
	import source from '$lib/components/library/Components/Stack/Stack.svelte?raw';

	const IMAGES = [
		'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format',
		'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format',
		'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format',
		'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format',
		'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=500&auto=format',
		'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=500&auto=format'
	];

	const LAYOUT_OPTIONS = [
		{ label: 'Fan', value: 'fan' },
		{ label: 'Cascade', value: 'cascade' },
		{ label: 'Deck', value: 'deck' },
		{ label: 'Pile', value: 'pile' }
	];

	const DEFAULT_PROPS = {
		layout: 'fan' as StackLayout,
		visible: 4,
		spread: 0.5,
		depth: 0.5,
		radius: 16,
		frame: 0,
		frameColor: '#ffffff',
		shadow: true,
		tilt: 30,
		threshold: 90,
		speed: 1,
		sendToBackOnClick: false,
		autoplay: false,
		autoplayDelay: 3000,
		pauseOnHover: false
	};

	const cards = IMAGES.map((src, index) =>
		createRawSnippet(() => ({
			render: () => `<img src="${src}" alt="Card ${index + 1}" draggable="false" />`
		}))
	);

	const propData = [
		{
			name: 'cards',
			type: 'Snippet[]',
			default: 'four sample photos',
			description:
				'The cards in the stack, top first. Images fill the card automatically, any other content works too.'
		},
		{
			name: 'layout',
			type: "'fan' | 'cascade' | 'deck' | 'pile'",
			default: "'fan'",
			description:
				'How the cards behind sit. Fan tilts them out from a corner, cascade offsets them diagonally, deck stacks them upward and pile scatters them like loose photos.'
		},
		{
			name: 'visible',
			type: 'number',
			default: '4',
			description: 'How many cards show, counting the top one. The rest wait hidden at the back.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '0.5',
			description: 'How far the cards behind fan, offset or scatter, from 0 for a neat stack to 1 for a wide one.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '0.5',
			description: 'How much smaller and darker each card behind gets, from 0 for none to 1 for a strong recede.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '16',
			description: 'Corner radius of the cards in pixels.'
		},
		{
			name: 'frame',
			type: 'number',
			default: '0',
			description: 'Width of a border around each card in pixels, like the edge of a printed photo.'
		},
		{
			name: 'frameColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the frame around each card.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'true',
			description: 'Gives every card a soft drop shadow.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '30',
			description:
				'How far the top card leans in 3D while it is dragged, in degrees. It tilts around the point you hold and leans into fast moves. Use 0 to keep it flat.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '90',
			description:
				'How far in pixels the top card has to be dragged before it goes to the back. A quick flick works too.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Speed of every animation, from 0.5 for slow and soft to 2 for fast and snappy.'
		},
		{
			name: 'sendToBackOnClick',
			type: 'boolean',
			default: 'false',
			description: 'Clicking the top card also sends it to the back.'
		},
		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Cycles through the cards on its own.'
		},
		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3000',
			description: 'Time in milliseconds between automatic cycles.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses autoplay while the pointer is over the stack.'
		},
		{
			name: 'onChange',
			type: '(index: number) => void',
			default: '-',
			description: 'Called with the index of the new top card whenever the stack moves.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import { createRawSnippet } from 'svelte';
  import Stack from '$lib/components/Stack.svelte';

  const images = [
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format'
  ];

  const cards = images.map((src, i) =>
    createRawSnippet(() => ({ render: () => \`<img src="\${src}" alt="Card \${i + 1}" />\` }))
  );
</${'script'}>

<div style="width: 230px; height: 230px;">
  <Stack layout="fan" sendToBackOnClick {cards} />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let key = $state(0);
</script>

<TabsLayout propsState={demo} componentName="Stack" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 480px; overflow: hidden;">
			<div style="width: 230px; height: 230px;">
				{#key key}
					<Stack {cards} {...settings} />
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect
				title="Layout"
				options={LAYOUT_OPTIONS}
				value={settings.layout}
				onChange={(value: string) => demo.updateProp('layout', value as StackLayout)}
			/>
			<PreviewSlider
				title="Visible Cards"
				min={1}
				max={6}
				step={1}
				value={settings.visible}
				onChange={(value: number) => demo.updateProp('visible', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={1}
				step={0.05}
				value={settings.spread}
				onChange={(value: number) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.05}
				value={settings.depth}
				onChange={(value: number) => demo.updateProp('depth', value)}
			/>

			<PreviewSlider
				title="Corner Radius"
				min={0}
				max={40}
				step={1}
				value={settings.radius}
				onChange={(value: number) => demo.updateProp('radius', value)}
				displayValue={(value: number) => `${value}px`}
			/>
			<PreviewSlider
				title="Frame"
				min={0}
				max={16}
				step={1}
				value={settings.frame}
				onChange={(value: number) => demo.updateProp('frame', value)}
				displayValue={(value: number) => `${value}px`}
			/>
			<PreviewColorPickerCustom
				title="Frame Color"
				color={settings.frameColor}
				onChange={(value: string) => demo.updateProp('frameColor', value)}
			/>
			<PreviewSwitch
				title="Shadow"
				isChecked={settings.shadow}
				onChange={(value: boolean) => demo.updateProp('shadow', value)}
			/>

			<PreviewSlider
				title="Tilt"
				min={0}
				max={60}
				step={1}
				value={settings.tilt}
				onChange={(value: number) => demo.updateProp('tilt', value)}
				displayValue={(value: number) => `${value}°`}
			/>
			<PreviewSlider
				title="Swipe Threshold"
				min={30}
				max={200}
				step={10}
				value={settings.threshold}
				onChange={(value: number) => demo.updateProp('threshold', value)}
				displayValue={(value: number) => `${value}px`}
			/>
			<PreviewSlider
				title="Speed"
				min={0.5}
				max={2}
				step={0.1}
				value={settings.speed}
				onChange={(value: number) => demo.updateProp('speed', value)}
			/>
			<PreviewSwitch
				title="Send To Back On Click"
				isChecked={settings.sendToBackOnClick}
				onChange={(value: boolean) => demo.updateProp('sendToBackOnClick', value)}
			/>

			<PreviewSwitch
				title="Autoplay"
				isChecked={settings.autoplay}
				onChange={(value: boolean) => demo.updateProp('autoplay', value)}
			/>
			<PreviewSlider
				title="Autoplay Delay"
				min={1000}
				max={6000}
				step={250}
				value={settings.autoplayDelay}
				onChange={(value: number) => demo.updateProp('autoplayDelay', value)}
				displayValue={(value: number) => `${value}ms`}
			/>
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(value: boolean) => demo.updateProp('pauseOnHover', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
