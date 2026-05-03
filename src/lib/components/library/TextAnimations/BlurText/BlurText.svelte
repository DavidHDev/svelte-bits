<!-- @svelte-bits
{
  "title": "Blur Text",
  "description": "Per-word/letter blur-in animation triggered when scrolled into view, with configurable direction, easing and stepped keyframes.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { animate } from 'motion';

	type AnimSnap = Record<string, string | number>;

	type Props = {
		text?: string;
		delay?: number;
		class?: string;
		animateBy?: 'words' | 'letters';
		direction?: 'top' | 'bottom';
		threshold?: number;
		rootMargin?: string;
		animationFrom?: AnimSnap;
		animationTo?: AnimSnap[];
		easing?:
			| string
			| number[]
			| ((t: number) => number);
		onAnimationComplete?: () => void;
		stepDuration?: number;
	};

	let {
		text = '',
		delay = 200,
		class: className = '',
		animateBy = 'words',
		direction = 'top',
		threshold = 0.1,
		rootMargin = '0px',
		animationFrom,
		animationTo,
		easing = (t: number) => t,
		onAnimationComplete,
		stepDuration = 0.35
	}: Props = $props();

	const elements = $derived(animateBy === 'words' ? text.split(' ') : text.split(''));

	let inView = $state(false);
	let containerEl: HTMLParagraphElement | undefined = $state();
	let spanEls: (HTMLSpanElement | undefined)[] = $state([]);

	$effect(() => {
		if (!containerEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					inView = true;
					if (containerEl) observer.unobserve(containerEl);
				}
			},
			{ threshold, rootMargin }
		);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	const defaultFrom = $derived<AnimSnap>(
		direction === 'top'
			? { filter: 'blur(10px)', opacity: 0, y: -50 }
			: { filter: 'blur(10px)', opacity: 0, y: 50 }
	);

	const defaultTo = $derived<AnimSnap[]>([
		{ filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
		{ filter: 'blur(0px)', opacity: 1, y: 0 }
	]);

	const fromSnapshot = $derived<AnimSnap>(animationFrom ?? defaultFrom);
	const toSnapshots = $derived<AnimSnap[]>(animationTo ?? defaultTo);

	function buildKeyframes(from: AnimSnap, steps: AnimSnap[]): Record<string, Array<string | number>> {
		const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
		const out: Record<string, Array<string | number>> = {};
		keys.forEach((k) => {
			out[k] = [from[k], ...steps.map((s) => s[k])];
		});
		return out;
	}

	function applyInitial(el: HTMLElement, snap: AnimSnap) {
		const props: Record<string, string> = {};
		for (const [k, v] of Object.entries(snap)) {
			if (k === 'y') {
				props.transform = `translateY(${typeof v === 'number' ? v + 'px' : v})`;
			} else if (k === 'x') {
				props.transform = `${props.transform ?? ''} translateX(${typeof v === 'number' ? v + 'px' : v})`.trim();
			} else if (k === 'filter') {
				props.filter = String(v);
			} else if (k === 'opacity') {
				props.opacity = String(v);
			} else {
				(el.style as unknown as Record<string, string>)[k] = String(v);
			}
		}
		if (props.transform) el.style.transform = props.transform;
		if (props.filter !== undefined) el.style.filter = props.filter;
		if (props.opacity !== undefined) el.style.opacity = props.opacity;
	}

	// Set initial styles immediately on mount
	$effect(() => {
		// re-run when snapshots change
		void fromSnapshot;
		spanEls.forEach((el) => el && applyInitial(el, fromSnapshot));
	});

	$effect(() => {
		if (!inView) return;

		const stepCount = toSnapshots.length + 1;
		const totalDuration = stepDuration * (stepCount - 1);
		const times = Array.from({ length: stepCount }, (_, i) =>
			stepCount === 1 ? 0 : i / (stepCount - 1)
		);

		const kf = buildKeyframes(fromSnapshot, toSnapshots);

		// Build per-property keyframe arrays with `y` mapped to translateY transform
		const animations: Array<{ stop: () => void }> = [];

		spanEls.forEach((el, index) => {
			if (!el) return;

			const targetKeyframes: Record<string, Array<string | number>> = {};
			for (const [k, frames] of Object.entries(kf)) {
				if (k === 'y') {
					targetKeyframes.transform = frames.map((v) =>
						`translateY(${typeof v === 'number' ? v + 'px' : v})`
					);
				} else {
					targetKeyframes[k] = frames;
				}
			}

			const controls = animate(el, targetKeyframes as never, {
				duration: totalDuration,
				times,
				delay: (index * delay) / 1000,
				ease: easing as never
			});

			if (index === elements.length - 1 && onAnimationComplete) {
				const finished = (controls as unknown as { finished?: Promise<unknown> }).finished;
				if (finished && typeof finished.then === 'function') {
					finished.then(() => onAnimationComplete?.()).catch(() => {});
				}
			}

			animations.push({
				stop: () => {
					const c = controls as unknown as { stop?: () => void; cancel?: () => void };
					c.stop?.();
					c.cancel?.();
				}
			});
		});

		return () => {
			animations.forEach((a) => a.stop());
		};
	});
</script>

<p bind:this={containerEl} class="blur-text {className} flex flex-wrap">
	{#each elements as segment, index (index)}
		<span
			bind:this={spanEls[index]}
			style:display="inline-block"
			style:will-change="transform, filter, opacity"
		>
			{segment === ' ' ? '\u00A0' : segment}{animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
		</span>
	{/each}
</p>
