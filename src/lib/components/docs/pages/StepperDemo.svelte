<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CheckListIcon,
		CheckmarkCircle02Icon,
		CreditCardIcon,
		DeliveryTruck01Icon,
		ShoppingCart01Icon
	} from '@hugeicons/core-free-icons';
	import Stepper, { type StepItem } from '$lib/components/library/Components/Stepper/Stepper.svelte';
	import source from '$lib/components/library/Components/Stepper/Stepper.svelte?raw';

	type Preset = 'onboarding' | 'checkout' | 'minimal' | 'progress';
	type Indicator = 'numbers' | 'dots' | 'bars';
	type Orientation = 'horizontal' | 'vertical';
	type Transition = 'slide' | 'fade' | 'none';

	const DEFAULT_PROPS = {
		preset: 'onboarding' as Preset,
		indicator: 'numbers' as Indicator,
		orientation: 'horizontal' as Orientation,
		transition: 'slide' as Transition,
		accentColor: '',
		width: 440,
		radius: 24,
		frame: true,
		linear: false,
		disableStepIndicators: false,
		showFooter: true,
		backButtonText: 'Back',
		nextButtonText: 'Continue',
		completeButtonText: 'Complete'
	};

	const PRESETS: Record<Preset, Partial<typeof DEFAULT_PROPS>> = {
		onboarding: {},
		checkout: { orientation: 'vertical', width: 640, completeButtonText: 'Place order' },
		minimal: { indicator: 'dots', transition: 'fade', width: 400 },
		progress: { indicator: 'bars', linear: true }
	};

	const PRESET_OPTIONS = [
		{ value: 'onboarding', label: 'Onboarding' },
		{ value: 'checkout', label: 'Checkout' },
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'progress', label: 'Progress' }
	];

	const INDICATOR_OPTIONS = [
		{ value: 'numbers', label: 'Numbers' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'bars', label: 'Bars' }
	];

	const ORIENTATION_OPTIONS = [
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' }
	];

	const TRANSITION_OPTIONS = [
		{ value: 'slide', label: 'Slide' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'none', label: 'None' }
	];

	const heading =
		'margin: 0; font-size: 17px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--stepper-ink);';
	const copy = 'margin: 6px 0 0; font-size: 13.5px; line-height: 1.55; color: var(--stepper-muted);';

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const stepperProps = $derived.by(() => {
		const { preset: _preset, accentColor: _accentColor, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(colorModeValue('#292524', '#f5f5f4'));

	let name = $state('');
	let plan = $state('pro');
	let shipping = $state('standard');
	let step = $state(1);
	let key = $state(0);
	let fieldFocused = $state(false);

	const computedProps = $derived({
		...(settings.accentColor ? { accentColor: settings.accentColor } : {}),
		...(theme === 'light' ? { theme: 'light' } : {})
	});

	const applyPreset = (value: Preset) => {
		step = 1;
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], accentColor: settings.accentColor, preset: value });
	};

	const checkout = $derived(settings.preset === 'checkout');
	const needsName = $derived(!checkout && step === 3 && !name.trim());

	const checkoutSteps: StepItem[] = [
		{ title: 'Cart', description: '2 items', icon: cartIcon, content: cartStep },
		{ title: 'Shipping', description: 'Delivery speed', icon: shippingIcon, content: shippingStep },
		{ title: 'Payment', description: 'Card on file', icon: paymentIcon, content: paymentStep },
		{ title: 'Review', description: 'Confirm order', icon: reviewIcon, content: orderStep }
	];

	const onboardingSteps: StepItem[] = [
		{ title: 'Welcome', content: welcomeStep },
		{ title: 'Plan', content: planStep },
		{ title: 'Profile', content: profileStep },
		{ title: 'Review', content: reviewStep }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import Stepper from '$lib/components/Stepper.svelte';
${scriptClose}

{#snippet welcome()}
  <h3>Welcome aboard</h3>
  <p>Set up your workspace in a few quick steps.</p>
{/snippet}

{#snippet plan()}
  <h3>Choose a plan</h3>
  <p>You can change this at any time.</p>
{/snippet}

{#snippet profile()}
  <h3>What should we call you?</h3>
  <input placeholder="Your name" />
{/snippet}

{#snippet review()}
  <h3>Looking good</h3>
  <p>Complete setup to open your workspace.</p>
{/snippet}

<Stepper
  steps={[
    { title: 'Welcome', content: welcome },
    { title: 'Plan', content: plan },
    { title: 'Profile', content: profile },
    { title: 'Review', content: review }
  ]}
  initialStep={1}
  onStepChange={(step) => console.log(step)}
  onFinalStepCompleted={() => console.log('All steps completed!')}
  backButtonText="Back"
  nextButtonText="Continue"
/>`;

	const propData = [
		{
			name: 'steps',
			type: 'StepItem[]',
			default: '-',
			description: 'The steps. Each one takes a content snippet and can also take a title, description and icon.'
		},
		{
			name: 'steps[].title',
			type: 'string | Snippet',
			default: '-',
			description: 'Label shown under the indicator, or beside it in the vertical layout.'
		},
		{
			name: 'steps[].description',
			type: 'string | Snippet',
			default: '-',
			description: 'Second line shown beside the indicator in the vertical layout.'
		},
		{
			name: 'steps[].icon',
			type: 'Snippet',
			default: '-',
			description: 'Icon shown inside the indicator instead of the number.'
		},
		{
			name: 'step',
			type: 'number',
			default: '-',
			description: 'Controls the current step yourself. Use it with onStepChange.'
		},
		{ name: 'initialStep', type: 'number', default: '1', description: 'The step shown first.' },
		{
			name: 'onStepChange',
			type: '(step: number) => void',
			default: '() => {}',
			description: 'Called when the step changes.'
		},
		{
			name: 'onFinalStepCompleted',
			type: '() => void',
			default: '() => {}',
			description: 'Called when the last step is completed.'
		},
		{
			name: 'indicator',
			type: "'numbers' | 'dots' | 'bars'",
			default: "'numbers'",
			description: 'Style of the step indicators in the horizontal layout.'
		},
		{
			name: 'orientation',
			type: "'horizontal' | 'vertical'",
			default: "'horizontal'",
			description: 'Indicators across the top, or a rail of numbered steps beside the content.'
		},
		{
			name: 'transition',
			type: "'slide' | 'fade' | 'none'",
			default: "'slide'",
			description: 'How the content changes between steps. The height always animates.'
		},
		{
			name: 'linear',
			type: 'boolean',
			default: 'false',
			description: 'Only lets the indicators jump back to steps that have been reached.'
		},
		{
			name: 'disableStepIndicators',
			type: 'boolean',
			default: 'false',
			description: 'Stops the indicators from changing the step when clicked.'
		},
		{
			name: 'renderStepIndicator',
			type: 'Snippet<[{ step, currentStep, onStepClick }]>',
			default: '-',
			description: 'Renders your own numbered indicator.'
		},
		{ name: 'showFooter', type: 'boolean', default: 'true', description: 'Shows the Back and Continue buttons.' },
		{ name: 'backButtonText', type: 'string', default: "'Back'", description: 'Text of the Back button.' },
		{ name: 'nextButtonText', type: 'string', default: "'Continue'", description: 'Text of the Continue button.' },
		{
			name: 'completeButtonText',
			type: 'string',
			default: "'Complete'",
			description: 'Text of the Continue button on the last step.'
		},
		{
			name: 'backButtonProps',
			type: 'HTMLButtonAttributes',
			default: '{}',
			description: 'Extra props for the Back button.'
		},
		{
			name: 'nextButtonProps',
			type: 'HTMLButtonAttributes',
			default: '{}',
			description: 'Extra props for the Continue button, such as disabled while a step is incomplete.'
		},
		{
			name: 'completedContent',
			type: 'Snippet',
			default: '-',
			description: 'Shown in place of the steps once the last one is completed.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the panel and controls.' },
		{
			name: 'accentColor',
			type: 'string',
			default: '-',
			description: 'Color of completed steps, the progress lines and the Continue button.'
		},
		{ name: 'frame', type: 'boolean', default: 'true', description: 'Shows the frosted panel around the stepper.' },
		{ name: 'radius', type: 'number', default: '24', description: 'Corner radius of the panel, in px.' },
		{ name: 'width', type: 'number | string', default: '440', description: 'Maximum width of the stepper.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the stepper.' },
		{
			name: 'stepContainerClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for the indicator row.'
		},
		{ name: 'contentClassName', type: 'string', default: "''", description: 'Extra class names for the content area.' },
		{ name: 'footerClassName', type: 'string', default: "''", description: 'Extra class names for the footer.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the stepper.' }
	];
</script>

{#snippet option(title: string, detail?: string, aside?: string, selected = false, onSelect?: () => void)}
	<svelte:element
		this={onSelect ? 'button' : 'div'}
		type={onSelect ? 'button' : undefined}
		role={onSelect ? undefined : 'presentation'}
		onclick={onSelect}
		style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 11px 14px; border: none; border-radius: 12px; background: {selected
			? 'var(--stepper-tile)'
			: 'var(--stepper-well)'}; box-shadow: {selected
			? 'inset 0 0 0 1px var(--stepper-ring), var(--stepper-tile-shadow)'
			: 'inset 0 0 0 1px var(--stepper-tile-edge)'}; color: var(--stepper-ink); font: inherit; text-align: left; box-sizing: border-box; cursor: {onSelect
			? 'pointer'
			: 'default'}; transition: background 0.2s ease, box-shadow 0.2s ease;"
	>
		<span style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
			<span style="font-size: 14px; font-weight: 600;">{title}</span>
			{#if detail}<span style="font-size: 12.5px; color: var(--stepper-muted);">{detail}</span>{/if}
		</span>
		{#if aside}
			<span style="font-size: 13px; color: var(--stepper-muted); font-variant-numeric: tabular-nums;">{aside}</span>
		{/if}
	</svelte:element>
{/snippet}

{#snippet done(title: string, text: string)}
	<div style="display: flex; align-items: center; gap: 14px; padding: 4px 0;">
		<span
			style="display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 12px; background: var(--stepper-well); color: var(--stepper-ink);"
		>
			<HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} strokeWidth={1.8} />
		</span>
		<span>
			<h3 style={heading}>{title}</h3>
			<p style="{copy} margin-top: 2px;">{text}</p>
		</span>
	</div>
{/snippet}

{#snippet cartIcon()}<HugeiconsIcon icon={ShoppingCart01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet shippingIcon()}<HugeiconsIcon icon={DeliveryTruck01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet paymentIcon()}<HugeiconsIcon icon={CreditCardIcon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet reviewIcon()}<HugeiconsIcon icon={CheckListIcon} size={16} strokeWidth={1.8} />{/snippet}

{#snippet cartStep()}
	<h3 style={heading}>Your cart</h3>
	<div style="display: grid; gap: 8px; margin-top: 14px;">
		{@render option('Desk lamp', 'Matte black', '$89')}
		{@render option('Linen notebook', 'A5, dotted', '$24')}
	</div>
{/snippet}

{#snippet shippingStep()}
	<h3 style={heading}>How fast?</h3>
	<div style="display: grid; gap: 8px; margin-top: 14px;">
		{@render option('Standard', '3 to 5 days', 'Free', shipping === 'standard', () => (shipping = 'standard'))}
		{@render option('Express', 'Next day', '$12', shipping === 'express', () => (shipping = 'express'))}
	</div>
{/snippet}

{#snippet paymentStep()}
	<h3 style={heading}>Pay with</h3>
	<div style="display: grid; gap: 8px; margin-top: 14px;">
		{@render option('Visa ending in 4242', 'Expires 08/28', undefined, true)}
	</div>
{/snippet}

{#snippet orderStep()}
	<h3 style={heading}>Order total</h3>
	<p style={copy}>
		2 items with {shipping === 'express' ? 'express' : 'standard'} delivery come to <span
			style="color: var(--stepper-ink); font-weight: 600;">{shipping === 'express' ? '$125' : '$113'}</span
		>.
	</p>
{/snippet}

{#snippet welcomeStep()}
	<h3 style={heading}>Welcome aboard</h3>
	<p style={copy}>Set up your workspace in a few quick steps. It only takes a minute.</p>
{/snippet}

{#snippet planStep()}
	<h3 style={heading}>Choose a plan</h3>
	<p style={copy}>You can change this at any time.</p>
	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px;">
		{@render option('Starter', 'Free forever', undefined, plan === 'starter', () => (plan = 'starter'))}
		{@render option('Pro', '$12 per month', undefined, plan === 'pro', () => (plan = 'pro'))}
	</div>
{/snippet}

{#snippet profileStep()}
	<h3 style={heading}>What should we call you?</h3>
	<input
		bind:value={name}
		onfocus={() => (fieldFocused = true)}
		onblur={() => (fieldFocused = false)}
		placeholder="Your name"
		style="width: 100%; height: 42px; margin-top: 14px; padding: 0 14px; box-sizing: border-box; border: none; border-radius: 12px; outline: none; background: var(--stepper-well); box-shadow: {fieldFocused
			? 'inset 0 0 0 1px var(--stepper-ring)'
			: 'inset 0 0 0 1px var(--stepper-tile-edge)'}; color: var(--stepper-ink); font: inherit; font-size: 14px; transition: box-shadow 0.2s ease;"
	/>
{/snippet}

{#snippet reviewStep()}
	<h3 style={heading}>Looking good{name.trim() ? `, ${name.trim()}` : ''}</h3>
	<p style={copy}>
		You picked the {plan === 'pro' ? 'Pro' : 'Starter'} plan. Complete setup to open your workspace.
	</p>
{/snippet}

{#snippet completedOrder()}
	{@render done('Order placed', 'A receipt is on its way to your inbox.')}
{/snippet}

{#snippet completedWorkspace()}
	{@render done('Workspace ready', `Welcome in${name.trim() ? `, ${name.trim()}` : ''}.`)}
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="Stepper"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'accentColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 560px; padding: 16px; overflow: hidden;">
			{#key `${settings.preset}-${key}`}
				<Stepper
					{...stepperProps}
					steps={checkout ? checkoutSteps : onboardingSteps}
					{theme}
					accentColor={settings.accentColor || undefined}
					onStepChange={(value) => (step = value)}
					onFinalStepCompleted={() => (step = 5)}
					nextButtonProps={{ disabled: needsName }}
					completedContent={checkout ? completedOrder : completedWorkspace}
				/>
			{/key}
			<RefreshButton
				onClick={() => {
					step = 1;
					key++;
				}}
			/>
		</div>

		<Customize>
			<PreviewSelect
				title="Preset"
				options={PRESET_OPTIONS}
				value={settings.preset}
				onChange={(value) => applyPreset(value as Preset)}
			/>
			<PreviewSelect
				title="Indicator"
				options={INDICATOR_OPTIONS}
				value={settings.indicator}
				isDisabled={settings.orientation === 'vertical'}
				onChange={(value) => demo.updateProp('indicator', value as Indicator)}
			/>
			<PreviewSelect
				title="Orientation"
				options={ORIENTATION_OPTIONS}
				value={settings.orientation}
				onChange={(value) =>
					demo.updateProps({
						orientation: value as Orientation,
						width: value === 'vertical' ? Math.max(settings.width, 600) : 440
					})}
			/>
			<PreviewSelect
				title="Transition"
				options={TRANSITION_OPTIONS}
				value={settings.transition}
				onChange={(value) => demo.updateProp('transition', value as Transition)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor || ink}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSlider
				title="Width"
				min={320}
				max={760}
				step={10}
				value={settings.width}
				valueUnit="px"
				onChange={(value) => demo.updateProp('width', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewInput
				title="Back Text"
				value={settings.backButtonText}
				placeholder="Back"
				onChange={(value) => demo.updateProp('backButtonText', value)}
			/>
			<PreviewInput
				title="Continue Text"
				value={settings.nextButtonText}
				placeholder="Continue"
				onChange={(value) => demo.updateProp('nextButtonText', value)}
			/>
			<PreviewInput
				title="Complete Text"
				value={settings.completeButtonText}
				placeholder="Complete"
				onChange={(value) => demo.updateProp('completeButtonText', value)}
			/>
			<PreviewSwitch title="Frame" isChecked={settings.frame} onChange={(value) => demo.updateProp('frame', value)} />
			<PreviewSwitch title="Linear" isChecked={settings.linear} onChange={(value) => demo.updateProp('linear', value)} />
			<PreviewSwitch
				title="Disable Step Indicators"
				isChecked={settings.disableStepIndicators}
				onChange={(value) => demo.updateProp('disableStepIndicators', value)}
			/>
			<PreviewSwitch
				title="Show Footer"
				isChecked={settings.showFooter}
				onChange={(value) => demo.updateProp('showFooter', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
