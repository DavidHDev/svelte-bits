<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Lanyard, {
		type LanyardAnchor,
		type LanyardFinish,
		type LanyardImageFit,
		type LanyardMetal,
		type LanyardOrientation
	} from '$lib/components/library/Components/Lanyard/Lanyard.svelte';
	import source from '$lib/components/library/Components/Lanyard/Lanyard.svelte?raw';
	import cardFront from '$lib/assets/lanyard/card-front.webp';
	import cardBack from '$lib/assets/lanyard/card-back.webp';
	import band from '$lib/assets/lanyard/lanyard.png';
	import { onDestroy } from 'svelte';

	type Slot = 'front' | 'back' | 'strap';
	type Upload = { url: string; name: string };

	const UPLOAD_FIELDS: { slot: Slot; title: string }[] = [
		{ slot: 'front', title: 'Front Image' },
		{ slot: 'back', title: 'Back Image' },
		{ slot: 'strap', title: 'Band Image' }
	];

	const ORIENTATION_OPTIONS = [
		{ label: 'Portrait', value: 'portrait' },
		{ label: 'Landscape', value: 'landscape' }
	];

	const FIT_OPTIONS = [
		{ label: 'Cover', value: 'cover' },
		{ label: 'Contain', value: 'contain' }
	];

	const FINISH_OPTIONS = [
		{ label: 'Glossy', value: 'glossy' },
		{ label: 'Matte', value: 'matte' },
		{ label: 'Holographic', value: 'holographic' },
		{ label: 'Metallic', value: 'metallic' }
	];

	const METAL_OPTIONS = [
		{ label: 'Graphite', value: 'graphite' },
		{ label: 'Silver', value: 'silver' },
		{ label: 'Gold', value: 'gold' }
	];

	const ANCHOR_OPTIONS = [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' }
	];

	const DEFAULT_PROPS = {
		imageFit: 'cover' as LanyardImageFit,
		cardColor: '#ffffff',
		orientation: 'portrait' as LanyardOrientation,
		finish: 'glossy' as LanyardFinish,
		cornerRadius: 0.3,
		size: 0.6,
		anchor: 'center' as LanyardAnchor,
		strapLength: 0.5,
		strapColor: '#111111',
		strapWidth: 0.65,
		plainStrap: false,
		metal: 'silver' as LanyardMetal,
		gravity: 1,
		damping: 0.5,
		elasticity: 0.5,
		breeze: 0.5,
		interactive: true,
		intro: true
	};

	const usage = `<script lang="ts">
  import Lanyard from '$lib/components/Lanyard.svelte';
</${'script'}>

<div style="width: 100%; height: 600px;">
  <Lanyard frontImage="/card-front.png" backImage="/card-back.png" strapImage="/band.png" />
</div>`;

	const propData: PropRow[] = [
		{
			name: 'frontImage',
			type: 'string',
			default: 'undefined',
			description: 'Image URL printed on the front of the card. Any size or aspect works.'
		},
		{
			name: 'backImage',
			type: 'string',
			default: 'undefined',
			description: 'Image URL printed on the back. Falls back to frontImage, then to a blank card.'
		},
		{
			name: 'imageFit',
			type: "'cover' | 'contain'",
			default: "'cover'",
			description: 'How the images fit the card. Cover fills and crops, contain fits inside on the card color.'
		},
		{
			name: 'cardColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the card itself, shown when there is no image and around contained images.'
		},
		{
			name: 'orientation',
			type: "'portrait' | 'landscape'",
			default: "'portrait'",
			description: 'Whether the card hangs tall or wide.'
		},
		{
			name: 'finish',
			type: "'glossy' | 'matte' | 'holographic' | 'metallic'",
			default: "'glossy'",
			description:
				'Surface of the card. Holographic adds a sparkling foil whose colors shift as the card turns, metallic a brushed sheen.'
		},
		{
			name: 'cornerRadius',
			type: 'number',
			default: '0.3',
			description: 'Roundness of the card corners, from 0 for square to 1 for very round.'
		},
		{
			name: 'size',
			type: 'number',
			default: '0.6',
			description: 'Height of the card as a fraction of the container height.'
		},
		{
			name: 'anchor',
			type: "'left' | 'center' | 'right'",
			default: "'center'",
			description: 'Where the band hangs from along the top edge of the container.'
		},
		{
			name: 'strapLength',
			type: 'number',
			default: '0.5',
			description: 'How far below the top edge the card hangs, from 0 for a short band to 1 for a long one.'
		},
		{
			name: 'strapImage',
			type: 'string',
			default: 'undefined',
			description:
				'Image URL printed along the band. A wide image repeats along its length, with its height spanning the band width.'
		},
		{
			name: 'strapColor',
			type: 'string',
			default: "'#111111'",
			description: 'Color of the band when there is no strap image.'
		},
		{
			name: 'strapWidth',
			type: 'number',
			default: '0.65',
			description: 'Width of the band relative to its default, from 0.4 to 2.'
		},
		{
			name: 'metal',
			type: "'graphite' | 'silver' | 'gold'",
			default: "'silver'",
			description: 'Finish of the clamp and the ring that holds the card.'
		},
		{
			name: 'gravity',
			type: 'number',
			default: '1',
			description: 'How strongly the card falls. Lower values float and swing slowly, 0 turns gravity off.'
		},
		{
			name: 'damping',
			type: 'number',
			default: '0.5',
			description: 'How quickly the swinging dies down, from 0 for a long sway to 1 for a quick settle.'
		},
		{
			name: 'elasticity',
			type: 'number',
			default: '0.5',
			description: 'How hard the band snaps the card back after it is stretched and released.'
		},
		{
			name: 'breeze',
			type: 'number',
			default: '0.5',
			description: 'A gentle, ever-changing wind that keeps the card moving when nobody touches it.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Lets visitors drag, stretch and throw the card, and click it to flip it over.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'On mount the card drops in from the side and swings into place.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const lanyardProps = $derived.by(() => {
		const { plainStrap: _plainStrap, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	let uploads = $state<Record<Slot, Upload | null>>({ front: null, back: null, strap: null });
	const inputs = $state<Partial<Record<Slot, HTMLInputElement>>>({});

	const revokeAll = () => {
		Object.values(uploads).forEach((upload) => upload && URL.revokeObjectURL(upload.url));
	};

	const pick = (slot: Slot, file: File) => {
		const previous = uploads[slot];
		if (previous) URL.revokeObjectURL(previous.url);
		const url = URL.createObjectURL(file);
		uploads = { ...uploads, [slot]: { url, name: file.name } };
	};

	const handleChange = (slot: Slot, event: Event) => {
		const target = event.currentTarget as HTMLInputElement;
		const picked = target.files?.[0];
		target.value = '';
		if (picked) pick(slot, picked);
	};

	const resetAll = () => {
		demo.resetProps();
		revokeAll();
		uploads = { front: null, back: null, strap: null };
	};

	onDestroy(revokeAll);

	const propsState = {
		get props() {
			return demo.props;
		},
		get defaultProps() {
			return demo.defaultProps;
		},
		get baseDefaults() {
			return demo.baseDefaults;
		},
		get lightProps() {
			return demo.lightProps;
		},
		get hasChanges() {
			return demo.hasChanges || Object.values(uploads).some(Boolean);
		},
		updateProp: demo.updateProp,
		updateProps: demo.updateProps,
		resetProps: resetAll
	} as unknown as typeof demo;

	const frontImage = $derived(uploads.front?.url ?? cardFront);
	const backImage = $derived(uploads.back?.url ?? (uploads.front ? uploads.front.url : cardBack));
	const strapImage = $derived(settings.plainStrap ? undefined : (uploads.strap?.url ?? band));
</script>

<TabsLayout {propsState} componentName="Lanyard" {usage} {source} {propData} demoOnlyProps={['plainStrap']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<p
				style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); margin: 0; font-size: 14px; color: var(--text-dimmed); pointer-events: none; user-select: none;"
			>
				Try dragging
			</p>
			<div style="position: absolute; inset: 0;">
				{#key key}
					<Lanyard {...lanyardProps} {frontImage} {backImage} {strapImage} />
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			{#each UPLOAD_FIELDS as field (field.slot)}
				<div class="scrubber">
					<button type="button" class="scrubber-track scrubber-track--select" onclick={() => inputs[field.slot]?.click()}>
						<span class="scrubber-label">{field.title}</span>
						<span class="scrubber-select-right">
							<span
								class="scrubber-value"
								style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
							>
								{uploads[field.slot] ? uploads[field.slot]?.name : 'Upload'}
							</span>
						</span>
					</button>
					<input
						bind:this={inputs[field.slot]}
						type="file"
						accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
						hidden
						onchange={(event) => handleChange(field.slot, event)}
					/>
				</div>
			{/each}
			<PreviewSelect
				title="Image Fit"
				options={FIT_OPTIONS}
				value={settings.imageFit}
				onChange={(v) => demo.updateProp('imageFit', v as LanyardImageFit)}
			/>
			<PreviewSelect
				title="Orientation"
				options={ORIENTATION_OPTIONS}
				value={settings.orientation}
				onChange={(v) => demo.updateProp('orientation', v as LanyardOrientation)}
			/>

			<PreviewSelect
				title="Finish"
				options={FINISH_OPTIONS}
				value={settings.finish}
				onChange={(v) => demo.updateProp('finish', v as LanyardFinish)}
			/>
			<PreviewSelect
				title="Metal"
				options={METAL_OPTIONS}
				value={settings.metal}
				onChange={(v) => demo.updateProp('metal', v as LanyardMetal)}
			/>
			<PreviewColorPickerCustom
				title="Card Color"
				color={settings.cardColor}
				onChange={(v) => demo.updateProp('cardColor', v)}
			/>
			<PreviewSwitch
				title="Plain Band"
				isChecked={settings.plainStrap}
				onChange={(v) => demo.updateProp('plainStrap', v)}
			/>
			<PreviewColorPickerCustom
				title="Band Color"
				color={settings.strapColor}
				onChange={(v) => demo.updateProp('strapColor', v)}
			/>
			<PreviewSlider
				title="Corner Radius"
				min={0}
				max={1}
				step={0.05}
				value={settings.cornerRadius}
				onChange={(v) => demo.updateProp('cornerRadius', v)}
			/>

			<PreviewSelect
				title="Anchor"
				options={ANCHOR_OPTIONS}
				value={settings.anchor}
				onChange={(v) => demo.updateProp('anchor', v as LanyardAnchor)}
			/>
			<PreviewSlider
				title="Size"
				min={0.2}
				max={0.8}
				step={0.01}
				value={settings.size}
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Band Length"
				min={0}
				max={1}
				step={0.05}
				value={settings.strapLength}
				onChange={(v) => demo.updateProp('strapLength', v)}
			/>
			<PreviewSlider
				title="Band Width"
				min={0.4}
				max={2}
				step={0.05}
				value={settings.strapWidth}
				onChange={(v) => demo.updateProp('strapWidth', v)}
			/>

			<PreviewSlider
				title="Gravity"
				min={0}
				max={2}
				step={0.05}
				value={settings.gravity}
				onChange={(v) => demo.updateProp('gravity', v)}
			/>
			<PreviewSlider
				title="Damping"
				min={0}
				max={1}
				step={0.05}
				value={settings.damping}
				onChange={(v) => demo.updateProp('damping', v)}
			/>
			<PreviewSlider
				title="Elasticity"
				min={0}
				max={1}
				step={0.05}
				value={settings.elasticity}
				onChange={(v) => demo.updateProp('elasticity', v)}
			/>
			<PreviewSlider
				title="Breeze"
				min={0}
				max={1}
				step={0.05}
				value={settings.breeze}
				onChange={(v) => demo.updateProp('breeze', v)}
			/>

			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
