<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PillNav from '$lib/components/library/Components/PillNav/PillNav.svelte';
	import source from '$lib/components/library/Components/PillNav/PillNav.svelte?raw';
	import logoDark from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
	import logoLight from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	const DEFAULTS = { theme: 'light', initialLoadAnimation: false };
	let theme = $state<'light' | 'dark' | 'color'>('light');
	let initialLoadAnimation = $state(DEFAULTS.initialLoadAnimation);

	const hasChanges = $derived(theme !== DEFAULTS.theme || initialLoadAnimation !== DEFAULTS.initialLoadAnimation);
	function reset() { theme = 'light'; initialLoadAnimation = DEFAULTS.initialLoadAnimation; }

	const themeConfigs = {
		light: { logo: logoLight, baseColor: '#000', pillColor: '#f0f0f0', hoveredPillTextColor: '#fff', pillTextColor: '#000', backgroundColor: '#f0f0f0' },
		dark: { logo: logoDark, baseColor: '#fff', pillColor: '#120F17', hoveredPillTextColor: '#000', pillTextColor: '#fff', backgroundColor: '#120F17' },
		color: { logo: logoDark, baseColor: '#FF8A4C', pillColor: '#120F17', hoveredPillTextColor: '#120F17', pillTextColor: '#fff', backgroundColor: '#120F17' }
	} as const;
	const current = $derived(themeConfigs[theme]);
	// Force remount on theme change so layout/animation re-runs.
	const navKey = $derived(theme + '-' + initialLoadAnimation);

	const themeOptions = [
		{ value: 'light', label: 'Light Mode' },
		{ value: 'dark', label: 'Dark Mode' },
		{ value: 'color', label: 'Colorful' }
	];
	const usage = `<PillNav logo="/logo.svg" items={[{label:'Home',href:'/'}]} activeHref="/" />`;
	const props: PropRow[] = [
		{ name: 'logo', type: 'string', default: '-', description: 'Logo image URL.' },
		{ name: 'logoAlt', type: 'string', default: '"Logo"', description: 'Alt text.' },
		{ name: 'items', type: 'PillNavItem[]', default: '-', description: 'Nav items {label, href, ariaLabel?}.' },
		{ name: 'activeHref', type: 'string', default: '-', description: 'Currently active href.' },
		{ name: 'ease', type: 'string', default: '"power3.easeOut"', description: 'GSAP ease.' },
		{ name: 'baseColor', type: 'string', default: '"#fff"', description: 'Background color.' },
		{ name: 'pillColor', type: 'string', default: '"#120F17"', description: 'Pill background.' },
		{ name: 'hoveredPillTextColor', type: 'string', default: '"#120F17"', description: 'Pill hover text color.' },
		{ name: 'pillTextColor', type: 'string', default: 'baseColor', description: 'Pill text color.' },
		{ name: 'initialLoadAnimation', type: 'boolean', default: 'true', description: 'Animate logo + nav on mount.' },
		{ name: 'onMobileMenuClick', type: '() => void', default: '-', description: 'Mobile menu callback.' }
	];
</script>

<svelte:head><title>Pill Nav - svelte-bits</title></svelte:head>
<h1 class="sub-category">Pill Nav</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="PillNav" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container demo-container-dots" style="position:relative;height:300px;overflow:hidden;background:{current.backgroundColor};">
			{#key navKey}
				<PillNav
					logo={current.logo}
					baseColor={current.baseColor}
					pillColor={current.pillColor}
					hoveredPillTextColor={current.hoveredPillTextColor}
					pillTextColor={current.pillTextColor}
					{initialLoadAnimation}
					items={[
						{ label: 'Home', href: '#' },
						{ label: 'About', href: '#about' },
						{ label: 'Contact', href: '#contact' }
					]}
					activeHref="#"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="pill-nav" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Example" options={themeOptions} value={theme} onChange={(v) => (theme = v as 'light' | 'dark' | 'color')} />
			<PreviewSwitch title="Initial Load Animation" checked={initialLoadAnimation} onChange={(v) => (initialLoadAnimation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
