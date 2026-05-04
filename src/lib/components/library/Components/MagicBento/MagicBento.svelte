<!-- @svelte-bits
{
  "title": "Magic Bento",
  "description": "Bento grid with spotlight, particle stars, border glow, tilt, and magnetism.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export interface BentoCardProps {
		color?: string;
		title?: string;
		description?: string;
		label?: string;
	}
	export interface MagicBentoProps {
		textAutoHide?: boolean;
		enableStars?: boolean;
		enableSpotlight?: boolean;
		enableBorderGlow?: boolean;
		disableAnimations?: boolean;
		spotlightRadius?: number;
		particleCount?: number;
		enableTilt?: boolean;
		glowColor?: string;
		clickEffect?: boolean;
		enableMagnetism?: boolean;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	const DEFAULT_PARTICLE_COUNT = 12;
	const DEFAULT_SPOTLIGHT_RADIUS = 300;
	const DEFAULT_GLOW_COLOR = '255, 138, 76';
	const MOBILE_BREAKPOINT = 768;

	const cardData: BentoCardProps[] = [
		{ color: '#14110E', title: 'Analytics', description: 'Track user behavior', label: 'Insights' },
		{ color: '#14110E', title: 'Dashboard', description: 'Centralized data view', label: 'Overview' },
		{ color: '#14110E', title: 'Collaboration', description: 'Work together seamlessly', label: 'Teamwork' },
		{ color: '#14110E', title: 'Automation', description: 'Streamline workflows', label: 'Efficiency' },
		{ color: '#14110E', title: 'Integration', description: 'Connect favorite tools', label: 'Connectivity' },
		{ color: '#14110E', title: 'Security', description: 'Enterprise-grade protection', label: 'Protection' }
	];

	let {
		textAutoHide = true,
		enableStars = true,
		enableSpotlight = true,
		enableBorderGlow = true,
		disableAnimations = false,
		spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
		particleCount = DEFAULT_PARTICLE_COUNT,
		enableTilt = false,
		glowColor = DEFAULT_GLOW_COLOR,
		clickEffect = true,
		enableMagnetism = true
	}: MagicBentoProps = $props();

	let gridRef: HTMLDivElement;
	let isMobile = $state(false);
	const shouldDisableAnimations = $derived(disableAnimations || isMobile);

	function createParticleEl(x: number, y: number, color: string) {
		const el = document.createElement('div');
		el.className = 'particle';
		el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
		return el;
	}

	function updateCardGlow(card: HTMLElement, mx: number, my: number, glow: number, radius: number) {
		const rect = card.getBoundingClientRect();
		card.style.setProperty('--glow-x', `${((mx - rect.left) / rect.width) * 100}%`);
		card.style.setProperty('--glow-y', `${((my - rect.top) / rect.height) * 100}%`);
		card.style.setProperty('--glow-intensity', glow.toString());
		card.style.setProperty('--glow-radius', `${radius}px`);
	}

	function attachCard(el: HTMLElement, index: number) {
		// Per-card behaviour: particles (if enableStars), tilt, magnetism, click ripple
		let isHovered = false;
		const timeouts: ReturnType<typeof setTimeout>[] = [];
		const liveParticles: HTMLDivElement[] = [];
		let memoParticles: HTMLDivElement[] = [];
		let particlesInit = false;
		let magnetTween: gsap.core.Tween | null = null;

		const initParticles = () => {
			if (particlesInit || !el) return;
			const { width, height } = el.getBoundingClientRect();
			memoParticles = Array.from({ length: particleCount }, () =>
				createParticleEl(Math.random() * width, Math.random() * height, glowColor)
			);
			particlesInit = true;
		};
		const clearParticles = () => {
			timeouts.forEach(clearTimeout);
			timeouts.length = 0;
			magnetTween?.kill();
			liveParticles.forEach((p) => {
				gsap.to(p, {
					scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
					onComplete: () => p.parentNode?.removeChild(p)
				});
			});
			liveParticles.length = 0;
		};
		const animateParticles = () => {
			if (!isHovered) return;
			if (!particlesInit) initParticles();
			memoParticles.forEach((p, i) => {
				const t = setTimeout(() => {
					if (!isHovered) return;
					const clone = p.cloneNode(true) as HTMLDivElement;
					el.appendChild(clone);
					liveParticles.push(clone);
					gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
					gsap.to(clone, {
						x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100,
						rotation: Math.random() * 360, duration: 2 + Math.random() * 2,
						ease: 'none', repeat: -1, yoyo: true
					});
					gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
				}, i * 100);
				timeouts.push(t);
			});
		};

		const onEnter = () => {
			if (shouldDisableAnimations) return;
			isHovered = true;
			if (enableStars) animateParticles();
			if (enableTilt) gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
		};
		const onLeave = () => {
			if (shouldDisableAnimations) return;
			isHovered = false;
			if (enableStars) clearParticles();
			if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
			if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
		};
		const onMove = (e: MouseEvent) => {
			if (shouldDisableAnimations) return;
			if (!enableTilt && !enableMagnetism) return;
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const cx = rect.width / 2, cy = rect.height / 2;
			if (enableTilt) {
				gsap.to(el, {
					rotateX: ((y - cy) / cy) * -10,
					rotateY: ((x - cx) / cx) * 10,
					duration: 0.1, ease: 'power2.out', transformPerspective: 1000
				});
			}
			if (enableMagnetism) {
				magnetTween = gsap.to(el, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.3, ease: 'power2.out' });
			}
		};
		const onClick = (e: MouseEvent) => {
			if (!clickEffect || shouldDisableAnimations) return;
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const maxD = Math.max(
				Math.hypot(x, y), Math.hypot(x - rect.width, y),
				Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height)
			);
			const ripple = document.createElement('div');
			ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`;
			el.appendChild(ripple);
			gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
		};

		el.addEventListener('mouseenter', onEnter);
		el.addEventListener('mouseleave', onLeave);
		el.addEventListener('mousemove', onMove);
		el.addEventListener('click', onClick);

		return () => {
			isHovered = false;
			el.removeEventListener('mouseenter', onEnter);
			el.removeEventListener('mouseleave', onLeave);
			el.removeEventListener('mousemove', onMove);
			el.removeEventListener('click', onClick);
			clearParticles();
		};
	}

	function cardAction(node: HTMLElement, index: number) {
		const detach = attachCard(node, index);
		return { destroy: detach };
	}

	onMount(() => {
		const checkMobile = () => (isMobile = window.innerWidth <= MOBILE_BREAKPOINT);
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Global spotlight
		let spotlight: HTMLDivElement | null = null;
		let onDocMove: ((e: MouseEvent) => void) | null = null;
		let onDocLeave: (() => void) | null = null;

		if (enableSpotlight && !shouldDisableAnimations) {
			spotlight = document.createElement('div');
			spotlight.className = 'global-spotlight';
			spotlight.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%, rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%, rgba(${glowColor}, 0.01) 65%, transparent 70%);z-index:200;opacity:0;transform:translate(-50%, -50%);mix-blend-mode:screen;`;
			document.body.appendChild(spotlight);

			const proximity = spotlightRadius * 0.5;
			const fadeDistance = spotlightRadius * 0.75;

			onDocMove = (e: MouseEvent) => {
				if (!spotlight || !gridRef) return;
				const section = gridRef.closest('.bento-section') as HTMLElement | null;
				const rect = section?.getBoundingClientRect();
				const inside = !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
				const cards = gridRef.querySelectorAll<HTMLElement>('.magic-bento-card');
				if (!inside) {
					gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
					cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'));
					return;
				}
				let minDistance = Infinity;
				cards.forEach((card) => {
					const cr = card.getBoundingClientRect();
					const cx = cr.left + cr.width / 2;
					const cy = cr.top + cr.height / 2;
					const distance = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
					const eff = Math.max(0, distance);
					minDistance = Math.min(minDistance, eff);
					let glow = 0;
					if (eff <= proximity) glow = 1;
					else if (eff <= fadeDistance) glow = (fadeDistance - eff) / (fadeDistance - proximity);
					updateCardGlow(card, e.clientX, e.clientY, glow, spotlightRadius);
				});
				gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
				const targetOpacity = minDistance <= proximity ? 0.8
					: minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
					: 0;
				gsap.to(spotlight, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
			};
			onDocLeave = () => {
				gridRef?.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((c) => c.style.setProperty('--glow-intensity', '0'));
				if (spotlight) gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
			};
			document.addEventListener('mousemove', onDocMove);
			document.addEventListener('mouseleave', onDocLeave);
		}

		return () => {
			window.removeEventListener('resize', checkMobile);
			if (onDocMove) document.removeEventListener('mousemove', onDocMove);
			if (onDocLeave) document.removeEventListener('mouseleave', onDocLeave);
			spotlight?.parentNode?.removeChild(spotlight);
		};
	});

	const baseCardClass = $derived(
		`magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${enableStars ? 'particle-container' : ''} ${textAutoHide ? 'magic-bento-card--text-autohide' : ''}`
	);

	const cardStyle = (color: string | undefined) =>
		`background-color:${color || 'var(--background-dark)'};`;
