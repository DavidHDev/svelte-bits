<!-- @svelte-bits
{
  "title": "Variable Proximity",
  "description": "Letter styling changes continuously with pointer distance mapping.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type Falloff = 'linear' | 'exponential' | 'gaussian';

	const FONT_URL = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap';

	const GAUSSIAN_EDGE = Math.exp(-2);
	const WAVE_PERIOD = 3.2;
	const WAVE_PEAK = 0.7;

	const parseSettings = (settings: string) =>
		new Map(
			settings
				.split(',')
				.map((part) => part.trim())
				.filter(Boolean)
				.map((part) => {
					const [name, value] = part.split(/\s+/);
					return [name.replace(/['"]/g, ''), parseFloat(value)] as [string, number];
				})
		);

	const strengthAt = (distance: number, radius: number, falloff: Falloff) => {
		if (distance >= radius) return 0;
		const norm = 1 - distance / radius;
		switch (falloff) {
			case 'exponential':
				return norm * norm;
			case 'gaussian':
				return (Math.exp(-2 * (distance / radius) ** 2) - GAUSSIAN_EDGE) / (1 - GAUSSIAN_EDGE);
			case 'linear':
			default:
				return norm;
		}
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'class'> {
		label?: string;
		fromFontVariationSettings?: string;
		toFontVariationSettings?: string;
		containerRef?: HTMLElement | null;
		radius?: number;
		falloff?: Falloff;
		smoothing?: number;
		fromColor?: string;
		toColor?: string;
		scale?: number;
		lift?: number;
		idleWave?: boolean;
		fontSize?: number | string;
		class?: string;
		style?: string;
	}

	let {
		label = '',
		fromFontVariationSettings = "'wght' 400, 'opsz' 9",
		toFontVariationSettings = "'wght' 1000, 'opsz' 40",
		containerRef = null,
		radius = 50,
		falloff = 'linear',
		smoothing = 0.2,
		fromColor,
		toColor,
		scale = 1,
		lift = 0,
		idleWave = false,
		fontSize,
		class: className = '',
		style = '',
		...restProps
	}: Props = $props();

	let rootEl: HTMLSpanElement | undefined = $state();
	let lineStarts = $state<string | null>(null);
	const letterRefs: (HTMLSpanElement | null)[] = [];
	const proximity = {
		pointer: { x: 0, y: 0, active: false },
		levels: [] as number[],
		targets: [] as number[]
	};

	const letterRef = (node: HTMLSpanElement, index: number) => {
		let current = index;
		letterRefs[current] = node;
		return {
			update(next: number) {
				if (letterRefs[current] === node) letterRefs[current] = null;
				current = next;
				letterRefs[current] = node;
			},
			destroy() {
				if (letterRefs[current] === node) letterRefs[current] = null;
			}
		};
	};

	const axes = $derived.by(() => {
		const fromSettings = parseSettings(fromFontVariationSettings);
		const toSettings = parseSettings(toFontVariationSettings);
		return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
			axis,
			fromValue,
			toValue: toSettings.get(axis) ?? fromValue
		}));
	});

	const wordList = $derived.by(() => {
		let letterIndex = 0;
		return label.split(' ').map((word) => word.split('').map((char) => ({ char, index: letterIndex++ })));
	});

	const breakSet = $derived(new Set(lineStarts ? lineStarts.split(',').map(Number) : []));

	const rootStyle = $derived(
		[
			'display: inline',
			'font-family: "Roboto Flex", sans-serif',
			fontSize !== undefined ? `font-size: ${typeof fontSize === 'number' ? `${fontSize}px` : fontSize}` : '',
			lineStarts !== null ? 'white-space: nowrap' : '',
			style
		]
			.filter(Boolean)
			.join('; ')
	);

	$effect(() => {
		const root = rootEl;
		const fromSettingsValue = fromFontVariationSettings;
		void label;
		void fontSize;
		if (!root) return;
		let frame = 0;
		let live = true;
		let lastWidth = -1;

		const measure = () => {
			frame = 0;
			if (!live) return;
			const words = Array.from(root.querySelectorAll<HTMLElement>('[data-word]'));
			const breaks = Array.from(root.querySelectorAll<HTMLElement>('br'));
			const letters = letterRefs.filter((letter): letter is HTMLSpanElement => Boolean(letter));
			const saved = letters.map((letter) => letter.style.fontVariationSettings);
			const wrap = root.style.whiteSpace;
			root.style.whiteSpace = 'normal';
			breaks.forEach((node) => (node.style.display = 'none'));
			letters.forEach((letter) => (letter.style.fontVariationSettings = fromSettingsValue));
			const starts: number[] = [];
			let lastTop: number | null = null;
			words.forEach((word, index) => {
				const top = word.getBoundingClientRect().top;
				if (lastTop !== null && top > lastTop + 2) starts.push(index);
				lastTop = top;
			});
			letters.forEach((letter, index) => (letter.style.fontVariationSettings = saved[index]));
			breaks.forEach((node) => (node.style.display = ''));
			root.style.whiteSpace = wrap;
			lineStarts = starts.join(',');
		};

		const queue = (entries?: ResizeObserverEntry[]) => {
			const width = entries?.[0]?.contentRect.width;
			if (width !== undefined) {
				if (Math.abs(width - lastWidth) < 1) return;
				lastWidth = width;
			}
			if (!frame) frame = requestAnimationFrame(measure);
		};

		measure();
		const parent = root.parentElement;
		const observer = parent && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(queue) : null;
		if (parent) observer?.observe(parent);
		document.fonts?.ready.then(() => queue());

		return () => {
			live = false;
			cancelAnimationFrame(frame);
			observer?.disconnect();
		};
	});

	$effect(() => {
		const currentAxes = axes;
		const restSettings = fromFontVariationSettings;
		const area = containerRef;
		const reach = radius;
		const curve = falloff;
		const ease = smoothing;
		const restTint = fromColor;
		const nearTint = toColor;
		const grow = scale;
		const raise = lift;
		const wave = idleWave;
		void fontSize;
		void label;
		void lineStarts;

		const { pointer, levels, targets } = proximity;
		const written: string[] = [];
		const painted: string[] = [];
		const moved: string[] = [];
		const anchors: { x: number; y: number }[] = [];
		const tinted = Boolean(restTint || nearTint);
		const restColor = restTint || 'currentColor';
		const nearColor = nearTint || 'currentColor';
		const growth = (Number(grow) || 1) - 1;
		const rise = Number(raise) || 0;
		const transformed = growth !== 0 || rise !== 0;
		const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const waving = wave && !reduced;
		let frame = 0;
		let lastTime = 0;
		let dirty = true;
		let layoutDirty = true;
		let nearAny = false;
		let lastNear = -Infinity;
		let waveMix = 0;
		let span = 1;
		let visible = true;

		letterRefs.forEach((letter) => {
			if (!letter) return;
			if (!tinted) letter.style.color = '';
			if (!transformed) letter.style.transform = '';
		});

		const settingsAt = (level: number) =>
			currentAxes
				.map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * level}`)
				.join(', ');

		const measureAnchors = () => {
			let left = Infinity;
			let top = Infinity;
			let right = -Infinity;
			letterRefs.forEach((letter, index) => {
				if (!letter) return;
				const rect = letter.getBoundingClientRect();
				anchors[index] = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
				left = Math.min(left, rect.left);
				top = Math.min(top, rect.top);
				right = Math.max(right, rect.right);
			});
			anchors.forEach((anchor) => {
				anchor.x -= left;
				anchor.y -= top;
			});
			span = Math.max(220, (right - left) * 0.85);
		};

		const measure = () => {
			targets.length = letterRefs.length;
			targets.fill(0);
			nearAny = false;
			if (!pointer.active) return;

			const bounds = area?.getBoundingClientRect();
			if (bounds) {
				const dx = Math.max(bounds.left - pointer.x, 0, pointer.x - bounds.right);
				const dy = Math.max(bounds.top - pointer.y, 0, pointer.y - bounds.bottom);
				if (dx * dx + dy * dy >= reach * reach) return;
			}

			letterRefs.forEach((letter, index) => {
				if (!letter) return;
				const rect = letter.getBoundingClientRect();
				const distance = Math.hypot(pointer.x - (rect.left + rect.width / 2), pointer.y - (rect.top + rect.height / 2));
				targets[index] = strengthAt(distance, reach, curve);
				if (targets[index] > 0) nearAny = true;
			});
		};

		const waveAt = (index: number, time: number) => {
			const anchor = anchors[index];
			if (!anchor) return 0;
			const phase = ((anchor.x + anchor.y * 0.6) / span - time / WAVE_PERIOD) * Math.PI * 2;
			return WAVE_PEAK * ((1 + Math.cos(phase)) / 2) ** 2.2;
		};

		const tick = (now: number) => {
			frame = 0;
			const delta = lastTime ? Math.min(now - lastTime, 64) : 16;
			lastTime = now;

			if (dirty) {
				measure();
				dirty = false;
			}
			if (waving && layoutDirty) {
				measureAnchors();
				layoutDirty = false;
			}

			if (nearAny) lastNear = now;
			const idle = waving && visible && !nearAny && now - lastNear > 500;
			const goal = idle ? 1 : 0;
			waveMix += (goal - waveMix) * (1 - Math.exp(-delta / 600));
			if (Math.abs(goal - waveMix) < 0.002) waveMix = goal;

			const step = ease > 0 ? 1 - Math.exp(-delta / (ease * 400)) : 1;
			const time = now / 1000;
			let settling = false;

			letterRefs.forEach((letter, index) => {
				if (!letter) return;
				let target = targets[index] ?? 0;
				if (waveMix > 0) target = Math.max(target, waveMix * waveAt(index, time));
				const current = levels[index] ?? 0;
				let next = current + (target - current) * step;
				if (Math.abs(target - next) < 0.002) {
					next = target;
				} else {
					settling = true;
				}
				levels[index] = next;

				const settings = next === 0 ? restSettings : settingsAt(next);
				if (written[index] !== settings) {
					written[index] = settings;
					letter.style.fontVariationSettings = settings;
				}

				if (tinted) {
					const paint =
						next === 0
							? restTint || ''
							: `color-mix(in oklab, ${restColor} ${((1 - next) * 100).toFixed(1)}%, ${nearColor})`;
					if (painted[index] !== paint) {
						painted[index] = paint;
						letter.style.color = paint;
					}
				}

				if (transformed) {
					const shift =
						next === 0 ? '' : `translateY(${(-rise * next).toFixed(3)}em) scale(${(1 + growth * next).toFixed(3)})`;
					if (moved[index] !== shift) {
						moved[index] = shift;
						letter.style.transform = shift;
					}
				}
			});

			if (settling || waveMix > 0 || (waving && visible && !nearAny)) {
				frame = requestAnimationFrame(tick);
			} else {
				lastTime = 0;
			}
		};

		const schedule = () => {
			dirty = true;
			if (!frame) frame = requestAnimationFrame(tick);
		};

		const relayout = () => {
			layoutDirty = true;
			schedule();
		};

		const handleMove = (x: number, y: number) => {
			pointer.x = x;
			pointer.y = y;
			pointer.active = true;
			schedule();
		};

		const handleMouseMove = (event: MouseEvent) => handleMove(event.clientX, event.clientY);
		const handleTouchMove = (event: TouchEvent) => {
			const touch = event.touches[0];
			if (touch) handleMove(touch.clientX, touch.clientY);
		};
		const handleLeave = () => {
			pointer.active = false;
			schedule();
		};

		const doc = document.documentElement;
		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: true });
		window.addEventListener('touchend', handleLeave);
		window.addEventListener('touchcancel', handleLeave);
		window.addEventListener('scroll', schedule, { capture: true, passive: true });
		window.addEventListener('resize', relayout);
		doc.addEventListener('mouseleave', handleLeave);

		let observer: IntersectionObserver | null = null;
		const root = rootEl;
		if (waving && root && 'IntersectionObserver' in window) {
			observer = new IntersectionObserver((entries) => {
				visible = entries.some((entry) => entry.isIntersecting);
				schedule();
			});
			observer.observe(root);
		}
		if (waving) document.fonts?.ready.then(relayout);

		schedule();

		return () => {
			cancelAnimationFrame(frame);
			observer?.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleLeave);
			window.removeEventListener('touchcancel', handleLeave);
			window.removeEventListener('scroll', schedule, { capture: true });
			window.removeEventListener('resize', relayout);
			doc.removeEventListener('mouseleave', handleLeave);
		};
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={FONT_URL} />
</svelte:head>

<span bind:this={rootEl} class={className} style={rootStyle} {...restProps}
	>{#each wordList as word, wordIndex (wordIndex)}{#if breakSet.has(wordIndex)}<br />{/if}<span
			data-word=""
			class="inline-block whitespace-nowrap"
			>{#each word as item (item.index)}<span
					use:letterRef={item.index}
					style:display="inline-block"
					style:font-variation-settings={fromFontVariationSettings}
					style:color={fromColor || undefined}
					style:transform-origin="50% 80%"
					aria-hidden="true">{item.char}</span
				>{/each}{#if wordIndex < wordList.length - 1}<span class="inline-block">&nbsp;</span>{/if}</span
		>{/each}<span class="sr-only">{label}</span></span
>
