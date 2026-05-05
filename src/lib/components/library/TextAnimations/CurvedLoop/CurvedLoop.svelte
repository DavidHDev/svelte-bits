<!-- @svelte-bits
{
  "title": "Curved Loop",
  "description": "Marquee text rendered along a curved SVG path that scrolls infinitely and can be dragged for interactive control.",
  "dependencies": []
}
-->
<script lang="ts">
	type Direction = 'left' | 'right';

	type Props = {
		marqueeText?: string;
		speed?: number;
		class?: string;
		curveAmount?: number;
		direction?: Direction;
		interactive?: boolean;
	};

	let {
		marqueeText = '',
		speed = 2,
		class: className = '',
		curveAmount = 400,
		direction = 'left',
		interactive = true
	}: Props = $props();

	const text = $derived.by(() => {
		const hasTrailing = /\s|\u00A0$/.test(marqueeText);
		return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + ' ';
	});

	let measureEl: SVGTextElement | undefined = $state();
	let textPathEl: SVGTextPathElement | undefined = $state();
	let spacing = $state(0);
	let offset = $state(0);
	let isDragging = $state(false);

	const uid = $props.id();
	const pathId = `curve-${uid}`;
	const pathD = $derived(`M-100,40 Q500,${40 + curveAmount} 1540,40`);

	let dragActive = false;
	let lastX = 0;
	let velX = 0;
	// svelte-ignore state_referenced_locally
	let dirInternal: Direction = direction;

	$effect(() => {
		dirInternal = direction;
	});

	const totalText = $derived.by(() => {
		const len = spacing;
		if (!len) return text;
		return Array(Math.ceil(1800 / len) + 2)
			.fill(text)
			.join('');
	});
	const ready = $derived(spacing > 0);

	$effect(() => {
		void text;
		void className;
		if (measureEl) {
			spacing = measureEl.getComputedTextLength();
		}
	});

	$effect(() => {
		if (!spacing) return;
		if (textPathEl) {
			const initial = -spacing;
			textPathEl.setAttribute('startOffset', initial + 'px');
			offset = initial;
		}
	});

	$effect(() => {
		if (!spacing || !ready) return;
		void speed;
		let frame = 0;
		const step = () => {
			if (!dragActive && textPathEl) {
				const delta = dirInternal === 'right' ? speed : -speed;
				const currentOffset = parseFloat(textPathEl.getAttribute('startOffset') || '0');
				let newOffset = currentOffset + delta;

				const wrapPoint = spacing;
				if (newOffset <= -wrapPoint) newOffset += wrapPoint;
				if (newOffset > 0) newOffset -= wrapPoint;

				textPathEl.setAttribute('startOffset', newOffset + 'px');
				offset = newOffset;
			}
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	});

	function onPointerDown(e: PointerEvent) {
		if (!interactive) return;
		dragActive = true;
		isDragging = true;
		lastX = e.clientX;
		velX = 0;
		(e.target as Element)?.setPointerCapture?.(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!interactive || !dragActive || !textPathEl) return;
		const dx = e.clientX - lastX;
		lastX = e.clientX;
		velX = dx;

		const currentOffset = parseFloat(textPathEl.getAttribute('startOffset') || '0');
		let newOffset = currentOffset + dx;

		const wrapPoint = spacing;
		if (newOffset <= -wrapPoint) newOffset += wrapPoint;
		if (newOffset > 0) newOffset -= wrapPoint;

		textPathEl.setAttribute('startOffset', newOffset + 'px');
		offset = newOffset;
	}

	function endDrag() {
		if (!interactive) return;
		dragActive = false;
		isDragging = false;
		dirInternal = velX > 0 ? 'right' : 'left';
	}

	const cursorStyle = $derived(interactive ? (isDragging ? 'grabbing' : 'grab') : 'auto');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="curved-loop-jacket"
	style:visibility={ready ? 'visible' : 'hidden'}
	style:cursor={cursorStyle}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={endDrag}
	onpointerleave={endDrag}
>
	<svg class="curved-loop-svg" viewBox="0 0 1440 120">
		<text
			bind:this={measureEl}
			xml:space="preserve"
			style="visibility:hidden;opacity:0;pointer-events:none;"
		>{text}</text>
		<defs>
			<path id={pathId} d={pathD} fill="none" stroke="transparent" />
		</defs>
		{#if ready}
			<text font-weight="bold" xml:space="preserve" class={className}>
				<textPath
					bind:this={textPathEl}
					href={`#${pathId}`}
					startOffset={offset + 'px'}
					xml:space="preserve">{totalText}</textPath>
			</text>
		{/if}
	</svg>
</div>

<style>
	.curved-loop-jacket {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.curved-loop-svg {
		user-select: none;
		width: 100%;
		aspect-ratio: 100 / 12;
		overflow: visible;
		display: block;
		font-size: 6rem;
		fill: #ffffff;
		-moz-user-select: none;
		-webkit-user-select: none;
		font-weight: 700;
		text-transform: uppercase;
		line-height: 1;
	}
</style>
