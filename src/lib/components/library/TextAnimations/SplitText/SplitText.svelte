<!-- @svelte-bits
{
  "title": "Split Text",
  "description": "Splits text into characters / words for staggered entrance animation.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { SplitText as GSAPSplitText } from 'gsap/SplitText';

	gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

	export type SplitTextEffect = 'rise' | 'fade' | 'blur' | 'flip' | 'pop' | 'skew' | 'wave';

	export interface SplitTextProps {
		text: string;
		class?: string;
		delay?: number;
		duration?: number;
		ease?: string | ((t: number) => number);
		splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
		from?: gsap.TweenVars;
		to?: gsap.TweenVars;
		threshold?: number;
		rootMargin?: string;
		tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
		textAlign?: string;
		staggerFrom?: 'start' | 'center' | 'end' | 'edges' | 'random';
		mask?: boolean;
		effect?: SplitTextEffect;
		trigger?: 'view' | 'load' | 'hover' | 'click';
		loop?: boolean;
		loopDelay?: number;
		hoverEffect?: 'none' | 'lift' | 'wave';
		color?: string;
		accentColor?: string;
		onLetterAnimationComplete?: () => void;
	}

	type Look = { from: gsap.TweenVars; to: gsap.TweenVars; ease: string | ((t: number) => number) };
	type Spring = { y: number; v: number };
	type Kick = { index: number; velocity: number; at: number };

	const DEFAULT_FROM = { opacity: 0, y: 40 };
	const DEFAULT_TO = { opacity: 1, y: 0 };
	const STIFFNESS = 180;
	const DAMPING = 19;
	const KICK = 0.024;

	const fontsAreLoaded = (): boolean =>
		typeof document !== 'undefined' && (!document.fonts || document.fonts.status === 'loaded');

	const waveEase = (t: number) => 1 - Math.cos(t * Math.PI * 1.5) * Math.pow(1 - t, 1.2);

	const getEffect = (effect: SplitTextEffect, em: number): Look => {
		switch (effect) {
			case 'fade':
				return { from: { opacity: 0 }, to: { opacity: 1 }, ease: 'power2.inOut' };
			case 'blur':
				return {
					from: { opacity: 0, filter: `blur(${Math.round(em * 1.4) / 10}px)` },
					to: { opacity: 1, filter: 'blur(0px)' },
					ease: 'power2.out'
				};
			case 'flip': {
				const setup = { transformPerspective: em * 6, transformOrigin: '50% 100%' };
				return {
					from: { ...setup, opacity: 0, rotationX: -90 },
					to: { ...setup, opacity: 1, rotationX: 0 },
					ease: 'power3.out'
				};
			}
			case 'pop':
				return { from: { opacity: 0, scale: 0 }, to: { opacity: 1, scale: 1 }, ease: 'back.out(1.6)' };
			case 'skew':
				return {
					from: { transformOrigin: '50% 100%', opacity: 0, x: -em * 0.4, skewX: -24 },
					to: { transformOrigin: '50% 100%', opacity: 1, x: 0, skewX: 0 },
					ease: 'expo.out'
				};
			case 'wave':
				return { from: { opacity: 0, y: em * 0.45 }, to: { opacity: 1, y: 0 }, ease: waveEase };
			default:
				return { from: { ...DEFAULT_FROM }, to: { ...DEFAULT_TO }, ease: 'power3.out' };
		}
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		text,
		class: className = '',
		delay = 50,
		duration = 1.25,
		ease,
		splitType = 'chars',
		from,
		to,
		threshold = 0.1,
		rootMargin = '-100px',
		textAlign = 'center',
		tag = 'p',
		staggerFrom = 'start',
		mask = false,
		effect: effectName = 'rise',
		trigger = 'view',
		loop = false,
		loopDelay = 1.5,
		hoverEffect = 'none',
		color,
		accentColor,
		onLetterAnimationComplete
	}: SplitTextProps = $props();

	let el = $state<HTMLElement | null>(null);
	let fontsLoaded = $state(fontsAreLoaded());
	let ready = $state(false);
	let completedText: string | null = null;

	$effect(() => {
		if (fontsLoaded) return;
		let active = true;
		document.fonts.ready.then(() => {
			if (active) fontsLoaded = true;
		});
		return () => {
			active = false;
		};
	});

	const setup = (
		node: HTMLElement,
		opts: {
			text: string;
			delay: number;
			duration: number;
			ease: SplitTextProps['ease'];
			splitType: NonNullable<SplitTextProps['splitType']>;
			from: SplitTextProps['from'];
			to: SplitTextProps['to'];
			threshold: number;
			rootMargin: string;
			staggerFrom: NonNullable<SplitTextProps['staggerFrom']>;
			mask: boolean;
			effectName: SplitTextEffect;
			trigger: NonNullable<SplitTextProps['trigger']>;
			loop: boolean;
			loopDelay: number;
		}
	) => {
		const {
			text,
			delay,
			duration,
			ease,
			splitType,
			from,
			to,
			threshold,
			rootMargin,
			staggerFrom,
			mask,
			effectName,
			trigger,
			loop,
			loopDelay
		} = opts;
		node.normalize();
		node.getBoundingClientRect();
		if (!fontsAreLoaded()) {
			fontsLoaded = false;
			return;
		}

		const finish = () => {
			if (completedText === text) return;
			completedText = text;
			onLetterAnimationComplete?.();
		};

		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			ready = true;
			finish();
			return;
		}

		const startPct = (1 - threshold) * 100;
		const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
		const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
		const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
		const sign =
			marginValue === 0
				? ''
				: marginValue < 0
					? `-=${Math.abs(marginValue)}${marginUnit}`
					: `+=${marginValue}${marginUnit}`;
		const start = `top ${startPct}%${sign}`;
		const unit: 'chars' | 'words' | 'lines' = splitType.includes('chars')
			? 'chars'
			: splitType.includes('words')
				? 'words'
				: 'lines';

		const em = parseFloat(getComputedStyle(node).fontSize) || 16;
		const custom = from !== undefined || to !== undefined;
		const look = getEffect(effectName, em);
		const fromVars: gsap.TweenVars = custom ? { ...(from || DEFAULT_FROM) } : look.from;
		const toVars: gsap.TweenVars = custom ? { ...(to || DEFAULT_TO) } : look.to;
		const easing = ease || (custom ? 'power3.out' : look.ease);
		const settle = custom ? 'willChange' : 'transform,filter,willChange';
		const exit = Math.max(0.35, duration * 0.55);

		let pieces: Element[] = [];
		let movers: HTMLElement[] = [];
		let order = gsap.utils.distribute({ each: delay / 1000, from: staggerFrom });
		let revealed = completedText === text;
		let intro: gsap.core.Timeline | null = null;
		let busy: gsap.core.Timeline | null = null;
		let queued: gsap.core.Tween | null = null;
		let raf = 0;
		let last = 0;
		let centers: { x: number; y: number }[] | null = null;
		const lift = em * 0.2;
		const springs: Spring[] = [];
		const kicks: Kick[] = [];
		const pointer = { x: 0, y: 0, inside: false };

		const reveal = (initial: boolean, vars?: gsap.TimelineVars) => {
			const accent = accentColor;
			const tl = gsap.timeline(vars);
			tl.fromTo(
				pieces,
				{ ...fromVars, willChange: 'transform, opacity' },
				{ ...toVars, duration, ease: easing, stagger: order, immediateRender: initial },
				0
			);
			if (accent) {
				tl.fromTo(
					pieces,
					{ color: accent },
					{
						color: getComputedStyle(node).color,
						duration: duration * 0.7,
						ease: 'power1.inOut',
						stagger: order,
						immediateRender: initial
					},
					duration * 0.3
				);
			}
			tl.set(pieces, { clearProps: accent ? `${settle},color` : settle });
			return tl;
		};

		const conceal = () => {
			const accent = accentColor;
			const tl = gsap.timeline();
			tl.fromTo(
				pieces,
				{ ...toVars, willChange: 'transform, opacity' },
				{ ...fromVars, duration: exit, ease: 'power2.in', stagger: order, immediateRender: false },
				0
			);
			if (accent) tl.to(pieces, { color: accent, duration: exit, ease: 'power1.in', stagger: order }, 0);
			return tl;
		};

		const cycle = () => {
			if (busy || !revealed || !pieces.length) return;
			queued?.kill();
			queued = null;
			busy = gsap
				.timeline({
					onComplete: () => {
						busy = null;
						queue();
					}
				})
				.add(conceal(), 0)
				.add(reveal(false), exit);
		};

		const queue = () => {
			queued?.kill();
			queued = loop ? gsap.delayedCall(loopDelay, cycle) : null;
		};

		const measure = () => {
			const box = node.getBoundingClientRect();
			centers = movers.map((item, i) => {
				const rect = item.getBoundingClientRect();
				return {
					x: rect.left + rect.width / 2 - box.left,
					y: rect.top + rect.height / 2 - box.top - (springs[i]?.y || 0)
				};
			});
		};

		const tick = (now: number) => {
			raf = 0;
			const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
			last = now;
			const spots = hoverEffect === 'lift' && pointer.inside && revealed ? centers : null;
			const radius = em * 1.15;
			let moving = false;
			for (let k = kicks.length - 1; k >= 0; k--) {
				if (now < kicks[k].at) continue;
				const spring = springs[kicks[k].index];
				if (spring) spring.v -= kicks[k].velocity;
				kicks.splice(k, 1);
			}
			movers.forEach((item, i) => {
				const spring = springs[i] || (springs[i] = { y: 0, v: 0 });
				const spot = spots?.[i];
				let target = 0;
				if (spot) {
					const dx = (spot.x - pointer.x) / radius;
					const dy = (spot.y - pointer.y) / (radius * 1.4);
					target = -lift * Math.exp(-(dx * dx + dy * dy) * 0.5);
				}
				spring.v += (STIFFNESS * (target - spring.y) - DAMPING * spring.v) * dt;
				spring.y += spring.v * dt;
				if (Math.abs(target - spring.y) < 0.02 && Math.abs(spring.v) < 0.05) {
					spring.y = target;
					spring.v = 0;
				} else {
					moving = true;
				}
				item.style.translate = Math.abs(spring.y) > 0.01 ? `0 ${spring.y.toFixed(2)}px` : '';
			});
			if (moving || kicks.length) raf = requestAnimationFrame(tick);
		};

		const wake = () => {
			if (raf) return;
			last = performance.now();
			raf = requestAnimationFrame(tick);
		};

		const locate = (e: PointerEvent) => {
			const box = node.getBoundingClientRect();
			pointer.x = e.clientX - box.left;
			pointer.y = e.clientY - box.top;
		};

		const onEnter = (e: PointerEvent) => {
			locate(e);
			pointer.inside = true;
			if (!revealed) return;
			if (trigger === 'hover') cycle();
			if (hoverEffect === 'none') return;
			measure();
			if (hoverEffect === 'wave') {
				const now = performance.now();
				const speed = em * 9;
				const velocity = (em * 0.16) / KICK;
				centers?.forEach((center, index) => {
					kicks.push({ index, velocity, at: now + (Math.abs(center.x - pointer.x) / speed) * 1000 });
				});
			}
			wake();
		};

		const onMove = (e: PointerEvent) => {
			locate(e);
			pointer.inside = true;
			if (!revealed || hoverEffect !== 'lift') return;
			if (!centers) measure();
			wake();
		};

		const onLeave = () => {
			pointer.inside = false;
			wake();
		};

		const onClick = () => {
			if (trigger === 'click') cycle();
		};

		const splitInstance = new GSAPSplitText(node, {
			type: splitType,
			smartWrap: true,
			autoSplit: splitType === 'lines',
			mask: mask ? unit : undefined,
			linesClass: 'split-line',
			wordsClass: 'split-word',
			charsClass: 'split-char',
			reduceWhiteSpace: false,
			onSplit: (self: GSAPSplitText) => {
				pieces = [self[unit], self.chars, self.words, self.lines].find((list) => list.length) || [];
				movers = (mask && self.masks?.length === pieces.length ? self.masks : pieces) as HTMLElement[];
				order = gsap.utils.distribute({ each: delay / 1000, from: staggerFrom });
				centers = null;
				springs.length = 0;
				kicks.length = 0;
				if (busy && busy !== intro) {
					busy.kill();
					busy = null;
				}
				if (revealed) return undefined;
				intro = reveal(true, {
					scrollTrigger:
						trigger === 'load'
							? undefined
							: { trigger: node, start, once: true, fastScrollEnd: true, anticipatePin: 0.4 },
					onComplete: () => {
						revealed = true;
						intro = null;
						busy = null;
						finish();
						queue();
					}
				});
				busy = intro;
				return intro;
			}
		});
		ready = true;
		if (revealed) queue();

		node.addEventListener('pointerenter', onEnter);
		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerleave', onLeave);
		node.addEventListener('click', onClick);

		return () => {
			cancelAnimationFrame(raf);
			queued?.kill();
			busy?.kill();
			node.removeEventListener('pointerenter', onEnter);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			node.removeEventListener('click', onClick);
			movers.forEach((item) => {
				item.style.translate = '';
			});
			ScrollTrigger.getAll().forEach((st) => {
				if (st.trigger === node) st.kill();
			});
			splitInstance.revert();
		};
	};

	const fromKey = $derived(JSON.stringify(from));
	const toKey = $derived(JSON.stringify(to));

	$effect(() => {
		const node = el;
		const opts = {
			text,
			delay,
			duration,
			ease,
			splitType,
			from: fromKey === undefined ? undefined : untrack(() => from),
			to: toKey === undefined ? undefined : untrack(() => to),
			threshold,
			rootMargin,
			staggerFrom,
			mask,
			effectName,
			trigger,
			loop,
			loopDelay
		};
		const loaded = fontsLoaded;
		if (!node || !text || !loaded) return;
		const ctx = untrack(() => gsap.context(() => setup(node, opts), node));
		return () => ctx.revert();
	});

	const clip = $derived(
		hoverEffect === 'none' && (from !== undefined || to !== undefined || effectName === 'rise' || effectName === 'fade')
	);
	const classes = $derived(
		`split-parent inline-block whitespace-normal ${clip ? 'overflow-hidden' : 'overflow-visible'} ${trigger === 'click' ? 'cursor-pointer' : ''} ${className}`
	);
</script>

{#key text}
	<svelte:element
		this={tag || 'p'}
		bind:this={el}
		class={classes}
		style:text-align={textAlign}
		style:word-wrap="break-word"
		style:color
		style:visibility={ready ? undefined : 'hidden'}
	>
		{text}
	</svelte:element>
{/key}
