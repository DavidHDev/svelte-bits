<!-- @svelte-bits
{
  "title": "Text Pressure",
  "description": "Variable-font heading where each character reacts to cursor proximity by morphing its width, weight, italic and opacity axes.",
  "dependencies": []
}
-->
<script lang="ts">
	type Props = {
		text?: string;
		fontFamily?: string;
		fontUrl?: string;
		width?: boolean;
		weight?: boolean;
		italic?: boolean;
		alpha?: boolean;
		flex?: boolean;
		stroke?: boolean;
		scale?: boolean;
		textColor?: string;
		strokeColor?: string;
		class?: string;
		minFontSize?: number;
	};

	let {
		text = 'Compressa',
		fontFamily = 'Compressa VF',
		fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
		width = true,
		weight = true,
		italic = true,
		alpha = false,
		flex = true,
		stroke = false,
		scale = false,
		textColor = '#FFFFFF',
		strokeColor = '#FF0000',
		class: className = '',
		minFontSize = 24
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let titleEl: HTMLHeadingElement | undefined = $state();
	let spans: (HTMLSpanElement | null)[] = [];

	// svelte-ignore state_referenced_locally
	let fontSize = $state(minFontSize);
	let scaleY = $state(1);
	let lineHeight = $state(1);

	const chars = $derived(text.split(''));

	$effect(() => {
		if (typeof document === 'undefined') return;
		try {
			const face = new FontFace(fontFamily, `url(${fontUrl})`);
			face.load().then((loaded) => document.fonts.add(loaded)).catch(() => {});
		} catch {
			// FontFace unsupported — silently skip; the fallback family kicks in.
		}
	});

	$effect(() => {
		const mouse = { x: 0, y: 0 };
		const cursor = { x: 0, y: 0 };

		const handleMouseMove = (e: MouseEvent) => {
			cursor.x = e.clientX;
			cursor.y = e.clientY;
		};
		const handleTouchMove = (e: TouchEvent) => {
			const t = e.touches[0];
			if (!t) return;
			cursor.x = t.clientX;
			cursor.y = t.clientY;
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchmove', handleTouchMove, { passive: true });

		if (containerEl) {
			const { left, top, width: w, height: h } = containerEl.getBoundingClientRect();
			mouse.x = left + w / 2;
			mouse.y = top + h / 2;
			cursor.x = mouse.x;
			cursor.y = mouse.y;
		}

		const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			return Math.sqrt(dx * dx + dy * dy);
		};

		const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
			const val = maxVal - Math.abs((maxVal * distance) / maxDist);
			return Math.max(minVal, val + minVal);
		};

		let rafId = 0;
		const animate = () => {
			mouse.x += (cursor.x - mouse.x) / 15;
			mouse.y += (cursor.y - mouse.y) / 15;

			if (titleEl) {
				const titleRect = titleEl.getBoundingClientRect();
				const maxDist = titleRect.width / 2;

				spans.forEach((span) => {
					if (!span) return;
					const rect = span.getBoundingClientRect();
					const charCenter = {
						x: rect.x + rect.width / 2,
						y: rect.y + rect.height / 2
					};
					const d = dist(mouse, charCenter);

					const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
					const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
					const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
					const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

					const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
					if (span.style.fontVariationSettings !== newFontVariationSettings) {
						span.style.fontVariationSettings = newFontVariationSettings;
					}
					if (alpha && span.style.opacity !== alphaVal) {
						span.style.opacity = alphaVal;
					}
				});
			}

			rafId = requestAnimationFrame(animate);
		};
		rafId = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchmove', handleTouchMove);
			cancelAnimationFrame(rafId);
		};
	});

	$effect(() => {
		void chars.length;
		void minFontSize;
		void scale;

		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const setSize = () => {
			if (!containerEl || !titleEl) return;
			const { width: containerW, height: containerH } = containerEl.getBoundingClientRect();
			let newFontSize = containerW / (chars.length / 2);
			newFontSize = Math.max(newFontSize, minFontSize);
			fontSize = newFontSize;
			scaleY = 1;
			lineHeight = 1;

			requestAnimationFrame(() => {
				if (!titleEl) return;
				const textRect = titleEl.getBoundingClientRect();
				if (scale && textRect.height > 0) {
					const yRatio = containerH / textRect.height;
					scaleY = yRatio;
					lineHeight = yRatio;
				}
			});
		};

		const debounced = () => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(setSize, 100);
		};

		setSize();
		window.addEventListener('resize', debounced);
		return () => {
			window.removeEventListener('resize', debounced);
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
</script>

<div bind:this={containerEl} class="text-pressure-container">
	<h1
		bind:this={titleEl}
		class="text-pressure-title {className} {flex ? 'flex-layout' : ''} {stroke ? 'has-stroke' : ''}"
		style="font-family:{fontFamily};font-size:{fontSize}px;line-height:{lineHeight};transform:scale(1, {scaleY});color:{textColor};--text-pressure-stroke:{strokeColor};"
	>
		{#each chars as char, i (i)}
			<span
				bind:this={spans[i]}
				data-char={char}
				style="display:inline-block;color:{stroke ? 'inherit' : textColor};"
			>
				{char}
			</span>
		{/each}
	</h1>
</div>

<style>
	.text-pressure-container {
		position: relative;
		width: 100%;
		height: 100%;
		background: transparent;
	}

	.text-pressure-title {
		text-transform: uppercase;
		transform-origin: center top;
		margin: 0;
		text-align: center;
		user-select: none;
		white-space: nowrap;
		font-weight: 100;
		width: 100%;
	}

	.text-pressure-title.flex-layout {
		display: flex;
		justify-content: space-between;
	}

	.text-pressure-title.has-stroke span {
		position: relative;
	}

	.text-pressure-title.has-stroke span::after {
		content: attr(data-char);
		position: absolute;
		left: 0;
		top: 0;
		color: transparent;
		z-index: -1;
		-webkit-text-stroke-width: 3px;
		-webkit-text-stroke-color: var(--text-pressure-stroke, #ff0000);
	}
</style>
