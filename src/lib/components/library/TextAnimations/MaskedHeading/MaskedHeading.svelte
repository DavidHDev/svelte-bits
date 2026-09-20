<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'
	import { gsap } from 'gsap'

	const clamp = (v: number, a: number, b: number): number =>
		v < a ? a : v > b ? b : v

	type Reveal = 'rise' | 'wipe' | 'fade' | 'none'
	type Trigger = 'view' | 'mount' | 'hover'

	export interface MaskedHeadingProps {
		text?: string
		tag?: keyof SvelteHTMLElements
		mediaType?: 'image' | 'video'
		src?: string
		poster?: string
		fillScale?: number
		parallax?: number
		drift?: number
		brightness?: number
		saturation?: number
		grayscale?: boolean
		reveal?: Reveal
		duration?: number
		stagger?: number
		trigger?: Trigger
		align?: 'left' | 'center' | 'right'
		weight?: number
		tracking?: number
		lineHeight?: number
		textScale?: number
		class?: string
		style?: string
		[key: string]: unknown
	}

	let {
		text = 'Designed in the details',
		tag = 'h2',
		mediaType = 'image',
		src = '',
		poster = '',
		fillScale = 1.25,
		parallax = 26,
		drift = 18,
		brightness = 1,
		saturation = 1,
		grayscale = false,
		reveal = 'rise',
		duration = 1.1,
		stagger = 0.09,
		trigger = 'view',
		align = 'center',
		weight = 700,
		tracking = -0.03,
		lineHeight = 1.06,
		textScale = 0.115,
		class: className = '',
		style = '',
		...rest
	}: MaskedHeadingProps = $props()

	let root!: HTMLElement
	let measure!: HTMLSpanElement
	let revealLayer!: HTMLSpanElement
	let media!: HTMLSpanElement
	let wordEls: HTMLSpanElement[] = []
	let baseEls: HTMLSpanElement[] = []
	let glyphEls: SVGTextElement[] = []

	function useId() {
		return Math.random().toString(36).substring(2, 10)
	}

	const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
	const words = $derived(String(text).split(/\s+/).filter(Boolean))
	function place(offset: { x: number; y: number }) {
		if (!root || !media) return

		const W = root.clientWidth
		const H = root.clientHeight

		const maxX = Math.max(0, ((fillScale - 1) / 2) * W)
		const maxY = Math.max(0, ((fillScale - 1) / 2) * H)
		const x = clamp(offset.x, -maxX, maxX).toFixed(2)
		const y = clamp(offset.y, -maxY, maxY).toFixed(2)

		media.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${fillScale})`
		media.style.filter = `brightness(${brightness}) saturate(${saturation})${grayscale ? ' grayscale(1)' : ''}`
	}

	function sync() {
		if (!root || !measure) return

		root.style.fontSize = `${clamp(root.clientWidth * textScale, 20, 200).toFixed(1)}px`

		const cs = window.getComputedStyle(measure)
		for (let i = 0; i < words.length; i++) {
			const box = wordEls[i]
			const base = baseEls[i]
			const glyph = glyphEls[i]
			if (!box || !base || !glyph) continue
			glyph.setAttribute('x', `${box.offsetLeft}`)
			glyph.setAttribute('y', `${base.offsetTop}`)
			glyph.style.fontFamily = cs.fontFamily
			glyph.style.fontSize = cs.fontSize
			glyph.style.fontWeight = cs.fontWeight
			glyph.style.fontStyle = cs.fontStyle
			glyph.style.letterSpacing = cs.letterSpacing
		}
		place({ x: 0, y: 0 })
	}

	$effect(() => {
		if (!root) return

		sync()
		const ro = new ResizeObserver(sync)
		ro.observe(root)

		document.fonts?.ready?.then(sync).catch(() => {})

		let raf = 0
		let last = performance.now()
		let clock = 0
		const offset = { x: 0, y: 0, tx: 0, ty: 0 }

		const frame = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000)
			last = now
			clock += dt

			const dx = Math.sin(clock * 0.21) * drift
			const dy = Math.cos(clock * 0.17) * drift * 0.6

			const ease = 1 - Math.exp(-dt / 0.18)
			offset.x += (offset.tx + dx - offset.x) * ease
			offset.y += (offset.ty + dy - offset.y) * ease

			place(offset)
			raf = requestAnimationFrame(frame)
		}

		const onMove = (e: PointerEvent) => {
			if (parallax <= 0) return
			const r = root.getBoundingClientRect()
			const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1
			const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1
			offset.tx = clamp(nx, -1, 1) * -parallax
			offset.ty = clamp(ny, -1, 1) * -parallax
		}

		const onLeave = () => {
			offset.tx = 0
			offset.ty = 0
		}

		root.addEventListener('pointermove', onMove)
		root.addEventListener('pointerleave', onLeave)
		raf = requestAnimationFrame(frame)

		return () => {
			cancelAnimationFrame(raf)
			ro.disconnect()
			root.removeEventListener('pointermove', onMove)
			root.removeEventListener('pointerleave', onLeave)
		}
	})

	$effect(() => {
		void [words, tag, align, weight, tracking, lineHeight, textScale]
		sync()
	})

	$effect(() => {
		if (!root || !revealLayer) return
		const glyphs = glyphEls.filter(Boolean)
		if (!glyphs.length) return

		const riseDistance = () =>
			(parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15

		const settle = () => {
			gsap.set(glyphs, { y: 0 })
			gsap.set(revealLayer, {
				opacity: 1,
				scale: 1,
				clipPath: 'inset(0% 0% 0% 0%)',
			})
		}

		const rest = () => {
			if (reveal === 'rise') {
				gsap.set(glyphs, { y: riseDistance() })
			} else if (reveal === 'wipe') {
				gsap.set(revealLayer, { clipPath: 'inset(0% 100% 0% 0%)' })
			} else if (reveal === 'fade') {
				gsap.set(revealLayer, { opacity: 0, scale: 1.08 })
			}
		}

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (reveal === 'none' || reduce) {
			settle()
			return
		}

		let tween: gsap.core.Tween | null = null

		const play = () => {
			tween?.kill()
			if (reveal === 'rise') {
				gsap.set(revealLayer, {
					opacity: 1,
					scale: 1,
					clipPath: 'inset(0% 0% 0% 0%)',
				})
				tween = gsap.fromTo(
					glyphs,
					{ y: riseDistance() },
					{ y: 0, duration, stagger, ease: 'power4.out', overwrite: 'auto' },
				)
			} else if (reveal === 'wipe') {
				gsap.set(glyphs, { y: 0 })
				const state = { p: 100 }
				tween = gsap.to(state, {
					p: 0,
					duration,
					ease: 'power3.inOut',
					overwrite: 'auto',
					onUpdate: () => {
						revealLayer.style.clipPath = `inset(0% ${state.p}% 0% 0%)`
					},
				})
			} else {
				gsap.set(glyphs, { y: 0 })
				tween = gsap.fromTo(
					revealLayer,
					{ opacity: 0, scale: 1.08 },
					{
						opacity: 1,
						scale: 1,
						duration,
						ease: 'power3.out',
						overwrite: 'auto',
					},
				)
			}
		}

		if (trigger === 'hover') {
			settle()
			root.addEventListener('pointerenter', play)
			return () => {
				root.removeEventListener('pointerenter', play)
				tween?.kill()
			}
		}

		if (trigger === 'view') {
			settle()
			rest()
			const io = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) {
						play()
						io.disconnect()
					}
				},
				{ threshold: 0.25 },
			)
			io.observe(root)
			return () => {
				io.disconnect()
				tween?.kill()
			}
		}

		play()
		return () => tween?.kill()
	})
</script>

<svelte:element
	this={tag}
	bind:this={root}
	class="relative w-full m-0 p-0 antialiased [text-wrap:balance] {className}"
	style="text-align:{align};font-weight:{weight};letter-spacing:{tracking}em;line-height:{lineHeight};{style}"
	{...rest}
>
	<span bind:this={measure} class="text-transparent">
		{#each words as word, i (word + i)}
			<span
				bind:this={wordEls[i]}
				class="inline-block whitespace-pre"
			>{word}{i < words.length - 1 ? ' ' : ''}<i bind:this={baseEls[i]} class="inline-block h-0 w-0"></i></span>
		{/each}
	</span>

	<svg
		class="absolute h-0 w-0 overflow-hidden"
		aria-hidden="true"
		focusable="false"
	>
		<defs>
			<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
				{#each words as word, i (word + i)}
					<text bind:this={glyphEls[i]}>{word}</text>
				{/each}
			</clipPath>
		</defs>
	</svg>

	<span
		bind:this={revealLayer}
		class="pointer-events-none absolute inset-0 block"
	>
		<span class="absolute inset-0 block" style="clip-path:url(#{clipId})">
			<span
				bind:this={media}
				class="absolute inset-0 block [will-change:transform,filter]"
			>
				{#if mediaType === 'video'}
					<video
						class="block h-full w-full select-none object-cover"
						{src}
						{poster}
						autoplay
						muted
						loop
						playsinline
					></video>
				{:else}
					<img
						class="block h-full w-full select-none object-cover"
						{src}
						alt=""
						draggable="false"
					/>
				{/if}
			</span>
		</span>
	</span>
</svelte:element>
