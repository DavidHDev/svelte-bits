<!-- @svelte-bits
{
  "title": "Profile Card",
  "description": "A framed profile card that tilts toward the cursor, with holographic foil shining through a tiled pattern.",
  "dependencies": ["@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	export type ProfileCardPalette = 'dark' | 'light';

	type Engine = {
		aim: (nx: number, ny: number, on?: boolean) => void;
		release: () => void;
		write: () => void;
	};

	type OrientationPermission = {
		requestPermission?: () => Promise<PermissionState>;
	};

	const THEMES: Record<ProfileCardPalette, Record<string, string>> = {
		dark: {
			'--pc-frame': 'rgba(41, 36, 32, 0.66)',
			'--pc-frame-edge': 'rgba(255, 255, 255, 0.08)',
			'--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)',
			'--pc-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--pc-tile': 'linear-gradient(180deg, #3d3630 0%, #29241f 100%)',
			'--pc-tile-edge': 'rgba(255, 255, 255, 0.07)',
			'--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
			'--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			'--pc-ink': '#f5f4f2',
			'--pc-muted': 'rgba(245, 244, 242, 0.6)',
			'--pc-hover': 'brightness(1.12)',
			'--pc-press': 'brightness(0.8)',
			'--pc-shade': 'rgba(0, 0, 0, 0.4)'
		},
		light: {
			'--pc-frame': 'rgba(243, 242, 240, 0.8)',
			'--pc-frame-edge': 'rgba(28, 25, 23, 0.07)',
			'--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)',
			'--pc-frame-shadow': '0 22px 44px -22px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--pc-tile': 'linear-gradient(180deg, #ffffff 0%, #f8f7f5 100%)',
			'--pc-tile-edge': 'rgba(28, 25, 23, 0.08)',
			'--pc-tile-highlight': 'rgba(255, 255, 255, 1)',
			'--pc-tile-shadow': '0 4px 10px -5px rgba(28, 25, 23, 0.25)',
			'--pc-ink': '#292524',
			'--pc-muted': 'rgba(41, 37, 36, 0.6)',
			'--pc-hover': 'brightness(0.97)',
			'--pc-press': 'brightness(0.92)',
			'--pc-shade': 'rgba(28, 25, 23, 0.14)'
		}
	};

	const FOILS: Record<ProfileCardPalette, Record<string, string>> = {
		dark: {
			'--pc-blend': 'color-dodge',
			'--pc-holo-filter': 'hue-rotate(0deg)',
			'--pc-sheen': 'rgba(255, 255, 255, 0.16)'
		},
		light: {
			'--pc-blend': 'multiply',
			'--pc-holo-filter': 'invert(1) hue-rotate(180deg)',
			'--pc-sheen': 'rgba(255, 255, 255, 0)'
		}
	};

	const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
	)}")`;

	const SPECTRUM =
		'repeating-linear-gradient(0deg, hsl(2, 100%, 73%) 5%, hsl(53, 100%, 69%) 10%, hsl(93, 100%, 69%) 15%, hsl(176, 100%, 76%) 20%, hsl(228, 100%, 74%) 25%, hsl(260, 100%, 76%) 30%, hsl(2, 100%, 73%) 35%)';
	const BARS =
		'repeating-linear-gradient(-45deg, #0e152e 0%, hsl(180, 10%, 60%) 3.8%, hsl(180, 29%, 66%) 4.5%, hsl(180, 10%, 60%) 5.2%, #0e152e 10%, #0e152e 12%)';
	const FALLOFF =
		'radial-gradient(farthest-corner circle at var(--pc-pointer-x) var(--pc-pointer-y), hsla(0, 0%, 0%, 0.1) 12%, hsla(0, 0%, 0%, 0.15) 20%, hsla(0, 0%, 0%, 0.25) 120%)';
	const PATTERN_POSITION = 'calc(50% - var(--pc-shift-x) * 1.5) calc(65% - var(--pc-shift-y) * 1.5)';

	const ROOT_VARS =
		'--pc-light-x: 50%; --pc-light-y: 50%; --pc-pointer-x: 50%; --pc-pointer-y: 50%; --pc-band-x: 50%; --pc-band-y: 50%; --pc-reach: 0; --pc-rotate-x: 0deg; --pc-rotate-y: 0deg; --pc-shift-x: 0px; --pc-shift-y: 0px; --pc-tilt: 0; --pc-active: 0;';

	const SHEEN_STYLE = [
		'background: radial-gradient(farthest-corner circle at calc(var(--pc-light-x) - 10px) calc(var(--pc-light-y) - 10px), var(--pc-sheen) 0%, transparent 55%)',
		'opacity: calc(var(--pc-holo) * var(--pc-active))'
	].join('; ');

	const HOLO_STYLE = [
		`background-image: ${SPECTRUM}, ${BARS}, ${FALLOFF}`,
		'background-position: 0 var(--pc-band-y), var(--pc-band-x) var(--pc-band-y), center',
		'background-size: 500% 500%, 300% 300%, 200% 200%',
		'background-blend-mode: color, hard-light',
		'filter: brightness(calc(0.66 + 0.19 * var(--pc-active))) contrast(calc(1.33 + 0.17 * var(--pc-active))) saturate(calc(0.33 + 0.17 * var(--pc-active))) var(--pc-holo-filter)',
		'opacity: calc(var(--pc-holo) * var(--pc-holo-gain) * (0.5 + 0.5 * var(--pc-active)))',
		'-webkit-mask-image: var(--pc-pattern)',
		'-webkit-mask-size: var(--pc-pattern-size)',
		`-webkit-mask-position: ${PATTERN_POSITION}`,
		'-webkit-mask-repeat: repeat',
		'mask-image: var(--pc-pattern)',
		'mask-size: var(--pc-pattern-size)',
		`mask-position: ${PATTERN_POSITION}`,
		'mask-repeat: repeat'
	].join('; ');

	const GLOW_STYLE = [
		'background-image: linear-gradient(45deg, hsl(176, 100%, 76%), hsl(228, 100%, 74%), hsl(260, 100%, 76%), hsl(2, 100%, 73%), hsl(53, 100%, 69%), hsl(93, 100%, 69%)), radial-gradient(circle at var(--pc-pointer-x) var(--pc-pointer-y), hsl(0, 0%, 70%) 0%, hsla(0, 0%, 30%, 0.2) 90%), var(--pc-grain)',
		'background-size: 250% 250%, 100% 100%, 220px 220px',
		'background-position: var(--pc-pointer-x) var(--pc-pointer-y), center, 0 0',
		'background-blend-mode: color-dodge',
		'filter: brightness(calc(2 - var(--pc-reach))) contrast(calc(var(--pc-reach) + 2)) saturate(calc(0.5 + var(--pc-reach)))',
		'mix-blend-mode: luminosity',
		'opacity: calc(var(--pc-active) * var(--pc-holo-detail))'
	].join('; ');

	const SHIFT_STYLE = [
		`background-image: ${SPECTRUM}, ${BARS}, ${FALLOFF}`,
		'background-position: 0 var(--pc-band-y), calc(var(--pc-band-x) * 0.4) calc(var(--pc-band-y) * 0.5), center',
		'background-size: 200% 300%, 700% 700%, 100% 100%',
		'background-blend-mode: color, hard-light',
		'mix-blend-mode: difference',
		'filter: brightness(0.8) contrast(1.5)',
		'opacity: calc(var(--pc-active) * var(--pc-holo-detail))'
	].join('; ');

	const PHOTO_STYLE = [
		'inset: calc(var(--pc-parallax) * -1)',
		'width: calc(100% + var(--pc-parallax) * 2)',
		'height: calc(100% + var(--pc-parallax) * 2)',
		'transform: translate3d(var(--pc-shift-x), var(--pc-shift-y), 0)'
	].join('; ');

	const SCRIM_STYLE =
		'background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.57) 6%, rgba(0, 0, 0, 0.5) 12%, rgba(0, 0, 0, 0.4) 19%, rgba(0, 0, 0, 0.28) 26%, rgba(0, 0, 0, 0.16) 33%, rgba(0, 0, 0, 0.07) 40%, rgba(0, 0, 0, 0.02) 46%, rgba(0, 0, 0, 0) 52%)';

	const GLARE_STYLE = [
		'background: radial-gradient(farthest-corner circle at var(--pc-light-x) var(--pc-light-y), rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.36) 20%, rgba(255, 255, 255, 0) 60%)',
		'opacity: calc(var(--pc-glare) * var(--pc-active))'
	].join('; ');

	const SHADE_STYLE = [
		'background: radial-gradient(farthest-corner circle at var(--pc-light-x) var(--pc-light-y), transparent 30%, var(--pc-shade) 100%)',
		'opacity: calc(var(--pc-glare) * var(--pc-tilt))'
	].join('; ');

	const ROOT = 'relative w-[340px] max-w-full touch-pan-y [perspective:1000px] [-webkit-tap-highlight-color:transparent]';
	const BODY =
		'relative flex flex-col gap-[10px] rounded-[calc(var(--pc-radius)+10px)] p-[10px] backdrop-blur-[20px] backdrop-saturate-[1.6] will-change-transform [background:var(--pc-frame)] [box-shadow:var(--pc-frame-shadow)] [transform:rotateX(var(--pc-rotate-x))_rotateY(var(--pc-rotate-y))]';
	const TILE =
		'relative isolate aspect-[4/5] overflow-hidden rounded-[var(--pc-radius)] [background:var(--pc-backdrop)] [box-shadow:var(--pc-tile-shadow)]';
	const LAYER = 'pointer-events-none absolute inset-0 rounded-[inherit]';
	const HOLO = 'pointer-events-none absolute inset-0 rounded-[inherit] [mix-blend-mode:var(--pc-blend)]';
	const HOLO_LAYER = 'absolute inset-0';
	const PHOTO = 'pointer-events-none absolute select-none object-cover object-bottom';
	const INFO = 'absolute bottom-[18px] left-5 right-5 text-white';
	const NAME = 'm-0 text-[20px] font-semibold leading-[1.25] tracking-[-0.01em] text-[inherit]';
	const TITLE = 'mx-0 mb-0 mt-1 text-[14px] leading-[1.45] text-white/78';
	const TILE_RIM =
		'pointer-events-none absolute inset-0 rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--pc-tile-edge),inset_0_1px_0_var(--pc-tile-highlight)]';
	const FOOTER = 'flex min-w-0 items-center gap-3 px-5 pb-2 pt-1.5';
	const AVATAR =
		"relative h-9 w-9 flex-none overflow-hidden rounded-full [background:var(--pc-tile)] after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:[box-shadow:inset_0_0_0_1px_var(--pc-tile-edge)]";
	const AVATAR_IMAGE = 'block h-full w-full object-cover object-top';
	const META = 'flex min-w-0 flex-1 flex-col gap-[3px]';
	const HANDLE =
		'overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold leading-[1.25] text-[var(--pc-ink)]';
	const STATUS =
		"flex items-center gap-1.5 whitespace-nowrap text-[12.5px] leading-[1.25] text-[var(--pc-muted)] before:h-1.5 before:w-1.5 before:flex-none before:rounded-full before:bg-[var(--pc-status)] before:content-['']";
	const CONTACT =
		'flex h-9 flex-none cursor-pointer items-center gap-1.5 rounded-[calc(var(--pc-radius)*0.75)] border-none px-3.5 font-[inherit] text-[13px] font-semibold text-[var(--pc-ink)] [background:var(--pc-tile)] [box-shadow:inset_0_0_0_1px_var(--pc-tile-edge),inset_0_1px_0_var(--pc-tile-highlight),var(--pc-tile-shadow)] transition-[filter,transform] duration-200 hover:[filter:var(--pc-hover)] active:scale-[0.96] active:duration-0 active:[filter:var(--pc-press)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pc-ink)]';
	const GLARE = 'pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay';
	const RIM =
		'pointer-events-none absolute inset-0 rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--pc-frame-edge),inset_0_1px_0_var(--pc-frame-highlight)]';

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const isDark = (color: string): boolean | null => {
		const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
		if (!match) return null;
		const hex = match[1].length === 3 ? match[1].replace(/./g, (digit) => digit + digit) : match[1];
		const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Mail01Icon } from '@hugeicons/core-free-icons';

	type Props = {
		avatarUrl?: string;
		iconUrl?: string;
		miniAvatarUrl?: string;
		name?: string;
		title?: string;
		handle?: string;
		status?: string;
		statusColor?: string;
		contactText?: string;
		showUserInfo?: boolean;
		onContactClick?: () => void;
		theme?: ProfileCardPalette;
		backdropColor?: string;
		radius?: number;
		holo?: number;
		glare?: number;
		enableTilt?: boolean;
		tiltStrength?: number;
		parallax?: number;
		enableMobileTilt?: boolean;
		mobileTiltSensitivity?: number;
		intro?: boolean;
		class?: string;
	};

	let {
		avatarUrl = '',
		iconUrl,
		miniAvatarUrl,
		name = 'Javi A. Torres',
		title = 'Software Engineer',
		handle = 'javicodes',
		status = 'Online',
		statusColor = '#22c55e',
		contactText = 'Contact',
		showUserInfo = true,
		onContactClick,
		theme = 'dark',
		backdropColor,
		radius = 16,
		holo = 0.8,
		glare = 0.5,
		enableTilt = true,
		tiltStrength = 12,
		parallax = 8,
		enableMobileTilt = false,
		mobileTiltSensitivity = 5,
		intro = true,
		class: className = ''
	}: Props = $props();

	let root = $state<HTMLDivElement | null>(null);
	let engine: Engine | null = null;

	const palette = $derived<ProfileCardPalette>(theme === 'light' ? 'light' : 'dark');
	const foil = $derived<ProfileCardPalette>(
		backdropColor ? ((isDark(backdropColor) ?? palette === 'dark') ? 'dark' : 'light') : palette
	);
	const backdrop = $derived(
		backdropColor
			? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${backdropColor}, #000000 18%) 100%)`
			: 'var(--pc-tile)'
	);
	const themeVars = $derived(THEMES[palette]);
	const foilVars = $derived(FOILS[foil]);

	onMount(() => {
		const el = root;
		if (!el) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const size = { width: el.offsetWidth, height: el.offsetHeight };
		const x = { p: 0, v: 0, target: 0 };
		const y = { p: 0, v: 0, target: 0 };
		const light = { p: 0, target: 0 };
		let raf = 0;
		let last = 0;
		let slowUntil = 0;
		let touchId: number | null = null;

		const write = () => {
			const angle = enableTilt && !reduced ? tiltStrength : 0;
			const depth = parallax;
			const tilt = Math.min(1, Math.hypot(x.p, y.p));
			const style = el.style;
			style.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
			style.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
			style.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
			style.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
			style.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`);
			style.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`);
			style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
			style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
			style.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
			style.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
			style.setProperty('--pc-reach', tilt.toFixed(4));
			style.setProperty('--pc-tilt', (tilt * light.p).toFixed(4));
			style.setProperty('--pc-active', light.p.toFixed(4));
		};

		const frame = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000 || 0);
			last = now;
			const slow = now < slowUntil;
			const stiffness = slow ? 24 : 120;
			const damping = slow ? 9 : 16;
			const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
			const h = dt / steps;
			for (let i = 0; i < steps; i++) {
				for (const axis of [x, y]) {
					axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
					axis.p += axis.v * h;
				}
			}
			const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
			light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
			write();
			const moving =
				Math.abs(x.target - x.p) > 0.0005 ||
				Math.abs(y.target - y.p) > 0.0005 ||
				Math.abs(x.v) > 0.0005 ||
				Math.abs(y.v) > 0.0005 ||
				Math.abs(light.target - light.p) > 0.002;
			if (moving) {
				raf = requestAnimationFrame(frame);
			} else {
				x.p = x.target;
				y.p = y.target;
				light.p = light.target;
				write();
				raf = 0;
			}
		};

		const wake = () => {
			if (raf) return;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		};

		const aim = (nx: number, ny: number, on = true) => {
			x.target = clamp(nx, -1, 1);
			y.target = clamp(ny, -1, 1);
			light.target = on ? 1 : 0;
			slowUntil = 0;
			wake();
		};

		const aimAt = (event: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
		};

		const release = () => aim(0, 0, false);

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') aimAt(event);
		};
		const onMove = (event: PointerEvent) => {
			if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
		};
		const onLeave = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') release();
		};
		const onDown = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') return;
			touchId = event.pointerId;
			aimAt(event);
		};
		const onUp = (event: PointerEvent) => {
			if (event.pointerId !== touchId) return;
			touchId = null;
			release();
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('pointerdown', onDown);
		el.addEventListener('pointerup', onUp);
		el.addEventListener('pointercancel', onUp);

		const observer = new ResizeObserver(() => {
			size.width = el.offsetWidth;
			size.height = el.offsetHeight;
			write();
		});
		observer.observe(el);

		engine = { aim, release, write };

		if (intro && !reduced) {
			x.p = 0.62;
			y.p = -0.55;
			light.p = 1;
			slowUntil = performance.now() + 1400;
			write();
			wake();
		} else {
			write();
		}

		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('pointerdown', onDown);
			el.removeEventListener('pointerup', onUp);
			el.removeEventListener('pointercancel', onUp);
			engine = null;
		};
	});

	$effect(() => {
		void enableTilt;
		void tiltStrength;
		void parallax;
		engine?.write();
	});

	$effect(() => {
		const el = root;
		if (!el || !enableMobileTilt) return;

		let listening = false;
		const onOrientation = (event: DeviceOrientationEvent) => {
			if (event.beta == null || event.gamma == null) return;
			const sensitivity = mobileTiltSensitivity;
			engine?.aim((event.gamma * sensitivity) / 150, ((event.beta - 20) * sensitivity) / 150);
		};
		const listen = () => {
			if (listening) return;
			listening = true;
			window.addEventListener('deviceorientation', onOrientation);
		};
		const onClick = () => {
			const Motion = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined;
			if (Motion && typeof Motion.requestPermission === 'function') {
				Motion.requestPermission()
					.then((state) => {
						if (state === 'granted') listen();
					})
					.catch(() => {});
			} else {
				listen();
			}
		};

		el.addEventListener('click', onClick);
		return () => {
			el.removeEventListener('click', onClick);
			window.removeEventListener('deviceorientation', onOrientation);
		};
	});
