<!-- @svelte-bits
{
  "title": "Logo Loop",
  "description": "Smooth, infinite, pause-on-hover marquee for partner logos with optional fade-out edges.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type LogoItem = {
		src: string;
		alt?: string;
		href?: string;
		title?: string;
		srcSet?: string;
		sizes?: string;
		width?: number;
		height?: number;
	};

	const SMOOTH_TAU = 0.25;
	const MIN_COPIES = 2;
	const COPY_HEADROOM = 2;

	const toCss = (v?: number | string) => (typeof v === 'number' ? `${v}px` : v);
</script>

<script lang="ts">
	type Props = {
		logos: LogoItem[];
		speed?: number;
		direction?: 'left' | 'right' | 'up' | 'down';
		width?: number | string;
		logoHeight?: number;
		gap?: number;
		pauseOnHover?: boolean;
		hoverSpeed?: number;
		fadeOut?: boolean;
		fadeOutColor?: string;
		scaleOnHover?: boolean;
		ariaLabel?: string;
		class?: string;
		style?: string;
	};

	let {
		logos,
		speed = 120,
		direction = 'left',
		width = '100%',
		logoHeight = 28,
		gap = 32,
		pauseOnHover,
		hoverSpeed,
		fadeOut = false,
		fadeOutColor,
		scaleOnHover = false,
		ariaLabel = 'Partner logos',
		class: className = '',
		style = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let track: HTMLDivElement;
	let seq: HTMLUListElement;
	let seqWidth = $state(0);
	let seqHeight = $state(0);
	let copyCount = $state(MIN_COPIES);
	let isHovered = $state(false);

	const isVertical = $derived(direction === 'up' || direction === 'down');
	const effectiveHoverSpeed = $derived(
		hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0
	);
	const targetVelocity = $derived.by(() => {
		const mag = Math.abs(speed);
		const dirMul = isVertical ? (direction === 'up' ? 1 : -1) : direction === 'left' ? 1 : -1;
		const sign = speed < 0 ? -1 : 1;
		return mag * dirMul * sign;
	});

	function update() {
		if (!container || !seq) return;
		const cw = container.clientWidth ?? 0;
		const r = seq.getBoundingClientRect();
		if (isVertical) {
			const ph = container.parentElement?.clientHeight ?? 0;
			if (container && ph > 0) {
				const t = Math.ceil(ph);
				if (container.style.height !== `${t}px`) container.style.height = `${t}px`;
			}
			if (r.height > 0) {
				seqHeight = Math.ceil(r.height);
				const viewport = container.clientHeight || ph || r.height;
				copyCount = Math.max(MIN_COPIES, Math.ceil(viewport / r.height) + COPY_HEADROOM);
			}
		} else if (r.width > 0) {
			seqWidth = Math.ceil(r.width);
			copyCount = Math.max(MIN_COPIES, Math.ceil(cw / r.width) + COPY_HEADROOM);
		}
	}

	$effect(() => {
		void logos;
		void gap;
		void logoHeight;
		void isVertical;
		if (!container || !seq) return;
		const ro = new ResizeObserver(update);
		ro.observe(container);
		ro.observe(seq);
		update();
		// preload images
		const imgs = seq.querySelectorAll('img');
		let pending = imgs.length;
		const onLoad = () => {
			pending -= 1;
			if (pending <= 0) update();
		};
		imgs.forEach((img) => {
			const i = img as HTMLImageElement;
			if (i.complete) onLoad();
			else {
				i.addEventListener('load', onLoad, { once: true });
				i.addEventListener('error', onLoad, { once: true });
			}
		});
		return () => ro.disconnect();
	});

	$effect(() => {
		if (!track) return;
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const seqSize = isVertical ? seqHeight : seqWidth;
		let raf = 0;
		let last: number | null = null;
		let offset = 0;
		let velocity = 0;

		if (seqSize > 0) {
			offset = ((offset % seqSize) + seqSize) % seqSize;
			track.style.transform = isVertical
				? `translate3d(0, ${-offset}px, 0)`
				: `translate3d(${-offset}px, 0, 0)`;
		}

		if (reduced) {
			track.style.transform = 'translate3d(0, 0, 0)';
			return;
		}

		const animate = (t: number) => {
			if (last === null) last = t;
			const dt = Math.max(0, t - last) / 1000;
			last = t;
			const target = isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
			const ef = 1 - Math.exp(-dt / SMOOTH_TAU);
			velocity += (target - velocity) * ef;
			if (seqSize > 0) {
				let next = offset + velocity * dt;
				next = ((next % seqSize) + seqSize) % seqSize;
				offset = next;
				track.style.transform = isVertical
					? `translate3d(0, ${-offset}px, 0)`
					: `translate3d(${-offset}px, 0, 0)`;
			}
			raf = requestAnimationFrame(animate);
		};
		raf = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(raf);
	});

	const cssVars = $derived(
		`--logoloop-gap:${gap}px;--logoloop-logoHeight:${logoHeight}px;${fadeOutColor ? `--logoloop-fadeColor:${fadeOutColor};` : ''}--logoloop-fadeColorAuto:#0b0b0b;`
	);
	const widthStyle = $derived.by(() => {
		const w = toCss(width);
		if (isVertical) return w && w !== '100%' ? `width:${w};` : '';
		return `width:${w ?? '100%'};`;
	});
</script>

<div
	bind:this={container}
	class="relative group {isVertical ? 'overflow-hidden h-full inline-block' : 'overflow-x-hidden'} {scaleOnHover ? 'py-[calc(var(--logoloop-logoHeight)*0.1)]' : ''} {className}"
	style="{cssVars}{widthStyle}{style}"
	role="region"
	aria-label={ariaLabel}
>
	{#if fadeOut}
		{#if isVertical}
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(24px,8%,120px)]"
				style="background:linear-gradient(to bottom, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"
			></div>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(24px,8%,120px)]"
				style="background:linear-gradient(to top, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"
			></div>
		{:else}
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)]"
				style="background:linear-gradient(to right, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"
			></div>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)]"
				style="background:linear-gradient(to left, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0,0,0,0) 100%);"
			></div>
		{/if}
	{/if}

	<div
		bind:this={track}
		class="flex will-change-transform select-none relative z-0 {isVertical ? 'flex-col h-max w-full' : 'flex-row w-max'}"
		onmouseenter={() => {
			if (effectiveHoverSpeed !== undefined) isHovered = true;
		}}
		onmouseleave={() => {
			if (effectiveHoverSpeed !== undefined) isHovered = false;
		}}
		role="presentation"
	>
		{#each Array(copyCount) as _, copyIndex (copyIndex)}
			<ul
				bind:this={seq}
				class="flex items-center {isVertical ? 'flex-col' : ''}"
				role="list"
				aria-hidden={copyIndex > 0}
			>
				{#each logos as item, i (i)}
					<li
						class="flex-none text-[length:var(--logoloop-logoHeight)] leading-[1] {isVertical
							? 'mb-[var(--logoloop-gap)]'
							: 'mr-[var(--logoloop-gap)]'} {scaleOnHover ? 'overflow-visible group/item' : ''}"
						role="listitem"
					>
						{#if item.href}
							<a
								class="inline-flex items-center no-underline rounded transition-opacity duration-200 hover:opacity-80"
								href={item.href}
								aria-label={item.alt ?? item.title ?? 'logo link'}
								target="_blank"
								rel="noreferrer noopener"
							>
								<img
									class="h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none {scaleOnHover
										? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
										: ''}"
									src={item.src}
									srcset={item.srcSet}
									sizes={item.sizes}
									width={item.width}
									height={item.height}
									alt={item.alt ?? ''}
									title={item.title}
									loading="lazy"
									decoding="async"
									draggable="false"
								/>
							</a>
						{:else}
							<img
								class="h-[var(--logoloop-logoHeight)] w-auto block object-contain pointer-events-none {scaleOnHover
									? 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-[1.2]'
									: ''}"
								src={item.src}
								srcset={item.srcSet}
								sizes={item.sizes}
								width={item.width}
								height={item.height}
								alt={item.alt ?? ''}
								title={item.title}
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
						{/if}
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</div>
