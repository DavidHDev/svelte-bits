<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import StaggeredMenu from '$lib/components/library/Components/StaggeredMenu/StaggeredMenu.svelte';
	import source from '$lib/components/library/Components/StaggeredMenu/StaggeredMenu.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-logo.svg';

	const DEFAULTS = { displaySocials: true, accentColor: '#FF8A4C', menuButtonColor: '#ffffff', position: 'right' as 'left' | 'right' };
	let displaySocials = $state(DEFAULTS.displaySocials);
	let accentColor = $state(DEFAULTS.accentColor);
	let menuButtonColor = $state(DEFAULTS.menuButtonColor);
	let position = $state<'left' | 'right'>(DEFAULTS.position);
	let menuKey = $state(0);

	const hasChanges = $derived(
		displaySocials !== DEFAULTS.displaySocials || accentColor !== DEFAULTS.accentColor ||
		menuButtonColor !== DEFAULTS.menuButtonColor || position !== DEFAULTS.position
	);
	function reset() {
		displaySocials = DEFAULTS.displaySocials; accentColor = DEFAULTS.accentColor;
		menuButtonColor = DEFAULTS.menuButtonColor; position = DEFAULTS.position; menuKey++;
	}

	const items = [
		{ label: 'Home', ariaLabel: 'Go to Home section', link: '#home' },
		{ label: 'About', ariaLabel: 'Go to About section', link: '#about' },
		{ label: 'Projects', ariaLabel: 'Go to Projects section', link: '#projects' },
		{ label: 'Contact', ariaLabel: 'Go to Contact section', link: '#contact' }
	];
	const socialItems = [
		{ label: 'GitHub', link: 'https://github.com/' },
		{ label: 'Twitter', link: 'https://twitter.com/' },
		{ label: 'LinkedIn', link: 'https://linkedin.com/' }
	];

	const usage = `<StaggeredMenu items={items} socialItems={socials} position="right" accentColor="#FF8A4C" />`;
	const props: PropRow[] = [
		{ name: 'position', type: '"left" | "right"', default: '"right"', description: 'Anchor side.' },
		{ name: 'colors', type: 'string[]', default: '["#FFC18A","#FF8A4C"]', description: 'Underlay layer colors.' },
		{ name: 'items', type: 'StaggeredMenuItem[]', default: '[]', description: 'Menu items.' },
		{ name: 'socialItems', type: 'StaggeredMenuSocialItem[]', default: '[]', description: 'Social links.' },
		{ name: 'displaySocials', type: 'boolean', default: 'true', description: 'Show social links.' },
		{ name: 'displayItemNumbering', type: 'boolean', default: 'true', description: 'Show item numbers.' },
		{ name: 'logoUrl', type: 'string', default: '""', description: 'Logo image URL.' },
		{ name: 'menuButtonColor', type: 'string', default: '"#fff"', description: 'Toggle button color when closed.' },
		{ name: 'openMenuButtonColor', type: 'string', default: '"#fff"', description: 'Toggle button color when open.' },
		{ name: 'accentColor', type: 'string', default: '"#FF8A4C"', description: 'Hover/numbering accent.' },
		{ name: 'changeMenuColorOnOpen', type: 'boolean', default: 'true', description: 'Animate button color on toggle.' },
		{ name: 'closeOnClickAway', type: 'boolean', default: 'true', description: 'Close on outside click.' },
		{ name: 'onMenuOpen', type: '() => void', default: '-', description: 'Open callback.' },
		{ name: 'onMenuClose', type: '() => void', default: '-', description: 'Close callback.' }
	];
</script>

<svelte:head><title>Staggered Menu - svelte-bits</title></svelte:head>
<h1 class="sub-category">Staggered Menu</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="StaggeredMenu" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;padding:0;background:#1a1a1a;">
			{#key menuKey}
				<StaggeredMenu
					logoUrl={logo}
					{items}
					{socialItems}
					openMenuButtonColor={position === 'left' ? '#fff' : '#000'}
					{displaySocials}
					{accentColor}
					{menuButtonColor}
					{position}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="staggered-menu" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Position" value={position} options={[{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }]} onChange={(v) => { position = v as 'left' | 'right'; menuKey++; }} />
			<PreviewColorPicker title="Accent Color" color={accentColor} onChange={(v) => (accentColor = v)} />
			<PreviewColorPicker title="Menu Button Color" color={menuButtonColor} onChange={(v) => (menuButtonColor = v)} />
			<PreviewSwitch title="Display Socials" checked={displaySocials} onChange={(v) => (displaySocials = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