</script>

<div
	bind:this={root}
	class={`${ROOT} ${className}`.trim()}
	style={ROOT_VARS}
	style:--pc-frame={themeVars['--pc-frame']}
	style:--pc-frame-edge={themeVars['--pc-frame-edge']}
	style:--pc-frame-highlight={themeVars['--pc-frame-highlight']}
	style:--pc-frame-shadow={themeVars['--pc-frame-shadow']}
	style:--pc-tile={themeVars['--pc-tile']}
	style:--pc-tile-edge={themeVars['--pc-tile-edge']}
	style:--pc-tile-highlight={themeVars['--pc-tile-highlight']}
	style:--pc-tile-shadow={themeVars['--pc-tile-shadow']}
	style:--pc-ink={themeVars['--pc-ink']}
	style:--pc-muted={themeVars['--pc-muted']}
	style:--pc-hover={themeVars['--pc-hover']}
	style:--pc-press={themeVars['--pc-press']}
	style:--pc-shade={themeVars['--pc-shade']}
	style:--pc-blend={foilVars['--pc-blend']}
	style:--pc-holo-filter={foilVars['--pc-holo-filter']}
	style:--pc-sheen={foilVars['--pc-sheen']}
	style:--pc-radius={`${Math.max(0, radius)}px`}
	style:--pc-backdrop={backdrop}
	style:--pc-holo={clamp(holo, 0, 1)}
	style:--pc-glare={clamp(glare, 0, 1)}
	style:--pc-parallax={`${Math.max(0, parallax)}px`}
	style:--pc-status={statusColor}
	style:--pc-grain={GRAIN}
	style:--pc-pattern={iconUrl ? `url("${iconUrl}")` : 'linear-gradient(#000, #000)'}
	style:--pc-pattern-size={iconUrl ? '180% auto' : '100% 100%'}
	style:--pc-holo-gain={iconUrl ? 1.25 : 0.75}
	style:--pc-holo-detail={iconUrl && foil === 'dark' ? 1 : 0}
