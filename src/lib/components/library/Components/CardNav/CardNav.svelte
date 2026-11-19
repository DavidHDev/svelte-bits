<!-- @svelte-bits
{
  "title": "Card Nav",
  "description": "A navigation bar that springs open into a row of cards, each with its own links.",
  "dependencies": ["@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	import type { Component, Snippet } from 'svelte';

	export interface CardNavLink {
		label: string;
		href?: string;
		ariaLabel?: string;
	}

	export interface CardNavItem {
		label: string;
		description?: string;
		bgColor?: string;
		textColor?: string;
		links?: CardNavLink[];
	}

	export interface CardNavCta {
		label: string;
		href?: string;
		onClick?: (event: MouseEvent) => void;
	}

	export interface CardNavProps {
		logo?: string | Snippet;
		logoAlt?: string;
		logoHref?: string;
		items?: CardNavItem[];
		cta?: CardNavCta;
		theme?: 'dark' | 'light';
		surface?: 'glass' | 'solid';
		openOn?: 'click' | 'hover';
		cardEffect?: 'rise' | 'unfold' | 'fade';
		stagger?: number;
		bounce?: number;
		speed?: number;
		cardHeight?: number;
		maxWidth?: number;
		accentColor?: string;
		menuLabel?: boolean;
		intro?: boolean;
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		linkComponent?: string | Component<any>;
		onLinkClick?: (link: CardNavLink, item: CardNavItem, event: MouseEvent) => void;
		ariaLabel?: string;
		class?: string;
		style?: string;
	}

	const THEMES: Record<string, Record<string, string>> = {
		dark: {
			'--cn-panel': 'rgba(42, 37, 33, 0.72)',
			'--cn-solid': '#2a2521',
			'--cn-edge': 'rgba(255, 255, 255, 0.08)',
			'--cn-highlight': 'rgba(255, 255, 255, 0.07)',
			'--cn-shadow': '0 24px 48px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--cn-text': '#f5f4f3',
			'--cn-muted': 'rgba(245, 244, 243, 0.56)',
			'--cn-hover': 'rgba(255, 255, 255, 0.06)',
			'--cn-ring': 'rgba(245, 244, 243, 0.55)',
			'--cn-tile': 'linear-gradient(180deg, #38312b 0%, #2a241f 100%)',
			'--cn-tile-rim':
				'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.6)',
			'--cn-cta': 'linear-gradient(180deg, #ffffff 0%, #efebe8 100%)',
			'--cn-cta-ink': '#14110e',
			'--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
			'--cn-cta-hover': 'brightness(0.94)'
		},
		light: {
			'--cn-panel': 'rgba(245, 244, 242, 0.84)',
			'--cn-solid': '#f5f4f2',
			'--cn-edge': 'rgba(28, 25, 23, 0.07)',
			'--cn-highlight': 'rgba(255, 255, 255, 0.95)',
			'--cn-shadow': '0 24px 48px -24px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--cn-text': '#1c1917',
			'--cn-muted': 'rgba(28, 25, 23, 0.56)',
			'--cn-hover': 'rgba(28, 25, 23, 0.05)',
			'--cn-ring': 'rgba(28, 25, 23, 0.45)',
			'--cn-tile': 'linear-gradient(180deg, #ffffff 0%, #faf9f7 100%)',
			'--cn-tile-rim':
				'inset 0 0 0 1px rgba(28, 25, 23, 0.07), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(28, 25, 23, 0.22)',
			'--cn-cta': 'linear-gradient(180deg, #2f2a26 0%, #1c1917 100%)',
			'--cn-cta-ink': '#ffffff',
			'--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(28, 25, 23, 0.45)',
			'--cn-cta-hover': 'brightness(1.25)'
		}
	};

	const ROOT =
		'group/cn relative mx-auto h-[var(--cn-bar)] w-full max-w-[var(--cn-max)] text-[14px] leading-[1.4] [-webkit-tap-highlight-color:transparent]';
	const PANEL =
		'absolute inset-x-0 top-0 z-10 h-[var(--cn-bar)] overflow-hidden rounded-[var(--cn-radius)] [background:var(--cn-panel)] [box-shadow:var(--cn-shadow)] [-webkit-backdrop-filter:var(--cn-blur)] [backdrop-filter:var(--cn-blur)]';
	const RIM =
		'pointer-events-none absolute inset-0 z-[3] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--cn-edge),inset_0_1px_0_var(--cn-highlight)]';
	const BAR =
		'relative z-[2] box-border grid h-[var(--cn-bar)] grid-cols-[1fr_auto_1fr] items-center px-[var(--cn-inset)] group-data-[narrow]/cn:grid-cols-[auto_1fr_auto]';
	const MENU =
		'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] cursor-pointer items-center gap-[10px] justify-self-start rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 pl-[16px] pr-[14px] [background:none] [font-family:inherit] [font-size:inherit] font-medium text-[var(--cn-text)] outline-none transition-[background-color] duration-200 ease-[ease] hover:[background:var(--cn-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)] data-[icon-only]:w-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] data-[icon-only]:justify-center data-[icon-only]:p-0 group-data-[narrow]/cn:col-[3] group-data-[narrow]/cn:row-[1] group-data-[narrow]/cn:justify-self-end';
	const BURGER = 'relative h-[12px] w-[18px]';
	const LINE_TOP =
		'absolute left-0 top-[2.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:top-[5.25px] group-data-[open]/cn:rotate-45 motion-reduce:transition-none';
	const LINE_BOTTOM =
		'absolute left-0 top-[8.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:top-[5.25px] group-data-[open]/cn:-rotate-45 motion-reduce:transition-none';
	const MENU_LABEL = 'relative inline-grid overflow-hidden';
	const WORD_OPEN =
		'[grid-area:1/1] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:-translate-y-[110%] motion-reduce:transition-none';
	const WORD_CLOSE =
		'[grid-area:1/1] translate-y-[110%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:translate-y-0 motion-reduce:transition-none';
	const LOGO =
		'inline-flex h-[var(--cn-logo)] items-center justify-self-center text-[var(--cn-text)] no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)] [&_img]:block [&_img]:h-full [&_img]:w-auto [&_svg]:block [&_svg]:h-full [&_svg]:w-auto group-data-[narrow]/cn:col-[1] group-data-[narrow]/cn:row-[1] group-data-[narrow]/cn:justify-self-start group-data-[narrow]/cn:pl-[14px]';
	const CTA =
		'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] justify-self-end cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
	const CTA_WIDE =
		'flex h-[44px] w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
	const CONTENT =
		'invisible absolute inset-x-0 top-[var(--cn-bar)] box-border flex flex-col gap-[var(--cn-gap)] px-[var(--cn-inset)] pb-[var(--cn-inset)] [perspective:900px] group-data-[shown]/cn:visible';
	const CARDS = 'flex gap-[var(--cn-gap)] group-data-[narrow]/cn:flex-col';
	const CARD =
		'group/card relative box-border flex min-h-[var(--cn-card)] min-w-0 flex-[1_1_0] origin-top flex-col gap-[18px] rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] px-[16px] pb-[14px] pt-[16px] [background:var(--cn-tile)] [box-shadow:var(--cn-tile-rim)] text-[var(--cn-text)] will-change-[transform,opacity] data-[tinted]:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.16),0_4px_10px_-4px_rgba(0,0,0,0.45)] group-data-[narrow]/cn:min-h-0 group-data-[narrow]/cn:flex-none group-data-[narrow]/cn:gap-[10px] group-data-[narrow]/cn:px-[14px] group-data-[narrow]/cn:pb-[12px] group-data-[narrow]/cn:pt-[14px]';
	const CARD_HEAD = 'flex flex-col gap-[4px]';
	const LABEL = 'text-[17px] font-semibold tracking-[-0.015em]';
	const DESCRIPTION =
		'm-0 text-[13px] leading-[1.45] text-[var(--cn-muted)] group-data-[tinted]/card:text-inherit group-data-[tinted]/card:opacity-70';
	const LINKS =
		'm-0 mt-auto flex list-none flex-col gap-[2px] p-0 group-data-[narrow]/cn:flex-row group-data-[narrow]/cn:flex-wrap group-data-[narrow]/cn:gap-x-[16px] group-data-[narrow]/cn:gap-y-[2px]';
	const LINK =
		'group/link inline-flex cursor-pointer items-center gap-[8px] rounded-[6px] border-0 px-0 py-[3px] [background:none] [font-family:inherit] text-[14px] font-medium text-inherit no-underline opacity-[0.82] outline-none transition-opacity duration-200 ease-[ease] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]';
	const ARROW = 'relative inline-block h-[14px] w-[14px] flex-none overflow-hidden';
	const ARROW_OUT =
		'absolute inset-0 h-full w-full transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-[110%] group-hover/link:-translate-y-[110%] group-focus-visible/link:translate-x-[110%] group-focus-visible/link:-translate-y-[110%] motion-reduce:transition-none';
	const ARROW_IN =
		'absolute inset-0 h-full w-full -translate-x-[110%] translate-y-[110%] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-focus-visible/link:translate-x-0 group-focus-visible/link:translate-y-0 motion-reduce:transition-none';

	const DEFAULT_ITEMS: CardNavItem[] = [
		{
			label: 'About',
			description: 'The people and the story behind the studio.',
			links: [
				{ label: 'Company', href: '#' },
				{ label: 'Careers', href: '#' }
			]
		},
		{
			label: 'Projects',
			description: 'Selected work from the last few years.',
			links: [
				{ label: 'Featured', href: '#' },
				{ label: 'Case studies', href: '#' }
			]
		},
		{
			label: 'Contact',
			description: 'Say hello, we read everything.',
			links: [
				{ label: 'Email', href: '#' },
				{ label: 'X', href: '#' },
				{ label: 'LinkedIn', href: '#' }
			]
		}
	];

	const NARROW = 560;
	const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const easeOut = (t: number) => 1 - (1 - t) ** 3;

	const contrastInk = (color?: string): string | null => {
		const hex = String(color || '')
			.trim()
			.replace('#', '');
		if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
		const full =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex;
		const channel = (index: number) => {
			const value = parseInt(full.slice(index, index + 2), 16) / 255;
			return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		};
		const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
		return luminance > 0.36 ? '#14110e' : '#ffffff';
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

	let {
		logo,
		logoAlt = 'Logo',
		logoHref = '#',
		items = DEFAULT_ITEMS,
		cta,
		theme = 'dark',
		surface = 'glass',
		openOn = 'click',
		cardEffect = 'rise',
		stagger = 0.12,
		bounce = 0.2,
		speed = 1,
		cardHeight = 176,
		maxWidth = 800,
		accentColor,
		menuLabel = true,
		intro = true,
		defaultOpen = false,
		open: openProp,
		onOpenChange,
		linkComponent = 'a',
		onLinkClick,
		ariaLabel = 'Main',
		class: className = '',
		style
	}: CardNavProps = $props();

	const contentId = $props.id();
	let rootEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let menuEl = $state<HTMLButtonElement | null>(null);
	let barEl = $state<HTMLDivElement | null>(null);
	const cardEls: (HTMLElement | null)[] = [];
	let engine: { wake: () => void; refresh: () => void } | null = null;
	let leaveTimer = 0;
	const introOnMount = untrack(() => intro);
	let openState = $state(untrack(() => defaultOpen));
	let narrow = $state(false);
	let shown = $state(untrack(() => defaultOpen));

	const controlled = $derived(openProp !== undefined);
	const hasCta = $derived(Boolean(cta));
	const open = $derived(controlled ? Boolean(openProp) : openState);

	const settings = $derived({
		open,
		cardEffect,
		stagger: clamp(stagger, 0, 0.3),
		bounce: clamp(bounce, 0, 1),
		speed: clamp(speed, 0.2, 3)
	});

	const vars = $derived.by(() => {
		const palette = THEMES[theme] ?? THEMES.dark;
		const next: Record<string, string> = {
			...palette,
			'--cn-max': `${maxWidth}px`,
			'--cn-bar': '60px',
			'--cn-inset': '8px',
			'--cn-gap': '8px',
			'--cn-radius': '18px',
			'--cn-logo': '24px',
			'--cn-card': `${cardHeight}px`
		};
		if (surface === 'glass') next['--cn-blur'] = 'blur(20px) saturate(1.6)';
		if (surface === 'solid') {
			next['--cn-panel'] = palette['--cn-solid'];
			next['--cn-blur'] = 'none';
		}
		if (accentColor) {
			next['--cn-cta'] = accentColor;
			next['--cn-cta-ink'] = contrastInk(accentColor) || '#ffffff';
			next['--cn-cta-shadow'] = 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)';
			next['--cn-cta-hover'] = 'brightness(1.08)';
		}
		return next;
	});

	const rootStyle = $derived(
		Object.entries(vars)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ') + (style ? `; ${style}` : '')
	);

	const setOpen = (next: boolean) => {
		if (next === open) return;
		if (!controlled) openState = next;
		onOpenChange?.(next);
	};

	const card = (element: HTMLElement, index: number) => {
		let current = index;
		cardEls[current] = element;
		return {
			update(next: number) {
				if (cardEls[current] === element) cardEls[current] = null;
				current = next;
				cardEls[current] = element;
			},
			destroy() {
				if (cardEls[current] === element) cardEls[current] = null;
			}
		};
	};

	$effect(() => {
		void items.length;
		void hasCta;
		void narrow;
		const panel = panelEl;
		const content = contentEl;
		if (!panel || !content) return;
		return untrack(() => {
			const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
			const state = { p: settings.open ? 1 : 0, v: 0, height: content.offsetHeight, bar: 60 };
			let raf = 0;
			let last = 0;

			const render = () => {
				const s = settings;
				state.bar = parseFloat(getComputedStyle(panel).getPropertyValue('--cn-bar')) || 60;
				panel.style.height = `${state.bar + Math.max(0, state.p) * state.height}px`;
				const cards = cardEls.filter((element): element is HTMLElement => Boolean(element));
				const count = cards.length;
				const lag = count > 1 ? Math.min(s.stagger, 0.7 / (count - 1)) : 0;
				const span = 1 - lag * (count - 1);
				cards.forEach((element, index) => {
					const local = clamp((state.p - index * lag) / Math.max(span, 0.05), 0, 1);
					const e = easeOut(local);
					if (s.cardEffect === 'unfold') {
						element.style.transform = `translateY(${(1 - e) * -10}px) rotateX(${(1 - e) * -72}deg)`;
						element.style.opacity = `${clamp(local * 1.8, 0, 1)}`;
						element.style.filter = '';
					} else if (s.cardEffect === 'fade') {
						element.style.transform = `translateY(${(1 - e) * 6}px)`;
						element.style.opacity = `${e}`;
						element.style.filter = e < 0.999 ? `blur(${(1 - e) * 6}px)` : '';
					} else {
						element.style.transform = `translateY(${(1 - e) * 26}px) scale(${0.97 + 0.03 * e})`;
						element.style.opacity = `${e}`;
						element.style.filter = '';
					}
				});
			};

			const tick = (now: number) => {
				raf = 0;
				const s = settings;
				const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
				last = now;
				const target = s.open ? 1 : 0;
				if (reduce) {
					state.p = target;
					state.v = 0;
				} else {
					const k = 160 * s.speed * s.speed;
					const zeta = s.open ? 1 - 0.68 * s.bounce : 1;
					const steps = Math.ceil(dt / (1 / 240));
					const h = dt / steps;
					for (let i = 0; i < steps; i++) {
						state.v += (-k * (state.p - target) - 2 * zeta * Math.sqrt(k) * state.v) * h;
						state.p += state.v * h;
					}
				}
				const done = Math.abs(state.p - target) < 0.0005 && Math.abs(state.v) < 0.002;
				if (done) {
					state.p = target;
					state.v = 0;
				}
				render();
				if (done && target === 0) shown = false;
				if (!done) raf = requestAnimationFrame(tick);
			};

			const wake = () => {
				if (!raf) {
					last = 0;
					raf = requestAnimationFrame(tick);
				}
			};

			engine = {
				wake,
				refresh: () => {
					state.height = content.offsetHeight;
					render();
				}
			};

			render();
			const observer = new ResizeObserver(() => {
				state.height = content.offsetHeight;
				render();
			});
			observer.observe(content);

			return () => {
				cancelAnimationFrame(raf);
				observer.disconnect();
				engine = null;
			};
		});
	});

	$effect(() => {
		const value = open;
		untrack(() => {
			if (value) shown = true;
			engine?.refresh();
			engine?.wake();
		});
	});

	$effect(() => {
		void settings.cardEffect;
		void settings.stagger;
		void items;
		void cta;
		void menuLabel;
		void cardHeight;
		void maxWidth;
		void theme;
		void surface;
		untrack(() => engine?.refresh());
	});

	$effect(() => {
		const root = rootEl;
		if (!root) return;
		const measure = () => {
			narrow = root.offsetWidth < NARROW;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && rootEl?.contains(target)) return;
			setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			setOpen(false);
			menuEl?.focus();
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	});

	onMount(() => {
		const panel = panelEl;
		const bar = barEl;
		if (panel && bar && introOnMount && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			const width = panel.offsetWidth;
			const height = panel.offsetHeight;
			const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 18;
			panel.animate(
				[
					{ clipPath: `inset(0px ${Math.max(0, (width - height) / 2)}px round ${height / 2}px)`, opacity: 0 },
					{ clipPath: `inset(0px 0px round ${radius}px)`, opacity: 1 }
				],
				{ duration: 820, easing: EASE_OUT, fill: 'backwards' }
			);
			Array.from(bar.children).forEach((child, index) => {
				child.animate(
					[
						{ opacity: 0, transform: 'translateY(8px)' },
						{ opacity: 1, transform: 'translateY(0)' }
					],
					{ duration: 560, delay: 220 + index * 70, easing: EASE_OUT, fill: 'backwards' }
				);
			});
		}
		return () => window.clearTimeout(leaveTimer);
	});

	const hover = $derived(openOn === 'hover');

	const onPointerEnter = (event: PointerEvent) => {
		if (!hover || event.pointerType === 'touch') return;
		window.clearTimeout(leaveTimer);
		setOpen(true);
	};

	const onPointerLeave = (event: PointerEvent) => {
		if (!hover || event.pointerType === 'touch') return;
		window.clearTimeout(leaveTimer);
		leaveTimer = window.setTimeout(() => setOpen(false), 160);
	};

	const cardStyle = (item: CardNavItem) =>
		item.bgColor ? `background: ${item.bgColor};${item.textColor ? ` color: ${item.textColor};` : ''}` : undefined;
</script>

{#snippet anchor(target: CardNavLink | CardNavCta, attrs: Record<string, unknown>, content: Snippet)}
	{#if !target.href}
		<button type="button" {...attrs}>{@render content()}</button>
	{:else if typeof linkComponent === 'string'}
		<svelte:element this={linkComponent} {...{ href: target.href, ...attrs }}>{@render content()}</svelte:element>
	{:else}
		{@const Link = linkComponent}
		<Link href={target.href} {...attrs}>{@render content()}</Link>
	{/if}
{/snippet}

{#snippet ctaLabel()}{cta?.label}{/snippet}

{#snippet ctaButton(target: CardNavCta, wide: boolean)}
	{@render anchor(
		target,
		{
			class: wide ? CTA_WIDE : CTA,
			tabindex: wide && !open ? -1 : undefined,
			onclick: (event: MouseEvent) => {
				target.onClick?.(event);
				if (wide) setOpen(false);
			}
		},
		ctaLabel
	)}
{/snippet}

{#snippet logoContent()}
	{#if typeof logo === 'string'}
		<img src={logo} alt="" draggable="false" />
	{:else if logo}
		{@render logo()}
	{/if}
{/snippet}

<div
	bind:this={rootEl}
	class={[ROOT, className].filter(Boolean).join(' ')}
	data-open={open ? '' : undefined}
	data-shown={shown || open ? '' : undefined}
	data-narrow={narrow ? '' : undefined}
	style={rootStyle}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
	role="presentation"
>
	<nav bind:this={panelEl} class={PANEL} aria-label={ariaLabel}>
		<div bind:this={barEl} class={BAR}>
			<button
				bind:this={menuEl}
				type="button"
				class={MENU}
				data-icon-only={menuLabel ? undefined : ''}
				aria-expanded={open}
				aria-controls={contentId}
				aria-label={menuLabel ? undefined : open ? 'Close menu' : 'Open menu'}
				onclick={() => setOpen(!open)}
			>
				<span class={BURGER} aria-hidden="true">
					<span class={LINE_TOP}></span>
					<span class={LINE_BOTTOM}></span>
				</span>
				{#if menuLabel}
					<span class={MENU_LABEL}>
						<span class={WORD_OPEN} aria-hidden={open}>Menu</span>
						<span class={WORD_CLOSE} aria-hidden={!open}>Close</span>
					</span>
				{/if}
			</button>

			{#if logo}
				{#if typeof linkComponent === 'string'}
					<svelte:element this={linkComponent} {...{ href: logoHref, class: LOGO, 'aria-label': logoAlt }}>
						{@render logoContent()}
					</svelte:element>
				{:else}
					{@const Link = linkComponent}
					<Link href={logoHref} class={LOGO} aria-label={logoAlt}>{@render logoContent()}</Link>
				{/if}
			{/if}

			{#if cta && !narrow}
				{@render ctaButton(cta, false)}
			{/if}
		</div>

		<div bind:this={contentEl} id={contentId} class={CONTENT} aria-hidden={!open}>
			<div class={CARDS}>
				{#each items as item, index (`${item.label}-${index}`)}
					<div use:card={index} class={CARD} data-tinted={item.bgColor ? '' : undefined} style={cardStyle(item)}>
						<div class={CARD_HEAD}>
							<span class={LABEL}>{item.label}</span>
							{#if item.description}
								<p class={DESCRIPTION}>{item.description}</p>
							{/if}
						</div>
						<ul class={LINKS}>
							{#each item.links ?? [] as link, linkIndex (`${link.label}-${linkIndex}`)}
								{#snippet linkContent()}
									<span class={ARROW} aria-hidden="true">
										<HugeiconsIcon class={ARROW_OUT} icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
										<HugeiconsIcon class={ARROW_IN} icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
									</span>
									{link.label}
								{/snippet}
								<li>
									{@render anchor(
										link,
										{
											class: LINK,
											'aria-label': link.ariaLabel,
											tabindex: open ? undefined : -1,
											onclick: (event: MouseEvent) => {
												onLinkClick?.(link, item, event);
												setOpen(false);
											}
										},
										linkContent
									)}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
			{#if cta && narrow}
				<div use:card={items.length}>
					{@render ctaButton(cta, true)}
				</div>
			{/if}
		</div>
		<span class={RIM}></span>
	</nav>
</div>
