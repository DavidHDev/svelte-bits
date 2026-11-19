<!-- @svelte-bits
{
  "title": "Scroll Velocity",
  "description": "Text marquee animatio - speed and distortion scale with user's scroll velocity.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;

	type VelocityMapping = {
		input: [number, number];
		output: [number, number];
	};

	type Row = {
		baseX: MotionValue<number>;
		skewX: MotionValue<number>;
		scaleY: MotionValue<number>;
		directionFactor: number;
		pace: number;
		fling: number;
		drag: { active: boolean; pointerId: number; lastX: number; lastTime: number; velocity: number; travel: number };
		copyWidth: number;
	};

	const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

	const FADE_STEPS = Array.from({ length: 9 }, (_, i) => i / 8);

	const FADE_MASK = `linear-gradient(to right, ${[
		...FADE_STEPS.map((t) => `rgba(0, 0, 0, ${smootherstep(t).toFixed(3)}) ${(t * 12).toFixed(1)}%`),
		...FADE_STEPS.map((t) => `rgba(0, 0, 0, ${smootherstep(1 - t).toFixed(3)}) ${(88 + t * 12).toFixed(1)}%`)
	].join(', ')})`;

	const OUTLINE_STYLE = '-webkit-text-fill-color:transparent;-webkit-text-stroke:max(1px, 0.028em) currentColor';

	const UNITLESS = /^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio)$/;

	const css = (value: CSSProperties | undefined) =>
		Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([key, v]) => {
				const name = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return `${name}:${typeof v === 'number' && !UNITLESS.test(key) ? `${v}px` : v}`;
			})
			.join(';');

	function wrap(min: number, max: number, v: number): number {
		const range = max - min;
		const mod = (((v - min) % range) + range) % range;
		return mod + min;
	}
</script>

