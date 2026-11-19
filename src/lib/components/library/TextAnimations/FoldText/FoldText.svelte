<!-- @svelte-bits
{
  "title": "Fold Text",
  "description": "Lines unfold into place like creased paper opening flat.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	export type SplitBy = 'char' | 'word' | 'line';
	export type Hinge = 'top' | 'bottom' | 'left' | 'right';
	export type Trigger = 'mount' | 'hover' | 'scroll' | 'loop';
	export type StaggerFrom = 'start' | 'center' | 'end' | 'edges' | 'random';
	export type FoldStyle = 'paper' | 'blinds' | 'flip';
	type Axis = 'rotateX' | 'rotateY';
	type CSSProperties = Record<string, string | number | undefined | null>;

	export interface FoldTextProps {
		text?: string;
		splitBy?: SplitBy;
		hinge?: Hinge;
		foldStyle?: FoldStyle;
		duration?: number;
		stagger?: number;
		staggerFrom?: StaggerFrom;
		foldAngle?: number;
		ease?: string;
		perspective?: number;
		creaseShading?: number;
		trigger?: Trigger;
		loopDelay?: number;
		hoverRefold?: boolean;
		refoldRadius?: number;
		refoldAngle?: number;
		fontSize?: string | number;
		fontWeight?: string | number;
		color?: string;
		className?: string;
		style?: CSSProperties;
	}

	type HingeConfig = {
		origin: string;
		axis: Axis;
		sign: number;
		originClass: string;
		shadeClass: string;
	};

	type Piece = {
		element: HTMLElement;
		parts: HTMLElement[];
		t: number;
		f: number;
		r: number;
		aim: number;
	};

	type Point = { x: number; y: number };

	type PieceItem = { type: 'piece'; key: string; content: string; isLine: boolean };
	type Item =
		| PieceItem
		| { type: 'br'; key: string }
		| { type: 'space'; key: string; text: string }
		| { type: 'word'; key: string; pieces: PieceItem[] };

	const HINGES: Record<Hinge, HingeConfig> = {
		top: {
			origin: '50% 0%',
			axis: 'rotateX',
			sign: -1,
			originClass: 'origin-top',
			shadeClass:
				'after:bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_42%,rgba(255,255,255,0.26)_100%)]'
		},
		bottom: {
			origin: '50% 100%',
			axis: 'rotateX',
			sign: 1,
			originClass: 'origin-bottom',
			shadeClass: 'after:bg-[linear-gradient(0deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_42%,rgba(255,255,255,0.26)_100%)]'
		},
		left: {
			origin: '0% 50%',
			axis: 'rotateY',
			sign: 1,
			originClass: 'origin-left',
			shadeClass: 'after:bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_42%,rgba(255,255,255,0.26)_100%)]'
		},
		right: {
			origin: '100% 50%',
			axis: 'rotateY',
			sign: -1,
			originClass: 'origin-right',
			shadeClass:
				'after:bg-[linear-gradient(270deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_42%,rgba(255,255,255,0.26)_100%)]'
		}
	};

	const PIECE_CLASS = 'relative inline-block [backface-visibility:hidden] motion-reduce:[transform:none]!';

	const BLINDS_CLASS = 'relative inline-block [perspective:var(--fold-perspective)]';

	const SLAT_CLASS = 'inline-block [backface-visibility:hidden] motion-reduce:[transform:none]!';

	const SHADE_CLASS =
		'after:pointer-events-none after:absolute after:inset-0 after:content-[attr(data-fold-text)] after:text-transparent after:[-webkit-text-fill-color:transparent] after:bg-clip-text after:opacity-[var(--fold-crease,0)] motion-reduce:after:opacity-0!';

	const LINE_CLASS = 'block [perspective:var(--fold-perspective)]';

	const SEGMENT_CLASS = 'inline-block align-baseline [perspective:var(--fold-perspective)]';

	const SLATS: Record<Axis, { origins: string[]; clips: string[] }> = {
		rotateX: {
			origins: ['50% 25%', '50% 75%'],
			clips: ['inset(-40% -20% 50% -20%)', 'inset(50% -20% -40% -20%)']
		},
		rotateY: {
			origins: ['25% 50%', '75% 50%'],
			clips: ['inset(-40% 50% -40% -20%)', 'inset(-40% -20% -40% 50%)']
		}
	};

	const FOLD_STYLES: FoldStyle[] = ['paper', 'blinds', 'flip'];
	const SLAT_DELAY = 0.24;

	const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

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
	let {
		text = 'Design unfolds',
		splitBy = 'char',
		hinge = 'top',
		foldStyle = 'paper',
		duration = 0.65,
		stagger = 0.045,
		staggerFrom = 'start',
		foldAngle = 92,
		ease = 'power3.out',
		perspective = 700,
		creaseShading = 0.55,
		trigger = 'mount',
		loopDelay = 1.4,
		hoverRefold = false,
		refoldRadius = 140,
		refoldAngle = 45,
		fontSize = 80,
		fontWeight = 800,
		color = 'currentColor',
		className = '',
		style = {}
	}: FoldTextProps = $props();

	let rootEl: HTMLSpanElement | undefined = $state();

	const safeHinge = $derived<Hinge>(HINGES[hinge] ? hinge : 'top');
	const hingeConfig = $derived(HINGES[safeHinge]);
	const safeStyle = $derived<FoldStyle>(FOLD_STYLES.includes(foldStyle) ? foldStyle : 'paper');
	const safeCrease = $derived(clamp(creaseShading, 0, 1));
	const safeAngle = $derived(clamp(foldAngle, 0, 180));
	const safeStagger = $derived(Math.max(0, stagger));
	const safeDelay = $derived(Math.max(0, loopDelay));
	const safeRadius = $derived(Math.max(1, refoldRadius));
	const safeRefold = $derived(clamp(refoldAngle, 0, 180));
	const startsFolded = $derived(trigger !== 'hover');

	const pieceClass = $derived(`${PIECE_CLASS} ${SHADE_CLASS} ${hingeConfig.originClass} ${hingeConfig.shadeClass}`);
	const slatClass = $derived(`${SLAT_CLASS} ${SHADE_CLASS} ${hingeConfig.shadeClass}`);
	const pieceStyle = $derived(startsFolded ? 'opacity: 0' : undefined);

	const items = $derived.by<Item[]>(() => {
		const piece = (content: string, key: string, isLine = false): PieceItem => ({
			type: 'piece',
			key,
			content,
			isLine
		});

		if (splitBy === 'line') {
			return text.split('\n').map((line, index) => piece(line || ' ', `line-${index}`, true));
		}

		return text.split(/(\s+)/).flatMap((part, partIndex): Item[] => {
			if (!part) return [];

			if (/^\s+$/.test(part)) {
				return part
					.split('\n')
					.flatMap((spaces, lineIndex): (Item | null)[] => [
						lineIndex > 0 ? { type: 'br', key: `br-${partIndex}-${lineIndex}` } : null,
						spaces ? { type: 'space', key: `space-${partIndex}-${lineIndex}`, text: spaces } : null
					])
					.filter((item): item is Item => item !== null);
			}

			if (splitBy === 'word') return [piece(part, `word-${partIndex}`)];

			return [
				{
					type: 'word',
					key: `word-${partIndex}`,
					pieces: Array.from(part).map((char, charIndex) => piece(char, `char-${partIndex}-${charIndex}`))
				}
			];
		});
	});

	const rootStyle = $derived(
		[
			css({
				color,
				fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
				fontWeight,
				'--fold-perspective': `${Math.max(120, perspective)}px`
			}),
			css(style)
		]
			.filter(Boolean)
			.join(';')
	);

	$effect(() => {
		const root = rootEl;
		void items;
		const currentStyle = safeStyle;
		const fromFolded = startsFolded;
		const currentTrigger = trigger;
		const radius = safeRadius;
		const holdDelay = safeDelay;
		const baseDuration = duration;
		const easeName = ease;
		const config = hingeConfig;
		const baseAngle = safeAngle;
		const baseCrease = safeCrease;
		const baseStagger = safeStagger;
		const from = staggerFrom;
		const refoldEnabled = hoverRefold;
		const refoldMax = safeRefold;

		if (!root) return;

		const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-fold-piece]'));
		if (!elements.length) return;

		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const { axis, sign, origin } = config;
		const slats = SLATS[axis];
		const unfoldEase = gsap.parseEase(reduceMotion ? 'power1.out' : easeName) || gsap.parseEase('power3.out');
		const foldEase = gsap.parseEase(reduceMotion ? 'power1.in' : 'power2.in');
		const angle = reduceMotion ? 0 : currentStyle === 'flip' ? 180 : baseAngle;
		const crease = reduceMotion ? 0 : baseCrease;
		const refold = refoldEnabled && !reduceMotion ? refoldMax : 0;
		const lift = currentStyle === 'flip' && !reduceMotion ? 0.45 : 0;
		const unfoldDuration = reduceMotion ? Math.min(baseDuration, 0.22) : baseDuration;
		const staggerVars: gsap.StaggerVars = {
			each: reduceMotion ? Math.min(baseStagger, 0.02) : baseStagger,
			from
		};

		const pieces = elements.map((element): Piece => {
			const parts = currentStyle === 'blinds' ? (Array.from(element.children) as HTMLElement[]) : [element];
			if (currentStyle === 'blinds') {
				element.style.opacity = '1';
				parts.forEach((part, index) => {
					part.style.transformOrigin = slats.origins[index];
					if (index > 0) part.style.clipPath = slats.clips[index];
				});
			} else {
				element.style.transformOrigin = currentStyle === 'flip' ? '50% 50%' : origin;
				element.style.backfaceVisibility = currentStyle === 'flip' ? 'visible' : '';
			}
			return { element, parts, t: fromFolded ? 0 : 1, f: 0, r: 0, aim: 0 };
		});

		const shade = (progress: number, tilt: number) => String(crease * clamp(1 - progress + tilt / 90, 0, 1));

		const render = () => {
			pieces.forEach((piece) => {
				const tilt = piece.r * refold;

				if (currentStyle === 'blinds') {
					let resting = tilt < 0.05;
					piece.parts.forEach((part, index) => {
						const offset = index * SLAT_DELAY;
						const open = unfoldEase(clamp((piece.t - offset) / (1 - SLAT_DELAY), 0, 1));
						const close = foldEase(clamp((piece.f - offset) / (1 - SLAT_DELAY), 0, 1));
						const progress = open * (1 - close);
						if (Math.abs(1 - progress) > 0.002) resting = false;
						part.style.transform = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`;
						part.style.opacity = String(clamp(progress, 0, 1));
						part.style.setProperty('--fold-crease', shade(progress, tilt));
					});
					piece.parts[0].style.clipPath = resting ? 'none' : slats.clips[0];
					piece.parts[1].style.visibility = resting ? 'hidden' : 'visible';
					return;
				}

				const progress = unfoldEase(piece.t) * (1 - foldEase(piece.f));
				const rise = lift * Math.sin(Math.PI * clamp(progress, 0, 1));
				const turn = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`;
				piece.element.style.transform = rise > 0.001 ? `translateZ(${rise}em) ${turn}` : turn;
				piece.element.style.opacity = String(clamp(progress, 0, 1));
				piece.element.style.setProperty('--fold-crease', shade(progress, tilt));
			});
		};

		let timeline: gsap.core.Timeline | null = null;
		let scrollTrigger: ScrollTrigger | null = null;

		const play = (loop: boolean) => {
			timeline?.kill();
			timeline = gsap.timeline({ onUpdate: render, ...(loop ? { repeat: -1, repeatDelay: 0.35 } : {}) });
			timeline.fromTo(pieces, { t: 0, f: 0 }, { t: 1, duration: unfoldDuration, ease: 'none', stagger: staggerVars });
			if (loop) {
				timeline.to(
					pieces,
					{ f: 1, duration: unfoldDuration * 0.75, ease: 'none', stagger: staggerVars },
					`+=${holdDelay}`
				);
			}
			render();
		};

		const handleEnter = () => play(false);

		if (currentTrigger === 'hover') {
			render();
			root.addEventListener('mouseenter', handleEnter);
		} else if (currentTrigger === 'scroll') {
			render();
			scrollTrigger = ScrollTrigger.create({
				trigger: root,
				start: 'top 82%',
				once: true,
				onEnter: handleEnter
			});
		} else {
			play(currentTrigger === 'loop');
		}

		let pointer: Point | null = null;
		let centers: Point[] | null = null;
		let measured: { width: number; height: number } | null = null;
		let relaxing = false;

		const measure = (box: DOMRect) => {
			centers = pieces.map((piece) => {
				const rect = (piece.element.parentElement ?? piece.element).getBoundingClientRect();
				return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
			});
			measured = { width: box.width, height: box.height };
		};

		const relax = (_time: number, deltaTime: number) => {
			const step = Math.min(deltaTime, 64) / 1000;
			let moving = false;
			pieces.forEach((piece) => {
				const rate = piece.aim > piece.r ? 14 : 6;
				piece.r += (piece.aim - piece.r) * (1 - Math.exp(-rate * step));
				if (Math.abs(piece.aim - piece.r) > 0.001) moving = true;
				else piece.r = piece.aim;
			});
			render();
			if (!moving) {
				gsap.ticker.remove(relax);
				relaxing = false;
			}
		};

		const aim = () => {
			const box = root.getBoundingClientRect();
			const near =
				pointer &&
				pointer.x > box.left - radius &&
				pointer.x < box.right + radius &&
				pointer.y > box.top - radius &&
				pointer.y < box.bottom + radius;
			if (
				near &&
				(!centers || !measured || Math.abs(box.width - measured.width) + Math.abs(box.height - measured.height) > 1)
			) {
				measure(box);
			}
			let changed = false;
			pieces.forEach((piece, index) => {
				let value = 0;
				if (near && pointer && centers) {
					const center = centers[index];
					const distance = Math.hypot(box.left + center.x - pointer.x, box.top + center.y - pointer.y) / radius;
					if (distance < 1) value = 1 - distance * distance * (3 - 2 * distance);
				}
				if (value !== piece.aim) changed = true;
				piece.aim = value;
			});
			if (changed && !relaxing) {
				relaxing = true;
				gsap.ticker.add(relax);
			}
		};

		const handleMove = (event: PointerEvent) => {
			pointer = { x: event.clientX, y: event.clientY };
			aim();
		};

		const handleLeave = () => {
			pointer = null;
			aim();
		};

		const handleScroll = () => {
			if (pointer) aim();
		};

		if (refold) {
			window.addEventListener('pointermove', handleMove, { passive: true });
			window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
			document.documentElement.addEventListener('pointerleave', handleLeave);
		}

		return () => {
			root.removeEventListener('mouseenter', handleEnter);
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('scroll', handleScroll, { capture: true });
			document.documentElement.removeEventListener('pointerleave', handleLeave);
			gsap.ticker.remove(relax);
			scrollTrigger?.kill();
			timeline?.kill();
			gsap.killTweensOf(pieces);
		};
	});
</script>

{#snippet piece(content: string, isLine: boolean)}<span class={isLine ? LINE_CLASS : SEGMENT_CLASS}
		>{#if safeStyle === 'blinds'}<span class={BLINDS_CLASS} data-fold-piece="" style={pieceStyle}
				><span class={`relative ${slatClass}`} data-fold-text={content}>{content}</span><span
					class={`invisible absolute inset-0 ${slatClass}`}
					data-fold-text={content}>{content}</span
				></span
			>{:else}<span class={pieceClass} data-fold-piece="" data-fold-text={content} style={pieceStyle}
				>{content}</span
			>{/if}</span
	>{/snippet}

<span
	bind:this={rootEl}
	class={`inline-block whitespace-pre-wrap select-text leading-[0.95] tracking-[-0.04em] ${className}`.trim()}
	style={rootStyle}
	><span class="sr-only select-none">{text}</span><span aria-hidden="true"
		>{#each items as item (item.key)}{#if item.type === 'br'}<br />{:else if item.type === 'space'}{item.text}{:else if item.type === 'word'}<span
					class="inline-block whitespace-nowrap"
					>{#each item.pieces as p (p.key)}{@render piece(p.content, false)}{/each}</span
				>{:else}{@render piece(item.content, item.isLine)}{/if}{/each}</span
	></span
>
