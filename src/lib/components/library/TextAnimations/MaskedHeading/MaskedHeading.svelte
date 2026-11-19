<!-- @svelte-bits
{
  "title": "Masked Heading",
  "description": "A headline with a drifting colour mesh or image showing through, revealed word by word.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	type Reveal = 'rise' | 'scale' | 'blur' | 'wipe' | 'fade' | 'none';
	type Trigger = 'view' | 'mount' | 'hover';

	export interface MaskedHeadingProps {
		text?: string;
		tag?: string;
		mediaType?: 'image' | 'video';
		src?: string;
		poster?: string;
		fillScale?: number;
		parallax?: number;
		drift?: number;
		hoverZoom?: number;
		brightness?: number;
		saturation?: number;
		grayscale?: boolean;
		tint?: string;
		spotlight?: boolean;
		spotlightRadius?: number;
		outline?: boolean;
		outlineColor?: string;
		outlineWidth?: number;
		reveal?: Reveal;
		duration?: number;
		stagger?: number;
		trigger?: Trigger;
		align?: 'left' | 'center' | 'right';
		weight?: number;
		tracking?: number;
		lineHeight?: number;
		textScale?: number;
		className?: string;
		style?: CSSProperties;
		[key: string]: unknown;
	}

	interface GlyphBox {
		x: number;
		y: number;
		w: number;
		cx: number;
		cy: number;
		lc: number;
	}

	interface GlyphState {
		x: number;
		y: number;
		s: number;
	}

	const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

	const SPOT_MASK = `radial-gradient(circle var(--mh-spot-r, 160px) at var(--mh-spot-x, 50%) var(--mh-spot-y, 50%), ${Array.from(
		{ length: 9 },
		(_, i) => {
			const t = i / 8;
			const u = clamp((t - 0.1) / 0.9, 0, 1);
			return `rgba(0, 0, 0, ${(u * u * u * (u * (u * 6 - 15) + 10)).toFixed(3)}) ${(t * 100).toFixed(1)}%`;
		}
	).join(', ')})`;

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
	import { gsap } from 'gsap';

	let {
		text = 'Designed in the details',
		tag = 'h2',
		mediaType = 'image',
		src = '',
		poster = '',
		fillScale = 1.25,
		parallax = 26,
		drift = 18,
		hoverZoom = 0,
		brightness = 1,
		saturation = 1,
		grayscale = false,
		tint = '',
		spotlight = false,
		spotlightRadius = 160,
		outline = false,
		outlineColor = '',
		outlineWidth = 1,
		reveal = 'rise',
		duration = 1.1,
		stagger = 0.09,
		trigger = 'view',
		align = 'center',
		weight = 700,
		tracking = -0.03,
		lineHeight = 1.06,
		textScale = 0.115,
		className = '',
		style,
		...rest
	}: MaskedHeadingProps = $props();

	let root: HTMLElement | undefined = $state();
	let measure: HTMLSpanElement | undefined = $state();
	let revealLayer: HTMLSpanElement | undefined = $state();
	let clip: HTMLSpanElement | undefined = $state();
	let media: HTMLSpanElement | undefined = $state();
	let wordEls: (HTMLSpanElement | null)[] = $state.raw([]);
	let baseEls: (HTMLElement | null)[] = $state.raw([]);
	let glyphEls: (SVGTextElement | null)[] = $state.raw([]);
	let lineEls: (SVGTextElement | null)[] = $state.raw([]);
	let fontSize = $state('');

	let boxes: GlyphBox[] = [];
	let states: GlyphState[] = [];
	let tween: gsap.core.Animation | null = null;
	const off = { x: 0, y: 0, tx: 0, ty: 0, zoom: 0, px: 0, py: 0, sx: 0, sy: 0, lit: false };
	const paint = { transform: '', filter: '', spot: '' };
	let wake: () => void = () => {};

	const uid = $props.id();
	const clipId = `mh-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const words = $derived(String(text).split(/\s+/).filter(Boolean));
	const glyphs = $derived(words.flatMap((word, w) => Array.from(word).map((char) => ({ char, w }))));

	const rootStyle = $derived(
		[`text-align:${align}`, `font-weight:${weight}`, `letter-spacing:${tracking}em`, `line-height:${lineHeight}`, css(style)]
			.filter(Boolean)
			.join(';')
	);

	const place = () => {
		const el = root;
		const target = media;
		if (!el || !target) return;
		const scale = fillScale * (1 + Math.max(0, off.zoom));
		const maxX = Math.max(0, ((scale - 1) / 2) * el.clientWidth);
		const maxY = Math.max(0, ((scale - 1) / 2) * el.clientHeight);

		const transform = `translate3d(${clamp(off.x, -maxX, maxX).toFixed(2)}px, ${clamp(off.y, -maxY, maxY).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
		const filter = `brightness(${brightness}) saturate(${saturation})${grayscale ? ' grayscale(1)' : ''}`;
		if (paint.transform !== transform) {
			paint.transform = transform;
			target.style.transform = transform;
		}
		if (paint.filter !== filter) {
			paint.filter = filter;
			target.style.filter = filter;
		}

		if (clip && spotlight) {
			const spot = `${off.sx.toFixed(1)}px ${off.sy.toFixed(1)}px`;
			if (paint.spot !== spot) {
				paint.spot = spot;
				clip.style.setProperty('--mh-spot-x', `${off.sx.toFixed(1)}px`);
				clip.style.setProperty('--mh-spot-y', `${off.sy.toFixed(1)}px`);
			}
		}
	};

	const renderGlyphs = () => {
		for (let i = 0; i < glyphEls.length; i += 1) {
			const glyph = glyphEls[i];
			if (!glyph) continue;
			const box = boxes[i];
			const st = states[i];
			if (!box || !st || (st.x === 0 && st.y === 0 && st.s === 1)) {
				if (glyph.hasAttribute('transform')) glyph.removeAttribute('transform');
				continue;
			}
			const s = Math.max(st.s, 0.0001);
			const tx = box.cx * (1 - s) + st.x * (box.cx - box.lc);
			const ty = box.cy * (1 - s) + st.y;
			glyph.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`);
		}
	};

	const sync = () => {
		const el = root;
		const probe = measure;
		if (!el || !probe) return;

		fontSize = `${clamp(el.clientWidth * textScale, 20, 200).toFixed(1)}px`;
		el.style.fontSize = fontSize;

		const cs = window.getComputedStyle(probe);
		const fontPx = parseFloat(cs.fontSize) || 48;
		const rootRect = el.getBoundingClientRect();
		const ratio = el.offsetWidth ? rootRect.width / el.offsetWidth || 1 : 1;
		const range = document.createRange();
		const next: GlyphBox[] = [];
		let index = 0;

		for (let w = 0; w < wordEls.length; w += 1) {
			const box = wordEls[w];
			const base = baseEls[w];
			const node = box?.firstChild as Text | null | undefined;
			if (!box || !base || !node || node.nodeType !== 3) {
				index += Array.from(box?.textContent ?? '').length;
				continue;
			}
			const boxRect = box.getBoundingClientRect();
			const baseline = base.offsetTop;
			let offset = 0;
			for (const char of Array.from(node.data)) {
				range.setStart(node, offset);
				range.setEnd(node, offset + char.length);
				offset += char.length;
				const r = range.getBoundingClientRect();
				const x = box.offsetLeft + (r.left - boxRect.left) / ratio;
				const width = r.width / ratio;
				next[index] = { x, y: baseline, w: width, cx: x + width / 2, cy: baseline - fontPx * 0.36, lc: 0 };
				index += 1;
			}
		}
		const lines = new Map<number, { left: number; right: number }>();
		for (const box of next) {
			if (!box) continue;
			const line = lines.get(box.y) ?? { left: Infinity, right: -Infinity };
			line.left = Math.min(line.left, box.x);
			line.right = Math.max(line.right, box.x + box.w);
			lines.set(box.y, line);
		}
		for (const box of next) {
			if (!box) continue;
			const line = lines.get(box.y);
			if (line) box.lc = (line.left + line.right) / 2;
		}
		boxes = next;

		const write = (node: SVGTextElement) => {
			node.style.fontFamily = cs.fontFamily;
			node.style.fontSize = cs.fontSize;
			node.style.fontWeight = cs.fontWeight;
			node.style.fontStyle = cs.fontStyle;
			node.style.letterSpacing = cs.letterSpacing;
		};
		for (let i = 0; i < next.length; i += 1) {
			const box = next[i];
			for (const node of [glyphEls[i], lineEls[i]]) {
				if (!node || !box) continue;
				node.setAttribute('x', box.x.toFixed(2));
				node.setAttribute('y', `${box.y}`);
				write(node);
			}
		}
		renderGlyphs();
		place();
	};

	$effect(() => {
		void [words, tag, align, weight, tracking, lineHeight, textScale, outline, root, measure];
		untrack(sync);
	});

	$effect(() => {
		const el = root;
		const layer = revealLayer;
		const list = glyphs;
		const mode = reveal;
		const when = trigger;
		const length = duration;
		const gap = stagger;
		if (!el || !layer) return;

		return untrack(() => {
			const local: GlyphState[] = list.map(() => ({ x: 0, y: 0, s: 1 }));
			states = local;
			if (!local.length) return undefined;

			const em = () => parseFloat(window.getComputedStyle(el).fontSize) || 48;
			const wordDelay = (i: number) => list[i].w * gap;
			const letterDelay = (i: number) => i * gap * 0.35;

			const clearLayer = () => {
				gsap.set(layer, { opacity: 1, scale: 1 });
				layer.style.clipPath = '';
				layer.style.filter = '';
			};

			const settle = () => {
				local.forEach((st) => {
					st.x = 0;
					st.y = 0;
					st.s = 1;
				});
				renderGlyphs();
				clearLayer();
			};

			const restState = () => {
				const size = em();
				if (mode === 'rise') {
					local.forEach((st) => {
						st.y = size * 1.15;
					});
				} else if (mode === 'scale') {
					local.forEach((st) => {
						st.y = size * 0.1;
						st.s = 0;
					});
				} else if (mode === 'blur') {
					local.forEach((st) => {
						st.x = 0.22;
					});
					gsap.set(layer, { opacity: 0 });
					layer.style.filter = `blur(${(size * 0.3).toFixed(2)}px)`;
				} else if (mode === 'wipe') {
					layer.style.clipPath = 'inset(0% 100% 0% 0%)';
				} else if (mode === 'fade') {
					gsap.set(layer, { opacity: 0, scale: 1.08 });
				}
				renderGlyphs();
			};

			const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
			if (mode === 'none' || reduce) {
				settle();
				return undefined;
			}

			const play = () => {
				tween?.kill();
				const size = em();
				if (mode === 'rise') {
					clearLayer();
					tween = gsap.fromTo(
						local,
						{ x: 0, y: size * 1.15, s: 1 },
						{ y: 0, duration: length, stagger: wordDelay, ease: 'power4.out', overwrite: 'auto', onUpdate: renderGlyphs }
					);
					renderGlyphs();
				} else if (mode === 'scale') {
					clearLayer();
					tween = gsap.fromTo(
						local,
						{ x: 0, y: size * 0.1, s: 0 },
						{ y: 0, s: 1, duration: length, stagger: letterDelay, ease: 'expo.out', overwrite: 'auto', onUpdate: renderGlyphs }
					);
					renderGlyphs();
				} else if (mode === 'blur') {
					const focus = { blur: size * 0.3, opacity: 0 };
					gsap.set(layer, { scale: 1, opacity: 0 });
					layer.style.clipPath = '';
					layer.style.filter = `blur(${focus.blur.toFixed(2)}px)`;
					const timeline = gsap.timeline({ onUpdate: renderGlyphs });
					timeline.fromTo(local, { x: 0.22, y: 0, s: 1 }, { x: 0, duration: length * 1.2, ease: 'expo.out' }, 0);
					timeline.to(
						focus,
						{
							blur: 0,
							opacity: 1,
							duration: length * 1.2,
							ease: 'power2.out',
							onUpdate: () => {
								layer.style.filter = focus.blur > 0.05 ? `blur(${focus.blur.toFixed(2)}px)` : '';
								layer.style.opacity = focus.opacity.toFixed(3);
							}
						},
						0
					);
					tween = timeline;
					renderGlyphs();
				} else if (mode === 'wipe') {
					settle();
					layer.style.clipPath = 'inset(0% 100% 0% 0%)';
					const state = { p: 100 };
					tween = gsap.to(state, {
						p: 0,
						duration: length,
						ease: 'power3.inOut',
						overwrite: 'auto',
						onUpdate: () => {
							layer.style.clipPath = `inset(0% ${state.p}% 0% 0%)`;
						}
					});
				} else {
					settle();
					tween = gsap.fromTo(
						layer,
						{ opacity: 0, scale: 1.08 },
						{ opacity: 1, scale: 1, duration: length, ease: 'power3.out', overwrite: 'auto' }
					);
				}
			};

			if (when === 'hover') {
				settle();
				el.addEventListener('pointerenter', play);
				return () => {
					el.removeEventListener('pointerenter', play);
					tween?.kill();
				};
			}

			if (when === 'view') {
				settle();
				restState();
				const io = new IntersectionObserver(
					(entries) => {
						if (entries.some((e) => e.isIntersecting)) {
							play();
							io.disconnect();
						}
					},
					{ threshold: 0.25 }
				);
				io.observe(el);
				return () => {
					io.disconnect();
					tween?.kill();
				};
			}

			play();
			return () => tween?.kill();
		});
	});

	$effect(() => {
		const el = root;
		if (!el) return;

		return untrack(() => {
			let alive = true;
			let needsSync = false;
			let raf = 0;
			let last = 0;
			let clock = 0;
			let visible = true;
			let hovering = false;
			const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

			const frame = (now: number) => {
				raf = 0;
				if (needsSync) {
					needsSync = false;
					sync();
				}
				const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
				last = now;
				const still = !!motionQuery?.matches;

				if (still) {
					off.x = 0;
					off.y = 0;
					off.zoom = 0;
				} else {
					clock += dt;
					const dx = Math.sin(clock * 0.21) * drift;
					const dy = Math.cos(clock * 0.17) * drift * 0.6;
					const ease = 1 - Math.exp(-dt / 0.18);
					off.x += (off.tx + dx - off.x) * ease;
					off.y += (off.ty + dy - off.y) * ease;
					off.zoom += ((hovering ? hoverZoom : 0) - off.zoom) * (1 - Math.exp(-dt / 0.35));
				}

				if (spotlight) {
					const w = el.clientWidth;
					const h = el.clientHeight;
					let gx = w / 2;
					let gy = h / 2;
					if (hovering) {
						gx = off.px;
						gy = off.py;
					} else if (!still) {
						gx = w * (0.5 + 0.36 * Math.sin(clock * 0.37));
						gy = h * (0.5 + 0.22 * Math.sin(clock * 0.61 + 0.9));
					}
					if (!off.lit || still) {
						off.sx = gx;
						off.sy = gy;
						off.lit = true;
					} else {
						const follow = 1 - Math.exp(-dt / (hovering ? 0.12 : 0.6));
						off.sx += (gx - off.sx) * follow;
						off.sy += (gy - off.sy) * follow;
					}
				} else {
					off.lit = false;
				}

				place();
				if (visible && !still && alive) raf = requestAnimationFrame(frame);
			};

			const wakeLoop = () => {
				if (raf || !alive) return;
				last = 0;
				raf = requestAnimationFrame(frame);
			};
			wake = wakeLoop;

			const ro = new ResizeObserver(() => {
				needsSync = true;
				wakeLoop();
			});
			ro.observe(el);
			if (document.fonts?.ready) document.fonts.ready.then(() => alive && sync()).catch(() => {});

			const onMove = (e: PointerEvent) => {
				const r = el.getBoundingClientRect();
				const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
				const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
				off.tx = clamp(nx, -1, 1) * -Math.max(0, parallax);
				off.ty = clamp(ny, -1, 1) * -Math.max(0, parallax);
				off.px = ((e.clientX - r.left) / (r.width || 1)) * el.clientWidth;
				off.py = ((e.clientY - r.top) / (r.height || 1)) * el.clientHeight;
				if (spotlight) wakeLoop();
			};

			const onEnter = (e: PointerEvent) => {
				hovering = e.pointerType !== 'touch';
				onMove(e);
				wakeLoop();
			};

			const onLeave = () => {
				hovering = false;
				off.tx = 0;
				off.ty = 0;
				wakeLoop();
			};

			const io = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				if (visible) wakeLoop();
			});
			io.observe(el);

			el.addEventListener('pointermove', onMove);
			el.addEventListener('pointerenter', onEnter);
			el.addEventListener('pointerleave', onLeave);
			wakeLoop();

			return () => {
				alive = false;
				cancelAnimationFrame(raf);
				raf = 0;
				wake = () => {};
				ro.disconnect();
				io.disconnect();
				el.removeEventListener('pointermove', onMove);
				el.removeEventListener('pointerenter', onEnter);
				el.removeEventListener('pointerleave', onLeave);
			};
		});
	});

	$effect(() => {
		void [
			text,
			tag,
			mediaType,
			src,
			poster,
			fillScale,
			parallax,
			drift,
			hoverZoom,
			brightness,
			saturation,
			grayscale,
			tint,
			spotlight,
			spotlightRadius,
			outline,
			outlineColor,
			outlineWidth,
			reveal,
			duration,
			stagger,
			trigger,
			align,
			weight,
			tracking,
			lineHeight,
			textScale,
			className,
			style
		];
		untrack(() => wake());
	});

	$effect(() => {
		void [mediaType, src];
		const target = media;
		untrack(() => {
			const video = target?.querySelector('video');
			if (video && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) video.pause();
		});
	});
</script>

<svelte:element
	this={tag}
	bind:this={root}
	class={`relative w-full m-0 p-0 antialiased [text-wrap:balance] ${className}`.trim()}
	style={rootStyle}
	style:font-size={fontSize || undefined}
	{...rest}
>
	<span bind:this={measure} class="text-transparent">
		{#each words as word, i (`${word}-${i}`)}
			<span bind:this={wordEls[i]} class="inline-block whitespace-pre [&:not(:last-child)]:after:content-['_']">{word}<i bind:this={baseEls[i]} class="inline-block w-0 h-0"></i></span>
		{/each}
	</span>

	<svg class="absolute w-0 h-0 overflow-hidden" aria-hidden="true" focusable="false">
		<defs>
			<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
				{#each glyphs as glyph, i (i)}
					<text bind:this={glyphEls[i]}>{glyph.char}</text>
				{/each}
			</clipPath>
		</defs>
	</svg>

	<span bind:this={revealLayer} class="absolute inset-0 block pointer-events-none">
		<span
			bind:this={clip}
			class="absolute inset-0 block"
			style:clip-path={`url(#${clipId})`}
			style:--mh-spot-r={`${Math.max(1, spotlightRadius)}px`}
		>
			<span
				bind:this={media}
				class="absolute inset-0 block [background:color-mix(in_srgb,currentColor_10%,transparent)] [will-change:transform,filter]"
			>
				{#if mediaType === 'video'}
					<video
						class="block w-full h-full object-cover select-none"
						src={src || undefined}
						poster={poster || undefined}
						autoplay
						muted
						loop
						playsinline
					></video>
				{:else}
					<img class="block w-full h-full object-cover select-none" src={src || undefined} alt="" draggable={false} />
				{/if}
			</span>
			{#if tint}
				<span class="absolute inset-0 block mix-blend-color pointer-events-none" style:background={tint}></span>
			{/if}
			{#if spotlight}
				<span
					class="absolute inset-0 block pointer-events-none bg-[#808080] mix-blend-saturation"
					style:mask-image={SPOT_MASK}
					style:-webkit-mask-image={SPOT_MASK}
				></span>
				<span
					class="absolute inset-0 block pointer-events-none bg-black opacity-55"
					style:mask-image={SPOT_MASK}
					style:-webkit-mask-image={SPOT_MASK}
				></span>
			{/if}
		</span>
	</span>

	{#if outline}
		<svg
			class="absolute inset-0 w-full h-full overflow-visible pointer-events-none fill-none [stroke-linejoin:round]"
			aria-hidden="true"
			focusable="false"
			style:stroke={outlineColor || 'currentColor'}
			style:stroke-width={Math.max(0, outlineWidth)}
		>
			{#each glyphs as glyph, i (i)}
				<text bind:this={lineEls[i]}>{glyph.char}</text>
			{/each}
		</svg>
	{/if}
</svelte:element>