<script lang="ts">
	import { attachSpring, cancelFrame, frame, motionValue, scroll, transform, type MotionValue } from 'motion';

	type Props = {
		scrollContainerRef?: HTMLElement | null;
		texts?: string[];
		velocity?: number;
		className?: string;
		damping?: number;
		stiffness?: number;
		numCopies?: number;
		velocityMapping?: VelocityMapping;
		parallaxClassName?: string;
		scrollerClassName?: string;
		parallaxStyle?: CSSProperties;
		scrollerStyle?: CSSProperties;
		separator?: string;
		pauseOnHover?: boolean;
		fadeEdges?: boolean;
		skewWithVelocity?: number;
		scaleWithVelocity?: number;
		outlineAlternate?: boolean;
		gap?: number;
		fontSize?: number | string;
		fontWeight?: number | string;
		color?: string;
		draggable?: boolean;
	};

	let {
		scrollContainerRef = null,
		texts = [],
		velocity = 100,
		className = '',
		damping = 50,
		stiffness = 400,
		numCopies = 6,
		velocityMapping = { input: [0, 1000], output: [0, 5] },
		parallaxClassName = 'parallax',
		scrollerClassName = 'scroller',
		parallaxStyle,
		scrollerStyle,
		separator = '',
		pauseOnHover = false,
		fadeEdges = false,
		skewWithVelocity = 0,
		scaleWithVelocity = 0,
		outlineAlternate = false,
		gap = 0,
		fontSize,
		fontWeight,
		color,
		draggable = false
	}: Props = $props();

	let hovered = false;
	let scrollerEls: (HTMLDivElement | undefined)[] = $state([]);

	const rows: Row[] = [];

	const getRow = (index: number): Row => {
		if (!rows[index]) {
			rows[index] = {
				baseX: motionValue(0),
				skewX: motionValue(0),
				scaleY: motionValue(1),
				directionFactor: 1,
				pace: 1,
				fling: 0,
				drag: { active: false, pointerId: -1, lastX: 0, lastTime: 0, velocity: 0, travel: 0 },
				copyWidth: 0
			};
		}
		return rows[index];
	};

	const scrollY = motionValue(0);
	const scrollVelocity = motionValue(scrollY.getVelocity());
	const smoothVelocity = motionValue(scrollVelocity.get());

	const updateVelocity = () => {
		const latest = scrollY.getVelocity();
		scrollVelocity.set(latest);
		if (latest) frame.update(updateVelocity);
	};

	$effect(() => {
		const unsubscribe = scrollY.on('change', () => {
			frame.update(updateVelocity, false, true);
		});
		return () => {
			unsubscribe();
			cancelFrame(updateVelocity);
		};
	});

	$effect(() => {
		return scroll(
			(_progress: number, { y }: { y: { current: number } }) => {
				scrollY.set(y.current);
			},
			{ container: scrollContainerRef || undefined }
		);
	});

	$effect(() => attachSpring(smoothVelocity, scrollVelocity, { damping, stiffness }));

	const mapVelocity = $derived(
		transform(velocityMapping?.input || [0, 1000], velocityMapping?.output || [0, 5], { clamp: false })
	);

	const paint = (index: number) => {
		const row = rows[index];
		const scroller = scrollerEls[index];
		if (!row || !scroller) return;
		const x = row.copyWidth === 0 ? 0 : wrap(-row.copyWidth, 0, row.baseX.get());
		const skew = row.skewX.get();
		const scale = row.scaleY.get();
		const parts: string[] = [];
		if (x !== 0) parts.push(`translateX(${x}px)`);
		if (scale !== 1) parts.push(`scaleY(${scale})`);
		if (skew !== 0) parts.push(`skewX(${skew}deg)`);
		const next = parts.join(' ') || 'none';
		if (scroller.style.transform !== next) scroller.style.transform = next;
	};

	$effect(() => {
		const elements = scrollerEls.slice(0, texts.length);
		void numCopies;
		void separator;
		const copies = elements.map((el) => (el?.firstElementChild as HTMLElement | null) ?? null);
		const measure = (index: number, width: number) => {
			getRow(index).copyWidth = width;
			paint(index);
		};

		if (typeof ResizeObserver === 'undefined') {
			const updateWidths = () => copies.forEach((copy, index) => copy && measure(index, copy.offsetWidth));
			updateWidths();
			window.addEventListener('resize', updateWidths);
			return () => window.removeEventListener('resize', updateWidths);
		}

		const observer = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				const index = copies.indexOf(entry.target as HTMLElement);
				if (index !== -1) measure(index, entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
			});
		});
		copies.forEach((copy) => copy && observer.observe(copy));
		return () => observer.disconnect();
	});

	const step = (index: number, delta: number) => {
		const row = getRow(index);
		const baseVelocity = index % 2 !== 0 ? -velocity : velocity;
		const grab = row.drag;
		const seconds = Math.min(delta, 64) / 1000;
		const targetPace = grab.active || (pauseOnHover && hovered) ? 0 : 1;
		row.pace += (targetPace - row.pace) * (1 - Math.exp(-delta / 150));

		const velocityFactor = mapVelocity(smoothVelocity.get());

		let moveBy = row.directionFactor * baseVelocity * (delta / 1000);

		if (velocityFactor < 0) {
			row.directionFactor = -1;
		} else if (velocityFactor > 0) {
			row.directionFactor = 1;
		}

		moveBy += row.directionFactor * moveBy * velocityFactor;
		let travel = moveBy * row.pace;

		if (!grab.active && row.fling !== 0) {
			travel += row.fling * seconds;
			row.fling *= Math.exp(-delta / 420);
			if (Math.abs(row.fling) < 4) row.fling = 0;
		}

		row.baseX.set(row.baseX.get() + travel);

		if (!skewWithVelocity && !scaleWithVelocity && row.skewX.get() === 0 && row.scaleY.get() === 1) return;

		const thrown = grab.active ? grab.velocity : row.fling;
		const scrollSurge = Math.tanh(Math.abs(smoothVelocity.get()) / 1600) * row.pace;
		const throwSurge = Math.tanh(Math.abs(thrown) / 2000);
		const surge = Math.max(scrollSurge, throwSurge);
		const heading =
			throwSurge > scrollSurge ? Math.sign(thrown) : Math.sign(travel) || row.directionFactor * Math.sign(baseVelocity);
		const ease = 1 - Math.exp(-delta / 110);
		const nextSkew = row.skewX.get() + (-heading * skewWithVelocity * surge - row.skewX.get()) * ease;
		const nextScale = row.scaleY.get() + (1 + scaleWithVelocity * surge - row.scaleY.get()) * ease;
		row.skewX.set(Math.abs(nextSkew) < 0.01 && !skewWithVelocity ? 0 : nextSkew);
		row.scaleY.set(Math.abs(nextScale - 1) < 0.0005 && !scaleWithVelocity ? 1 : nextScale);
	};

	$effect(() => {
		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const tick = ({ delta }: { delta: number }) => {
			const count = texts.length;
			if (!reduceMotion) {
				for (let index = 0; index < count; index++) step(index, delta);
			}
			for (let index = 0; index < count; index++) paint(index);
		};
		frame.update(tick, true);
		return () => cancelFrame(tick);
	});

	const handlePointerDown = (event: PointerEvent, index: number) => {
		if (!draggable || (event.pointerType === 'mouse' && event.button !== 0)) return;
		const row = getRow(index);
		const grab = row.drag;
		const target = event.currentTarget as HTMLElement;
		grab.active = true;
		grab.pointerId = event.pointerId;
		grab.lastX = event.clientX;
		grab.lastTime = event.timeStamp;
		grab.velocity = 0;
		grab.travel = 0;
		row.fling = 0;
		target.setPointerCapture?.(event.pointerId);
		target.style.cursor = 'grabbing';
	};

	const handlePointerMove = (event: PointerEvent, index: number) => {
		const row = getRow(index);
		const grab = row.drag;
		if (!grab.active || event.pointerId !== grab.pointerId) return;
		const dx = event.clientX - grab.lastX;
		const dt = Math.max(event.timeStamp - grab.lastTime, 1);
		grab.lastX = event.clientX;
		grab.lastTime = event.timeStamp;
		grab.travel += Math.abs(dx);
		row.baseX.set(row.baseX.get() + dx);
		grab.velocity += ((dx / dt) * 1000 - grab.velocity) * (1 - Math.exp(-dt / 50));
	};

	const handlePointerUp = (event: PointerEvent, index: number) => {
		const row = getRow(index);
		const grab = row.drag;
		if (!grab.active || event.pointerId !== grab.pointerId) return;
		const target = event.currentTarget as HTMLElement;
		grab.active = false;
		const resting = event.timeStamp - grab.lastTime > 90;
		row.fling = resting ? 0 : Math.max(-5000, Math.min(5000, grab.velocity));
		grab.velocity = 0;
		if (target.hasPointerCapture?.(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
		target.style.cursor = 'grab';
	};

	const handleClickCapture = (event: MouseEvent, index: number) => {
		if (getRow(index).drag.travel > 6) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	const sectionStyle = $derived(fadeEdges ? `-webkit-mask-image:${FADE_MASK};mask-image:${FADE_MASK}` : undefined);

	const parallaxStyles = $derived(
		[draggable ? 'cursor:grab;user-select:none;-webkit-user-select:none;touch-action:pan-y' : '', css(parallaxStyle)]
			.filter(Boolean)
			.join(';')
	);

	const typeStyle = $derived(
		[
			fontSize !== undefined
				? `font-size:${typeof fontSize === 'number' ? `${fontSize}px` : fontSize};line-height:1`
				: '',
			fontWeight !== undefined ? `font-weight:${fontWeight}` : '',
			color ? `color:${color}` : ''
		]
			.filter(Boolean)
			.join(';')
	);

	const scrollerStyles = (index: number) =>
		[typeStyle, outlineAlternate && index % 2 !== 0 ? OUTLINE_STYLE : '', css(scrollerStyle)].filter(Boolean).join(';');

	const copies = $derived(Array.from({ length: numCopies }, (_, i) => i));
</script>

<section
	class="w-full"
	role="presentation"
	style={sectionStyle}
	onpointerenter={() => {
		hovered = true;
	}}
	onpointerleave={() => {
		hovered = false;
	}}
>
	{#each texts as text, index (index)}
		<div
			class="{parallaxClassName} relative overflow-hidden"
			role="presentation"
			style={parallaxStyles || undefined}
			onpointerdown={draggable ? (event) => handlePointerDown(event, index) : undefined}
			onpointermove={draggable ? (event) => handlePointerMove(event, index) : undefined}
			onpointerup={draggable ? (event) => handlePointerUp(event, index) : undefined}
			onpointercancel={draggable ? (event) => handlePointerUp(event, index) : undefined}
			onclickcapture={draggable ? (event) => handleClickCapture(event, index) : undefined}
		>
			<div
				bind:this={scrollerEls[index]}
				class="{scrollerClassName} flex whitespace-nowrap text-center font-sans text-4xl font-bold tracking-[-0.02em] drop-shadow md:text-[5rem] md:leading-[5rem]"
				style={scrollerStyles(index) || undefined}
			>
				{#each copies as copy (copy)}
					<span
						class="flex-shrink-0 {className}"
						aria-hidden={copy > 0 ? true : undefined}
						style={!separator && gap > 0 ? `padding-right:${gap}px` : undefined}
						>{text}&nbsp;{#if separator}<span style={gap > 0 ? `margin:0 ${gap / 2}px` : undefined}>{separator}</span>&nbsp;{/if}</span
					>
				{/each}
			</div>
		</div>
	{/each}
</section>
