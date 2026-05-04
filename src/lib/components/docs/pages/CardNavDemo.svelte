<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CardNav, { type CardNavItem } from '$lib/components/library/Components/CardNav/CardNav.svelte';
	import source from '$lib/components/library/Components/CardNav/CardNav.svelte?raw';
	import logoLight from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
	import logoDark from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	type Theme = 'light' | 'dark' | 'color';
	const DEFAULTS = { theme: 'light' as Theme, ease: 'power3.out' };
	let theme = $state<Theme>(DEFAULTS.theme);
	let ease = $state(DEFAULTS.ease);
	let key = $state(0);

	const items: CardNavItem[] = [
		{ label: 'About', bgColor: '#1B1722', textColor: '#fff', links: [
			{ label: 'Company', href: '#', ariaLabel: 'About Company' },
			{ label: 'Careers', href: '#', ariaLabel: 'About Careers' }
		] },
		{ label: 'Projects', bgColor: '#222222', textColor: '#fff', links: [
			{ label: 'Featured', href: '#', ariaLabel: 'Featured Projects' },
			{ label: 'Case Studies', href: '#', ariaLabel: 'Project Case Studies' }
		] },
		{ label: 'Contact', bgColor: '#222222', textColor: '#fff', links: [
			{ label: 'Email', href: '#', ariaLabel: 'Email us' },
			{ label: 'Twitter', href: '#', ariaLabel: 'Twitter' },
			{ label: 'LinkedIn', href: '#', ariaLabel: 'LinkedIn' }
		] }
	];

	const themeConfigs = {
		light: { logo: logoLight, baseColor: '#fff', menuColor: '#000', buttonBgColor: '#111', buttonTextColor: '#fff', backgroundColor: '#f5f5f5' },
		dark: { logo: logoDark, baseColor: '#120F17', menuColor: '#fff', buttonBgColor: '#FF8A4C', buttonTextColor: '#fff', backgroundColor: '#120F17' },
		color: { logo: logoDark, baseColor: '#FF8A4C', menuColor: '#fff', buttonBgColor: '#fff', buttonTextColor: '#FF8A4C', backgroundColor: '#120F17' }
	};
	const currentTheme = $derived(themeConfigs[theme]);

	const hasChanges = $derived(theme !== DEFAULTS.theme || ease !== DEFAULTS.ease);
	function reset() { theme = DEFAULTS.theme; ease = DEFAULTS.ease; key++; }

	const usage = $derived(`<CardNav logo={logo} items={items} ease="${ease}" baseColor="${currentTheme.baseColor}" />`);
	const props: PropRow[] = [
		{ name: 'logo', type: 'string', default: '-', description: 'URL for the logo image.' },
		{ name: 'logoAlt', type: 'string', default: '"Logo"', description: 'Alt text for the logo.' },
		{ name: 'items', type: 'CardNavItem[]', default: '-', description: 'Array of nav items.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the container.' },
		{ name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing function.' },
		{ name: 'baseColor', type: 'string', default: '"#fff"', description: 'Background color of the nav.' },
		{ name: 'menuColor', type: 'string', default: '-', description: 'Color for the hamburger lines.' },
		{ name: 'buttonBgColor', type: 'string', default: '-', description: 'CTA button bg color.' },
		{ name: 'buttonTextColor', type: 'string', default: '-', description: 'CTA button text color.' }
	];
</script>

<svelte:head><title>Card Nav - svelte-bits</title></svelte:head>
<h1 class="sub-category">Card Nav</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CardNav" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container demo-container-dots" style="position:relative;height:550px;overflow:hidden;background:{currentTheme.backgroundColor};">
			{#key key + theme}
				<CardNav
					logo={currentTheme.logo}
					{items}
					baseColor={currentTheme.baseColor}
					menuColor={currentTheme.menuColor}
					buttonBgColor={currentTheme.buttonBgColor}
					buttonTextColor={currentTheme.buttonTextColor}
					{ease}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="card-nav" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Example" value={theme} options={[
				{ label: 'Light Mode', value: 'light' },
				{ label: 'Dark Mode', value: 'dark' },
				{ label: 'Colorful', value: 'color' }
			]} onChange={(v) => { theme = v as Theme; key++; }} />
			<PreviewSelect title="Ease" value={ease} options={[
				{ label: 'power3.out', value: 'power3.out' },
				{ label: 'back.out(1.7)', value: 'back.out(1.7)' },
				{ label: 'elastic.out(1, 0.8)', value: 'elastic.out(1, 0.8)' },
				{ label: 'circ.out', value: 'circ.out' }
			]} onChange={(v) => { ease = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
