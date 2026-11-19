<!-- @svelte-bits
{
  "title": "Scrambled Text",
  "description": "Detects cursor position and applies a distortion effect to text.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';
	import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

	gsap.registerPlugin(SplitText, ScrambleTextPlugin);

	type CSSProperties = Record<string, string | number | undefined | null>;

	type ScrambleEffect = 'scramble' | 'lift' | 'blur' | 'magnify';

	export interface ScrambledTextProps {
		radius?: number;
		duration?: number;
		speed?: number;
		scrambleChars?: string;
		scrambleColor?: string;
		effect?: ScrambleEffect;
		strength?: number;
		trail?: number;
		clickBurst?: boolean;
		intro?: boolean;
		fontFamily?: string;
		color?: string;
		className?: string;
		style?: CSSProperties;
		children?: import('svelte').Snippet;
	}

	interface CharPoint {
		x: number;
		y: number;
		energy: number;
		dx: number;
		dy: number;
		shown: boolean;
	}

	interface Wave {
		x: number;
		y: number;
		age: number;
		r: number;
		fade: number;
		reach: number;
		life: number;
		hit: Uint8Array;
	}

	const PHYSICAL: Record<string, boolean> = { lift: true, blur: true, magnify: true };

	const falloff = (distance: number, radius: number): number => {
		if (distance >= radius) return 0;
		const f = 1 - (distance / radius) ** 2;
		return f * f;
	};

	const UNITLESS = /^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio)$/;

	const css = (value: CSSProperties | undefined) =>
		Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([key, v]) => {
				const name = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return `${name}:${typeof v === 'number' && !UNITLESS.test(key) ? `${v}px` : v}`;
			})
			.join(';');
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		radius = 100,
		duration = 1.2,
		speed = 0.5,
		scrambleChars = '.:',
		scrambleColor = '',
		effect: effectMode = 'scramble',
		strength = 1,
		trail = 0.6,
		clickBurst = true,
		intro = true,
		fontFamily = '',
		color = '',
		className = '',
		style = {},
		children
	}: ScrambledTextProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let textEl = $state<HTMLParagraphElement | null>(null);
	let srEl = $state<HTMLSpanElement | null>(null);
	let textKey = $state<string | null>(null);
	let fontsReady = $state(typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded');
	let resetEffect: () => void = () => {};

	const rootStyle = $derived(
		css({ ...style, ...(color ? { color } : null), ...(fontFamily ? { fontFamily } : null) }) || undefined
	);

	$effect(() => {
		if (fontsReady) return;
		let live = true;
		document.fonts.ready
			.then(() => {
				if (live) fontsReady = true;
			})
			.catch(() => {
				if (live) fontsReady = true;
			});
		return () => {
			live = false;
		};
	});

	$effect(() => {
		const sr = srEl;
		if (!sr) return;
		const watcher = new MutationObserver(() => {
			const next = sr.textContent ?? '';
			if (next !== untrack(() => textKey)) textKey = next;
		});
		watcher.observe(sr, { childList: true, characterData: true, subtree: true });
		return () => watcher.disconnect();
	});

	$effect(() => {
		const root = rootEl;
		const target = textEl;
		const ready = fontsReady;
		const playIntro = intro;
		void textKey;
		if (!root || !target || !ready) return;

		return untrack(() => {
			const split = SplitText.create(target, { type: 'chars', smartWrap: true, aria: 'none' });
			const chars = split.chars as HTMLElement[];
			const originals = chars.map((char) => char.textContent ?? '');
			const glyphs = chars.map((char, i) => {
				const sizer = document.createElement('span');
				const glyph = document.createElement('span');
				sizer.textContent = originals[i];
				sizer.style.visibility = 'hidden';
				glyph.textContent = originals[i];
				glyph.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);white-space:pre';
				char.replaceChildren(sizer, glyph);
				return glyph;
			});
			const points: CharPoint[] = chars.map(() => ({ x: 0, y: 0, energy: 0, dx: 0, dy: 0, shown: false }));
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false };
			const waves: Wave[] = [];
			let measured = false;
			let fontPx = 16;
			let raf = 0;
			let last = 0;
			let moveFrame = 0;
			let decode: gsap.core.Timeline | null = null;
			let observer: IntersectionObserver | null = null;

			const scramble = (index: number, length: number, revealDelay = 0): gsap.TweenVars => {
				const glyph = glyphs[index];
				const charSet = scrambleChars;
				const flickerSpeed = speed;
				const tint = scrambleColor;
				return {
					overwrite: true,
					duration: length,
					ease: 'none',
					scrambleText: { text: originals[index], chars: charSet, speed: flickerSpeed, revealDelay },
					onUpdate: () => {
						glyph.style.color = tint && glyph.textContent !== originals[index] ? tint : '';
					}
				};
			};

			if (playIntro && !reduce) {
				const introLength = duration;
				const timeline = gsap.timeline({ paused: true });
				glyphs.forEach((glyph, index) => {
					const reveal = 0.15 + introLength * (0.75 * (index / glyphs.length) + 0.25 * Math.random());
					timeline.to(glyph, scramble(index, reveal + 0.1, reveal), 0);
				});
				timeline.time(0.001);
				const io = new IntersectionObserver(
					([entry]) => {
						if (!entry.isIntersecting) return;
						io.disconnect();
						timeline.play();
					},
					{ rootMargin: '0px 0px -10% 0px' }
				);
				io.observe(root);
				decode = timeline;
				observer = io;
			}

			const offsetOf = (el: HTMLElement): [number, number] => {
				let x = 0;
				let y = 0;
				for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
					x += node.offsetLeft;
					y += node.offsetTop;
				}
				return [x, y];
			};

			const measure = () => {
				fontPx = parseFloat(window.getComputedStyle(target).fontSize) || 16;
				const [rootX, rootY] = offsetOf(root);
				chars.forEach((char, i) => {
					const [x, y] = offsetOf(char);
					points[i].x = x - rootX + char.offsetWidth / 2;
					points[i].y = y - rootY + char.offsetHeight / 2;
				});
				measured = true;
			};

			const toLocal = (e: PointerEvent): [number, number] => {
				const rect = root.getBoundingClientRect();
				const scaleX = root.offsetWidth ? rect.width / root.offsetWidth : 1;
				const scaleY = root.offsetHeight ? rect.height / root.offsetHeight : 1;
				return [(e.clientX - rect.left) / (scaleX || 1), (e.clientY - rect.top) / (scaleY || 1)];
			};

			const clear = (i: number) => {
				const char = chars[i];
				char.style.transform = '';
				char.style.filter = '';
				char.style.opacity = '';
				char.style.zIndex = '';
				points[i].shown = false;
			};

			const paint = (i: number, mode: string, amount: number) => {
				const p = points[i];
				const e = p.energy;
				if (e < 0.001) {
					if (p.shown) clear(i);
					return;
				}
				const char = chars[i];
				p.shown = true;
				if (mode === 'lift') {
					char.style.transform = `translate3d(0, ${(-e * fontPx * 0.75 * amount).toFixed(2)}px, 0)`;
				} else if (mode === 'blur') {
					char.style.filter = `blur(${(e * fontPx * 0.24 * amount).toFixed(2)}px)`;
					char.style.opacity = (1 - e * Math.min(0.7, 0.45 * amount)).toFixed(3);
					char.style.transform = `scale(${(1 + e * 0.15 * amount).toFixed(4)})`;
				} else {
					char.style.transform = `translate3d(${p.dx.toFixed(2)}px, ${p.dy.toFixed(2)}px, 0) scale(${(1 + e * 0.85 * amount).toFixed(4)})`;
					char.style.zIndex = `${Math.round(e * 10)}`;
				}
			};

			const tick = (now: number) => {
				raf = 0;
				const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
				last = now;
				if (!measured) measure();
				const mode = PHYSICAL[effectMode] && !reduce ? effectMode : '';
				const amount = Math.max(0, strength);
				const reach = Math.max(1, radius);
				const width = Math.max(fontPx * 1.3, 16);
				const swell = mode === 'magnify' ? 0.55 : 1;
				const follow = 1 - Math.exp(-dt / 0.06);
				const attack = 1 - Math.exp(-dt / 0.08);
				const release = 1 - Math.exp(-dt / Math.max(0.04, trail / 3));
				pointer.sx += (pointer.x - pointer.sx) * follow;
				pointer.sy += (pointer.y - pointer.sy) * follow;

				for (const wave of waves) {
					wave.age += dt;
					const t = Math.min(1, wave.age / wave.life);
					wave.r = wave.reach * (1 - (1 - t) * (1 - t));
					wave.fade = t < 0.75 ? 1 : 1 - ((t - 0.75) / 0.25) ** 2;
				}

				let busy = waves.length > 0 || Math.abs(pointer.x - pointer.sx) + Math.abs(pointer.y - pointer.sy) > 0.2;
				for (let i = 0; i < chars.length; i += 1) {
					const p = points[i];
					let target = 0;
					let tx = 0;
					let ty = 0;
					if (mode && pointer.inside) {
						const ax = p.x - pointer.sx;
						const ay = p.y - pointer.sy;
						target = falloff(Math.hypot(ax, ay), reach);
						tx = ax * 0.5 * amount * target;
						ty = ay * 0.5 * amount * target;
					}
					for (const wave of waves) {
						const ax = p.x - wave.x;
						const ay = p.y - wave.y;
						const d = Math.hypot(ax, ay);
						const strengthAt = 1 - (0.6 * d) / wave.reach;
						if (!wave.hit[i] && d <= wave.r) {
							wave.hit[i] = 1;
							gsap.to(glyphs[i], scramble(i, Math.max(0.2, duration * (0.2 + 0.5 * strengthAt))));
						}
						if (mode) {
							const band = swell * strengthAt * wave.fade * Math.exp(-(((d - wave.r) / width) ** 2));
							if (band > target) {
								const push = (fontPx * 0.6 * amount * band) / (d || 1);
								target = band;
								tx = ax * push;
								ty = ay * push;
							}
						}
					}
					const k = target > p.energy ? attack : release;
					p.energy += (target - p.energy) * k;
					if (Math.abs(target - p.energy) > 0.0005) busy = true;
					if (mode === 'magnify') {
						p.dx += (tx - p.dx) * k;
						p.dy += (ty - p.dy) * k;
					}
					if (!mode) {
						if (p.shown) clear(i);
						continue;
					}
					paint(i, mode, amount);
				}

				for (let j = waves.length - 1; j >= 0; j -= 1) {
					if (waves[j].age >= waves[j].life) waves.splice(j, 1);
				}

				if (busy) raf = requestAnimationFrame(tick);
				else last = 0;
			};

			const wake = () => {
				if (!raf) raf = requestAnimationFrame(tick);
			};

			const scrambleNearPointer = () => {
				moveFrame = 0;
				if (!measured) measure();
				const reach = radius;
				const length = duration;
				glyphs.forEach((glyph, index) => {
					const p = points[index];
					const dist = Math.hypot(pointer.x - p.x, pointer.y - p.y);
					if (dist < reach) gsap.to(glyph, scramble(index, length * (1 - dist / reach)));
				});
			};

			const handleEnter = () => {
				measured = false;
			};

			const handleMove = (e: PointerEvent) => {
				const [x, y] = toLocal(e);
				pointer.x = x;
				pointer.y = y;
				if (!pointer.inside) {
					pointer.sx = x;
					pointer.sy = y;
					pointer.inside = true;
				}
				if (PHYSICAL[effectMode]) {
					if (!reduce) wake();
				} else if (!moveFrame) moveFrame = requestAnimationFrame(scrambleNearPointer);
			};

			const handleLeave = () => {
				pointer.inside = false;
				wake();
			};

			const handleDown = (e: PointerEvent) => {
				if (!clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return;
				if (!measured) measure();
				const [x, y] = toLocal(e);
				let reach = 0;
				for (const p of points) reach = Math.max(reach, Math.hypot(p.x - x, p.y - y));
				reach += fontPx;
				if (waves.length > 3) waves.shift();
				waves.push({ x, y, age: 0, r: 0, fade: 1, reach, life: 0.45 + reach / 1100, hit: new Uint8Array(chars.length) });
				wake();
			};

			resetEffect = () => {
				points.forEach((p) => {
					p.energy = 0;
					p.dx = 0;
					p.dy = 0;
				});
				chars.forEach((_, i) => clear(i));
			};

			const resize = new ResizeObserver(() => {
				measured = false;
			});
			resize.observe(root);
			document.fonts?.ready
				.then(() => {
					measured = false;
				})
				.catch(() => {});

			root.addEventListener('pointerenter', handleEnter);
			root.addEventListener('pointermove', handleMove);
			root.addEventListener('pointerleave', handleLeave);
			root.addEventListener('pointerdown', handleDown);

			return () => {
				root.removeEventListener('pointerenter', handleEnter);
				root.removeEventListener('pointermove', handleMove);
				root.removeEventListener('pointerleave', handleLeave);
				root.removeEventListener('pointerdown', handleDown);
				resize.disconnect();
				cancelAnimationFrame(raf);
				cancelAnimationFrame(moveFrame);
				observer?.disconnect();
				decode?.kill();
				gsap.killTweensOf(glyphs);
				resetEffect = () => {};
				split.revert();
			};
		});
	});

	$effect(() => {
		void effectMode;
		untrack(() => resetEffect());
	});
</script>

<div
	bind:this={rootEl}
	class={`m-[7vw] max-w-[800px] font-mono text-[clamp(14px,4vw,32px)] ${className}`}
	style={rootStyle}
>
	<span bind:this={srEl} class="sr-only">{@render children?.()}</span>
	{#key textKey}
		<p bind:this={textEl} aria-hidden="true">{@render children?.()}</p>
	{/key}
</div>
