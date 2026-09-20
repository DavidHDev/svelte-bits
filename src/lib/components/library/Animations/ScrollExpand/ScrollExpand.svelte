<!-- @svelte-bits
{
  "title": "Scroll Expand",
  "description": "A media box that grows to fullscreen as you scroll, with a fading title, hint, and overlay content.",
  "dependencies": []
}
-->
<script lang="ts">
	import { untrack } from 'svelte'

	function clamp(v: number, a: number, b: number): number {
		return v < a ? a : v > b ? b : v
	}

	function smoothstep(edge0: number, edge1: number, x: number): number {
		const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1)
		return t * t * (3 - 2 * t)
	}

	type Props = {
		src?: string
		mediaType?: 'image' | 'video'
		poster?: string
		alt?: string
		title?: string
		scrollHint?: string
		startWidth?: number
		startHeight?: number
		startRadius?: number
		endRadius?: number
		mediaZoom?: number
		scrollDistance?: number
		holdDistance?: number
		smoothing?: number
		overlayScrim?: number
		useWindowScroll?: boolean
		enabled?: boolean
		class?: string
		style?: string
		[key: string]: unknown
	}

	import type { Snippet } from 'svelte'
	type PropsWithChildren = Props & { children?: Snippet }

	let {
		src = '',
		mediaType = 'image',
		poster = '',
		alt = '',
		title = '',
		scrollHint = '',
		startWidth = 42,
		startHeight = 58,
		startRadius = 24,
		endRadius = 0,
		mediaZoom = 1.35,
		scrollDistance = 1.2,
		holdDistance = 0.35,
		smoothing = 0.1,
		overlayScrim = 0.45,
		useWindowScroll = false,
		enabled = true,
		children,
		class: className = '',
		style = '',
		...rest
	}: PropsWithChildren = $props()

	let root!: HTMLElement
	let track!: HTMLDivElement
	let stage!: HTMLDivElement
	let frame!: HTMLDivElement
	let scrim!: HTMLDivElement
	let media: (HTMLImageElement | HTMLVideoElement) | undefined = $state()
	let titleEl: HTMLDivElement | undefined = $state()
	let overlay: HTMLDivElement | undefined = $state()
	let hint: HTMLDivElement | undefined = $state()

	function applyProgress(p: number) {
		if (!frame || !media) return

		const e = smoothstep(0, 1, p)

		const w = startWidth + (100 - startWidth) * e
		const h = startHeight + (100 - startHeight) * e
		const ix = Math.max(0, (100 - w) / 2)
		const iy = Math.max(0, (100 - h) / 2)
		const r = startRadius + (endRadius - startRadius) * e
		frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`

		media.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * e})`

		if (scrim) scrim.style.opacity = `${overlayScrim * e}`

		if (titleEl) {
			const out = smoothstep(0.4, 0.88, p)
			titleEl.style.opacity = `${1 - out}`
			titleEl.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`
		}

		if (hint) {
			const gone = smoothstep(0, 0.12, p)
			hint.style.opacity = `${1 - gone}`
			hint.style.transform = `translate3d(0, ${8 * gone}px, 0)`
		}

		if (overlay) {
			const inn = smoothstep(0.68, 1, p)
			overlay.style.opacity = `${inn}`
			overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`
		}
	}

	$effect(() => {
		if (!root || !track || !stage) return

		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches

		let raf = 0
		let current = 0
		let target = 0
		let stageH = 0
		let running = false

		const measure = () => {
			stageH = useWindowScroll ? window.innerHeight : root.clientHeight
			if (stageH <= 0) return
			stage.style.height = `${stageH}px`
			track.style.height = `${stageH * (1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance))}px`

			const w = root.clientWidth || stageH
			stage.style.setProperty(
				'--se-title-size',
				`${clamp(w * 0.075, 20, 84)}px`,
			)
		}

		const readProgress = () => {
			if (!enabled) return 1
			const span = stageH * Math.max(0.01, scrollDistance)
			if (useWindowScroll) {
				const top = track.getBoundingClientRect().top
				return clamp(-top / span, 0, 1)
			}
			return clamp(root.scrollTop / span, 0, 1)
		}

		const tick = () => {
			const k = smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing))
			current += (target - current) * k
			if (Math.abs(target - current) < 0.0004) {
				current = target
				running = false
			}
			applyProgress(current)
			raf = running ? requestAnimationFrame(tick) : 0
		}

		const kick = () => {
			if (running) return
			running = true
			if (!raf) raf = requestAnimationFrame(tick)
		}

		const onScroll = () => {
			target = readProgress()
			if (smoothing <= 0 || reduceMotion) {
				current = target
				applyProgress(current)
				return
			}
			kick()
		}

		const onResize = () => {
			measure()
			target = readProgress()
			current = target
			applyProgress(current)
		}

		untrack(() => {
			measure()
			target = readProgress()
			current = target
			applyProgress(current)
		})

		const scroller = useWindowScroll ? window : root
		scroller.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onResize)
		const ro = new ResizeObserver(onResize)
		ro.observe(root)

		return () => {
			if (raf) cancelAnimationFrame(raf)
			scroller.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onResize)
			ro.disconnect()
		}
	})
</script>

<div
	bind:this={root}
	class="relative h-full w-full {useWindowScroll
		? ''
		: 'overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'} {className}"
	{style}
	{...rest}
>
	<div bind:this={track} class="relative w-full">
		<div
			bind:this={stage}
			class="sticky top-0 w-full overflow-hidden [--se-title-size:4rem]"
		>
			<div
				bind:this={frame}
				class="absolute inset-0 [clip-path:inset(21%_29%_21%_29%_round_24px)] [will-change:clip-path]"
			>
				{#if mediaType === 'video'}
					<video
						bind:this={media}
						class="absolute inset-0 h-full w-full origin-center select-none object-cover [will-change:transform]"
						{src}
						{poster}
						autoplay
						muted
						loop
						playsinline
					></video>
				{:else}
					<img
						bind:this={media}
						class="absolute inset-0 h-full w-full origin-center select-none object-cover [will-change:transform]"
						{src}
						{alt}
						draggable="false"
					/>
				{/if}
				<div
					bind:this={scrim}
					class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35))] opacity-0"
				></div>
				{#if children}
					<div
						bind:this={overlay}
						class="absolute inset-0 flex flex-col items-center justify-center p-[6%] text-center opacity-0 [will-change:opacity,transform]"
					>
						{@render children()}
					</div>
				{/if}
			</div>
			{#if title}
				<div
					bind:this={titleEl}
					class="pointer-events-none absolute inset-0 m-0 flex items-center justify-center px-[6%] text-center leading-none font-bold tracking-[-0.03em] text-white [font-size:var(--se-title-size)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] [will-change:opacity,transform]"
				>
					{title}
				</div>
			{/if}
			{#if scrollHint}
				<div
					bind:this={hint}
					class="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[0.8125rem] tracking-[0.02em] text-white/55 [will-change:opacity,transform]"
				>
					{scrollHint}
				</div>
			{/if}
		</div>
	</div>
</div>