</script>

<div
	bind:this={gridRef}
	class="bento-section"
>
	<div class="card-grid">
		{#each cardData as card, i (i)}
			<div class={baseCardClass} style={cardStyle(card.color)} use:cardAction={i}>
				<div class="magic-bento-card__header">
					<span class="magic-bento-card__label">{card.label}</span>
				</div>
				<div class="magic-bento-card__content">
					<h3 class="magic-bento-card__title">{card.title}</h3>
					<p class="magic-bento-card__description">{card.description}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.bento-section {
		position: relative;
		user-select: none;
		--white: hsl(0, 0%, 100%);
		--border-color: #2A2620;
		--background-dark: #14110E;
		--accent-glow: rgba(255, 138, 76, 0.2);
	}
	:global(.bento-section .card-grid) {
		display: grid;
		gap: 0.5em;
		padding: 0.75em;
		max-width: 54em;
		font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
	}
	:global(.bento-section .magic-bento-card) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		aspect-ratio: 4/3;
		min-height: 200px;
		width: 100%;
		max-width: 100%;
		padding: 1.25em;
		border-radius: 20px;
		border: 1px solid var(--border-color);
		background: var(--background-dark);
		font-weight: 300;
		overflow: hidden;
		transition: all 0.3s ease;
		color: var(--white);
		--glow-x: 50%;
		--glow-y: 50%;
		--glow-intensity: 0;
		--glow-radius: 200px;
	}
	:global(.bento-section .magic-bento-card:hover) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}
	:global(.bento-section .magic-bento-card__header),
	:global(.bento-section .magic-bento-card__content) {
		display: flex;
		position: relative;
		color: var(--white);
	}
	:global(.bento-section .magic-bento-card__header) {
		gap: 0.75em;
		justify-content: space-between;
	}
	:global(.bento-section .magic-bento-card__content) { flex-direction: column; }
	:global(.bento-section .magic-bento-card__label) { font-size: 16px; }
	:global(.bento-section .magic-bento-card__title),
	:global(.bento-section .magic-bento-card__description) {
		--clamp-title: 1;
		--clamp-desc: 2;
	}
	:global(.bento-section .magic-bento-card__title) {
		font-weight: 400;
		font-size: 16px;
		margin: 0 0 0.25em;
	}
	:global(.bento-section .magic-bento-card__description) {
		font-size: 12px;
		line-height: 1.2;
		opacity: 0.9;
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__title),
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__description) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__title) {
		-webkit-line-clamp: var(--clamp-title);
		line-clamp: var(--clamp-title);
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__description) {
		-webkit-line-clamp: var(--clamp-desc);
		line-clamp: var(--clamp-desc);
	}

	@media (max-width: 599px) {
		:global(.bento-section .card-grid) {
			grid-template-columns: 1fr;
			width: 90%;
			margin: 0 auto;
			padding: 0.5em;
		}
		:global(.bento-section .magic-bento-card) { width: 100%; min-height: 180px; }
	}
	@media (min-width: 600px) {
		:global(.bento-section .card-grid) { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		:global(.bento-section .card-grid) { grid-template-columns: repeat(4, 1fr); }
		:global(.bento-section .magic-bento-card:nth-child(3)) { grid-column: span 2; grid-row: span 2; }
		:global(.bento-section .magic-bento-card:nth-child(4)) { grid-column: 1 / span 2; grid-row: 2 / span 2; }
		:global(.bento-section .magic-bento-card:nth-child(6)) { grid-column: 4; grid-row: 3; }
	}

	:global(.bento-section .magic-bento-card--border-glow::after) {
		content: '';
		position: absolute;
		inset: 0;
		padding: 6px;
		background: radial-gradient(
			var(--glow-radius) circle at var(--glow-x) var(--glow-y),
			rgba(255, 138, 76, calc(var(--glow-intensity) * 0.8)) 0%,
			rgba(255, 138, 76, calc(var(--glow-intensity) * 0.4)) 30%,
			transparent 60%
		);
		border-radius: inherit;
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.3s ease;
		z-index: 1;
	}
	:global(.bento-section .magic-bento-card--border-glow:hover) {
		box-shadow: 0 4px 20px rgba(78, 38, 18, 0.4), 0 0 30px var(--accent-glow);
	}
	:global(.particle-container) { position: relative; overflow: hidden; }
	:global(.particle::before) {
		content: '';
		position: absolute;
		top: -2px; left: -2px; right: -2px; bottom: -2px;
		background: rgba(255, 138, 76, 0.2);
		border-radius: 50%;
		z-index: -1;
	}
	:global(.bento-section .particle-container:hover) {
		box-shadow: 0 4px 20px rgba(78, 38, 18, 0.2), 0 0 30px rgba(255, 138, 76, 0.2);
	}
	:global(.global-spotlight) {
		mix-blend-mode: screen;
		will-change: transform, opacity;
		z-index: 200 !important;
		pointer-events: none;
	}
</style>