>
	<div class={BODY}>
		<div class={TILE}>
			<span class={LAYER} style={SHEEN_STYLE}></span>
			<span class={HOLO} style={HOLO_STYLE}>
				<span class={HOLO_LAYER} style={GLOW_STYLE}></span>
				<span class={HOLO_LAYER} style={SHIFT_STYLE}></span>
			</span>
			{#if avatarUrl}
				<img class={PHOTO} style={PHOTO_STYLE} src={avatarUrl} alt={name || ''} loading="lazy" draggable="false" />
			{/if}
			{#if name || title}
				<span class={LAYER} style={SCRIM_STYLE}></span>
				<div class={INFO}>
					{#if name}<h3 class={NAME}>{name}</h3>{/if}
					{#if title}<p class={TITLE}>{title}</p>{/if}
				</div>
			{/if}
			<span class={TILE_RIM}></span>
		</div>

		{#if showUserInfo}
			<div class={FOOTER}>
				{#if miniAvatarUrl}
					<span class={AVATAR}>
						<img class={AVATAR_IMAGE} src={miniAvatarUrl} alt="" loading="lazy" draggable="false" />
					</span>
				{/if}
				<div class={META}>
					{#if handle}<span class={HANDLE}>@{handle}</span>{/if}
					{#if status}<span class={STATUS}>{status}</span>{/if}
				</div>
				{#if contactText}
					<button
						type="button"
						class={CONTACT}
						onclick={() => onContactClick?.()}
						aria-label={name ? `${contactText} ${name}` : contactText}
					>
						<HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />
						{contactText}
					</button>
				{/if}
			</div>
		{/if}

		<span class={GLARE} style={GLARE_STYLE}></span>
		<span class={LAYER} style={SHADE_STYLE}></span>
		<span class={RIM}></span>
	</div>
</div>
