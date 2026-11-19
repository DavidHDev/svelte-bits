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
	import { colorModeValue } from '$lib/theme.svelte';
	import DecryptedText from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte';
	import source from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte?raw';

	type Effect = 'scramble' | 'flip' | 'fade';
	type AnimateOn = 'view' | 'hover' | 'inViewHover' | 'click';
	type ClickMode = 'once' | 'toggle';
	type RevealDirection = 'start' | 'end' | 'center' | 'random';

	type Look = {
		scrambleColor: string;
		effect: Effect;
		animateOn: AnimateOn;
		speed: number;
		maxIterations: number;
		sequential: boolean;
		revealDirection: RevealDirection;
		hoverRadius: number;
		loop: boolean;
		loopDelay: number;
		characters: string;
		useOriginalCharsOnly: boolean;
	};

	const CHARACTER_SETS = {
		letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
		hex: '0123456789ABCDEF',
		binary: '01',
		blocks: '█▓▒░',
		symbols: '!<>-_/[]{}=+*^?#'
	};

	const LOOK: Look = {
		scrambleColor: '',
		effect: 'scramble',
		animateOn: 'inViewHover',
		speed: 60,
		maxIterations: 10,
		sequential: true,
		revealDirection: 'start',
		hoverRadius: 100,
		loop: false,
		loopDelay: 2000,
		characters: CHARACTER_SETS.letters,
		useOriginalCharsOnly: false
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		terminal: {
			...LOOK,
			scrambleColor: '#2bb673',
			revealDirection: 'random',
			speed: 40,
			hoverRadius: 70,
			characters: CHARACTER_SETS.hex
		},
		flip: {
			...LOOK,
			effect: 'flip',
			revealDirection: 'center',
			speed: 70,
			hoverRadius: 0
		},
		loop: {
			...LOOK,
			effect: 'fade',
			animateOn: 'view',
			speed: 45,
			hoverRadius: 0,
			loop: true,
			loopDelay: 1800,
			characters: CHARACTER_SETS.symbols
		}
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		clickMode: 'once' as ClickMode
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'terminal', label: 'Terminal' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'loop', label: 'Loop' }
	];

	const EFFECT_OPTIONS = [
		{ label: 'Scramble', value: 'scramble' },
		{ label: 'Flip', value: 'flip' },
		{ label: 'Fade', value: 'fade' }
	];

	const ANIMATE_OPTIONS = [
		{ label: 'View', value: 'view' },
		{ label: 'Hover', value: 'hover' },
		{ label: 'View & Hover', value: 'inViewHover' },
		{ label: 'Click', value: 'click' }
	];

	const CLICK_OPTIONS = [
		{ label: 'Once', value: 'once' },
		{ label: 'Toggle', value: 'toggle' }
	];

	const DIRECTION_OPTIONS = [
		{ label: 'Start', value: 'start' },
		{ label: 'End', value: 'end' },
		{ label: 'Center', value: 'center' },
		{ label: 'Random', value: 'random' }
	];

	const CHARACTER_OPTIONS = [
		{ label: 'Letters', value: CHARACTER_SETS.letters },
		{ label: 'Hex', value: CHARACTER_SETS.hex },
		{ label: 'Binary', value: CHARACTER_SETS.binary },
		{ label: 'Blocks', value: CHARACTER_SETS.blocks },
		{ label: 'Symbols', value: CHARACTER_SETS.symbols }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '-',
			description: 'The text to decrypt.'
		},
		{
			name: 'effect',
			type: "'scramble' | 'flip' | 'fade'",
			default: "'scramble'",
			description:
				'How letters decode. Scramble swaps glyphs in place, flip rolls each glyph in vertically and lands the real letter with a soft bounce, fade keeps scrambled glyphs faint and brightens them as they resolve.'
		},
		{
			name: 'scrambleColor',
			type: 'string',
			default: "''",
			description:
				'Color of letters while they are scrambled. Each letter eases back to the text color as it decodes. Leave empty to keep the text color.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '50',
			description: 'Time between steps, in ms.'
		},
		{
			name: 'maxIterations',
			type: 'number',
			default: '10',
			description:
				'How many steps the letters scramble before settling when not sequential. Also sets how long letters keep scrambling after the cursor passes with hoverRadius.'
		},
		{
			name: 'sequential',
			type: 'boolean',
			default: 'false',
			description: 'Reveals one letter per step instead of all at once.'
		},
		{
			name: 'revealDirection',
			type: "'start' | 'end' | 'center' | 'random'",
			default: "'start'",
			description: 'Where the sequential reveal starts. Random uncovers the letters in a shuffled order.'
		},
		{
			name: 'useOriginalCharsOnly',
			type: 'boolean',
			default: 'false',
			description: 'Scrambles using only the letters already in the text.'
		},
		{
			name: 'characters',
			type: 'string',
			default: "'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+'",
			description: 'The pool of characters used while scrambling.'
		},
		{
			name: 'animateOn',
			type: "'view' | 'hover' | 'inViewHover' | 'click'",
			default: "'hover'",
			description: 'What starts the decryption. View and click start scrambled, so the real text never flashes first.'
		},
		{
			name: 'clickMode',
			type: "'once' | 'toggle'",
			default: "'once'",
			description: "With click, decrypt once or toggle back and forth. Only applies when animateOn is 'click'."
		},
		{
			name: 'hoverRadius',
			type: 'number',
			default: '0',
			description:
				'With hover, only letters within this many px of the cursor scramble, fading out toward the edge, and they settle once it passes. 0 decrypts the whole text on hover.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'After decrypting, holds, scrambles the text again and repeats. Pauses while off screen.'
		},
		{
			name: 'loopDelay',
			type: 'number',
			default: '2000',
			description: 'How long the decrypted text holds before scrambling again when looping, in ms.'
		},
		{
			name: 'className',
			type: 'string',
			default: "''",
			description: 'Class names for revealed letters.'
		},
		{
			name: 'parentClassName',
			type: 'string',
			default: "''",
			description: 'Class names for the wrapper around all letters.'
		},
		{
			name: 'encryptedClassName',
			type: 'string',
			default: "''",
			description: 'Class names for letters that are still scrambled.'
		}
	];

	const usage = `<script lang="ts">
  import DecryptedText from '$lib/components/DecryptedText.svelte';
</${'script'}>

<DecryptedText
  text="Hacking into the mainframe..."
  animateOn="inViewHover"
  effect="scramble"
  sequential={true}
  revealDirection="start"
  speed={60}
  maxIterations={10}
  hoverRadius={100}
  scrambleColor="#2bb673"
  loop={false}
  loopDelay={2000}
  useOriginalCharsOnly={false}
  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+"
  className="revealed"
  encryptedClassName="encrypted"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, scrambleColor: _scrambleColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const hoverable = $derived(settings.animateOn === 'hover' || settings.animateOn === 'inViewHover');
	const computedProps = $derived(settings.scrambleColor ? { scrambleColor: settings.scrambleColor } : {});

	const change = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="DecryptedText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'scrambleColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container decrypted-text-demo" style="position: relative; height: 400px; overflow: hidden;">
			<RefreshButton onClick={() => key++} />

			<div style="display: flex; width: 80%; padding: 0 0.5em;">
				{#key key}
					<DecryptedText
						text="Hacking into the mainframe..."
						parentClassName="decrypted-text"
						{...componentProps}
						scrambleColor={settings.scrambleColor}
					/>
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Scramble Color"
				color={settings.scrambleColor || ink}
				onChange={(v) => demo.updateProp('scrambleColor', v)}
			/>
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(v) => change('effect', v as Effect)}
			/>
			<PreviewSelect
				title="Animate On"
				options={ANIMATE_OPTIONS}
				value={settings.animateOn}
				onChange={(v) => change('animateOn', v as AnimateOn)}
			/>
			<PreviewSelect
				title="Click Mode"
				options={CLICK_OPTIONS}
				value={settings.clickMode}
				isDisabled={settings.animateOn !== 'click'}
				onChange={(v) => change('clickMode', v as ClickMode)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.revealDirection}
				isDisabled={!settings.sequential}
				onChange={(v) => change('revealDirection', v as RevealDirection)}
			/>
			<PreviewSlider
				title="Speed"
				min={20}
				max={200}
				step={5}
				value={settings.speed}
				valueUnit="ms"
				onChange={(v) => change('speed', v)}
			/>
			<PreviewSlider
				title="Iterations"
				min={1}
				max={40}
				step={1}
				value={settings.maxIterations}
				isDisabled={settings.sequential && !(hoverable && settings.hoverRadius > 0)}
				onChange={(v) => change('maxIterations', v)}
			/>
			<PreviewSlider
				title="Hover Radius"
				min={0}
				max={240}
				step={10}
				value={settings.hoverRadius}
				valueUnit="px"
				isDisabled={!hoverable}
				onChange={(v) => change('hoverRadius', v)}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => change('loop', v)} />
			<PreviewSlider
				title="Loop Delay"
				min={400}
				max={5000}
				step={100}
				value={settings.loopDelay}
				valueUnit="ms"
				isDisabled={!settings.loop}
				onChange={(v) => change('loopDelay', v)}
			/>
			<PreviewSwitch title="Sequential" isChecked={settings.sequential} onChange={(v) => change('sequential', v)} />
			<PreviewSelect
				title="Characters"
				options={CHARACTER_OPTIONS}
				value={settings.characters}
				isDisabled={settings.useOriginalCharsOnly}
				onChange={(v) => change('characters', String(v))}
			/>
			<PreviewSwitch
				title="Original Chars"
				isChecked={settings.useOriginalCharsOnly}
				onChange={(v) => change('useOriginalCharsOnly', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.decrypted-text-demo :global(.decrypted-text) {
		font-size: 2rem;
		max-width: 30ch;
		display: inline-block;
		font-weight: 400;
		color: var(--text-primary);
		cursor: pointer;
	}

	@media (min-width: 30em) {
		.decrypted-text-demo {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}
	}

	@media (min-width: 48em) {
		.decrypted-text-demo {
			padding-top: 1.5rem;
			padding-bottom: 1.5rem;
		}
	}

	@media only screen and (max-width: 967px) {
		.decrypted-text-demo :global(.decrypted-text) {
			font-size: 1rem;
		}
	}
</style>
