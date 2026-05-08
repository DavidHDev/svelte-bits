<!-- @svelte-bits
{
  "title": "Variable Proximity",
  "description": "Per-letter variable-font interpolation that responds to cursor proximity inside a container, with linear, exponential or gaussian falloff.",
  "dependencies": []
}
-->
<script lang="ts">
	type Falloff = 'linear' | 'exponential' | 'gaussian';

	type Props = {
		label?: string;
		fromFontVariationSettings?: string;
		toFontVariationSettings?: string;
		containerRef?: HTMLElement | null;
		radius?: number;
		falloff?: Falloff;
		class?: string;
		style?: string;
		onclick?: (e: MouseEvent) => void;
	};

	let {
		label = '',
		fromFontVariationSettings = "'wght' 400, 'opsz' 9",
		toFontVariationSettings = "'wght' 800, 'opsz' 40",
		containerRef = null,
		radius = 50,
		falloff = 'linear',
		class: className = '',
		style = '',
		onclick
	}: Props = $props();

	let letterEls: (HTMLSpanElement | null)[] = [];

	const parsedSettings = $derived.by(() => {
		const parse = (s: string) =>
			new Map(
				s
					.split(',')
					.map((p) => p.trim())
					.filter(Boolean)
					.map((p) => {
						const [name, value] = p.split(/\s+/);
						return [name.replace(/['"]/g, ''), parseFloat(value)] as const;
					})
			);
		const from = parse(fromFontVariationSettings);
		const to = parse(toFontVariationSettings);
		return Array.from(from.entries()).map(([axis, fromValue]) => ({
			axis,
			fromValue,
			toValue: to.get(axis) ?? fromValue
		}));
	});

	const words = $derived(label.split(' '));
	const wordOffsets = $derived.by(() => {
		const offsets: number[] = [];
		let n = 0;
		for (const w of words) {
			offsets.push(n);
			n += w.length;
		}
		return offsets;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!containerRef) return;

		const mouse = { x: 0, y: 0 };
		let last = { x: NaN, y: NaN };

		const updatePosition = (clientX: number, clientY: number) => {
			const rect = containerRef!.getBoundingClientRect();
			mouse.x = clientX - rect.left;
			mouse.y = clientY - rect.top;
		};
		const onMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY);
		const onTouchMove = (e: TouchEvent) => {
			const t = e.touches[0];
			if (t) updatePosition(t.clientX, t.clientY);
		};
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('touchmove', onTouchMove, { passive: true });

		const calcFalloff = (distance: number) => {
			const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
			if (falloff === 'exponential') return norm ** 2;
			if (falloff === 'gaussian') return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
			return norm;
		};

		let raf = 0;
		const tick = () => {
			if (!containerRef) {
				raf = requestAnimationFrame(tick);
				return;
			}
			if (mouse.x === last.x && mouse.y === last.y) {
				raf = requestAnimationFrame(tick);
				return;
			}
			last = { x: mouse.x, y: mouse.y };
			const containerRect = containerRef.getBoundingClientRect();

			letterEls.forEach((el) => {
				if (!el) return;
				const rect = el.getBoundingClientRect();
				const cx = rect.left + rect.width / 2 - containerRect.left;
				const cy = rect.top + rect.height / 2 - containerRect.top;
				const dx = mouse.x - cx;
				const dy = mouse.y - cy;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance >= radius) {
					el.style.fontVariationSettings = fromFontVariationSettings;
					return;
				}
				const f = calcFalloff(distance);
				const settings = parsedSettings
					.map(({ axis, fromValue, toValue }) => {
						const v = fromValue + (toValue - fromValue) * f;
						return `'${axis}' ${v}`;
					})
					.join(', ');
				el.style.fontVariationSettings = settings;
			});

			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('touchmove', onTouchMove);
		};
	});

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="variable-proximity {className}" {style} {onclick}>
	{#each words as word, wIdx (wIdx)}
		{@const letters = word.split('')}
		<span class="vp-word">
			{#each letters as letter, lIdx (lIdx)}
				{@const idx = wordOffsets[wIdx] + lIdx}
				<span
					class="vp-letter"
					bind:this={letterEls[idx]}
					aria-hidden="true"
					style:font-variation-settings={fromFontVariationSettings}
				>{letter}</span>
			{/each}
			{#if wIdx < words.length - 1}
				<span class="vp-space">&nbsp;</span>
			{/if}
		</span>
	{/each}
	<span class="sr-only">{label}</span>
</span>

<style>
	.variable-proximity {
		display: inline;
		font-family: 'Roboto Flex', sans-serif;
	}
	.vp-word {
		display: inline-block;
		white-space: nowrap;
	}
	.vp-letter {
		display: inline-block;
	}
	.vp-space {
		display: inline-block;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
