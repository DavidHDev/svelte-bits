<!-- @svelte-bits
{
  "title": "Profile Card",
  "description": "Holographic profile card with pointer/device-orientation tilt and animated shine.",
  "dependencies": []
}
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		avatarUrl?: string;
		iconUrl?: string;
		grainUrl?: string;
		innerGradient?: string;
		behindGlowEnabled?: boolean;
		behindGlowColor?: string;
		behindGlowSize?: string;
		class?: string;
		enableTilt?: boolean;
		enableMobileTilt?: boolean;
		mobileTiltSensitivity?: number;
		miniAvatarUrl?: string;
		name?: string;
		title?: string;
		handle?: string;
		status?: string;
		contactText?: string;
		showUserInfo?: boolean;
		onContactClick?: () => void;
	};

	let {
		avatarUrl = '<Placeholder for avatar URL>',
		iconUrl = '<Placeholder for icon URL>',
		grainUrl = '<Placeholder for grain URL>',
		innerGradient,
		behindGlowEnabled = true,
		behindGlowColor,
		behindGlowSize,
		class: className = '',
		enableTilt = true,
		enableMobileTilt = false,
		mobileTiltSensitivity = 5,
		miniAvatarUrl,
		name = 'Javi A. Torres',
		title = 'Software Engineer',
		handle = 'javicodes',
		status = 'Online',
		contactText = 'Contact',
		showUserInfo = true,
		onContactClick
	}: Props = $props();

	const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';
	const ANIMATION_CONFIG = {
		INITIAL_DURATION: 1200,
		INITIAL_X_OFFSET: 70,
		INITIAL_Y_OFFSET: 60,
		DEVICE_BETA_OFFSET: 20,
		ENTER_TRANSITION_MS: 180
	} as const;

	const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
	const round = (v: number, p = 3) => parseFloat(v.toFixed(p));
	const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
		round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

	let wrapEl: HTMLDivElement;
	let shellEl: HTMLDivElement;

	const cardStyle = $derived(
		[
			`--icon: ${iconUrl ? `url(${iconUrl})` : 'none'}`,
			`--grain: ${grainUrl ? `url(${grainUrl})` : 'none'}`,
			`--inner-gradient: ${innerGradient ?? DEFAULT_INNER_GRADIENT}`,
			`--behind-glow-color: ${behindGlowColor ?? 'rgba(125, 190, 255, 0.67)'}`,
			`--behind-glow-size: ${behindGlowSize ?? '50%'}`
		].join('; ')
	);

	onMount(() => {
		if (!enableTilt) return;
		const shell = shellEl;
		const wrap = wrapEl;
		if (!shell || !wrap) return;

		let rafId: number | null = null;
		let running = false;
		let lastTs = 0;
		let currentX = 0;
		let currentY = 0;
		let targetX = 0;
		let targetY = 0;
		const DEFAULT_TAU = 0.14;
		const INITIAL_TAU = 0.6;
		let initialUntil = 0;
		let enterTimer: number | null = null;
		let leaveRaf: number | null = null;

		const setVarsFromXY = (x: number, y: number) => {
			const width = shell.clientWidth || 1;
			const height = shell.clientHeight || 1;
			const percentX = clamp((100 / width) * x);
			const percentY = clamp((100 / height) * y);
			const centerX = percentX - 50;
			const centerY = percentY - 50;
			const props: Record<string, string> = {
				'--pointer-x': `${percentX}%`,
				'--pointer-y': `${percentY}%`,
				'--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
				'--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
				'--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
				'--pointer-from-top': `${percentY / 100}`,
				'--pointer-from-left': `${percentX / 100}`,
				'--rotate-x': `${round(-(centerX / 5))}deg`,
				'--rotate-y': `${round(centerY / 4)}deg`
			};
			for (const [k, v] of Object.entries(props)) wrap.style.setProperty(k, v);
		};

		const step = (ts: number) => {
			if (!running) return;
			if (lastTs === 0) lastTs = ts;
			const dt = (ts - lastTs) / 1000;
			lastTs = ts;
			const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
			const k = 1 - Math.exp(-dt / tau);
			currentX += (targetX - currentX) * k;
			currentY += (targetY - currentY) * k;
			setVarsFromXY(currentX, currentY);
			const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
			if (stillFar || document.hasFocus()) {
				rafId = requestAnimationFrame(step);
			} else {
				running = false;
				lastTs = 0;
				if (rafId) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
			}
		};

		const start = () => {
			if (running) return;
			running = true;
			lastTs = 0;
			rafId = requestAnimationFrame(step);
		};
		const setImmediate = (x: number, y: number) => {
			currentX = x;
			currentY = y;
			setVarsFromXY(x, y);
		};
		const setTarget = (x: number, y: number) => {
			targetX = x;
			targetY = y;
			start();
		};
		const toCenter = () => setTarget(shell.clientWidth / 2, shell.clientHeight / 2);

		const getOffsets = (e: PointerEvent) => {
			const rect = shell.getBoundingClientRect();
			return { x: e.clientX - rect.left, y: e.clientY - rect.top };
		};

		const onPointerEnter = (e: PointerEvent) => {
			shell.classList.add('active');
			shell.classList.add('entering');
			if (enterTimer) window.clearTimeout(enterTimer);
			enterTimer = window.setTimeout(
				() => shell.classList.remove('entering'),
				ANIMATION_CONFIG.ENTER_TRANSITION_MS
			);
			const { x, y } = getOffsets(e);
			setTarget(x, y);
		};
		const onPointerMove = (e: PointerEvent) => {
			const { x, y } = getOffsets(e);
			setTarget(x, y);
		};
		const onPointerLeave = () => {
			toCenter();
			const checkSettle = () => {
				const settled = Math.hypot(targetX - currentX, targetY - currentY) < 0.6;
				if (settled) {
					shell.classList.remove('active');
					leaveRaf = null;
				} else {
					leaveRaf = requestAnimationFrame(checkSettle);
				}
			};
			if (leaveRaf) cancelAnimationFrame(leaveRaf);
			leaveRaf = requestAnimationFrame(checkSettle);
		};

		const onDeviceOrientation = (event: DeviceOrientationEvent) => {
			const { beta, gamma } = event;
			if (beta == null || gamma == null) return;
			const cx = shell.clientWidth / 2;
			const cy = shell.clientHeight / 2;
			const x = clamp(cx + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
			const y = clamp(
				cy + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
				0,
				shell.clientHeight
			);
			setTarget(x, y);
		};

		const onClick = () => {
			if (!enableMobileTilt || location.protocol !== 'https:') return;
			const anyMotion = window.DeviceMotionEvent as unknown as {
				requestPermission?: () => Promise<string>;
			};
			if (anyMotion && typeof anyMotion.requestPermission === 'function') {
				anyMotion
					.requestPermission()
					.then((state) => {
						if (state === 'granted')
							window.addEventListener('deviceorientation', onDeviceOrientation);
					})
					.catch(console.error);
			} else {
				window.addEventListener('deviceorientation', onDeviceOrientation);
			}
		};

		shell.addEventListener('pointerenter', onPointerEnter);
		shell.addEventListener('pointermove', onPointerMove);
		shell.addEventListener('pointerleave', onPointerLeave);
		shell.addEventListener('click', onClick);

		const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
		const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
		setImmediate(initialX, initialY);
		toCenter();
		initialUntil = performance.now() + ANIMATION_CONFIG.INITIAL_DURATION;
		start();

		return () => {
			shell.removeEventListener('pointerenter', onPointerEnter);
			shell.removeEventListener('pointermove', onPointerMove);
			shell.removeEventListener('pointerleave', onPointerLeave);
			shell.removeEventListener('click', onClick);
			window.removeEventListener('deviceorientation', onDeviceOrientation);
			if (enterTimer) window.clearTimeout(enterTimer);
			if (leaveRaf) cancelAnimationFrame(leaveRaf);
			if (rafId) cancelAnimationFrame(rafId);
			running = false;
			shell.classList.remove('entering');
			shell.classList.remove('active');
		};
	});

	function handleAvatarError(e: Event) {
		const t = e.target as HTMLImageElement;
		t.style.display = 'none';
	}
	function handleMiniAvatarError(e: Event) {
		const t = e.target as HTMLImageElement;
		t.style.opacity = '0.5';
		t.src = avatarUrl;
	}
</script>

<div bind:this={wrapEl} class="pc-card-wrapper {className}" style={cardStyle}>
	{#if behindGlowEnabled}<div class="pc-behind"></div>{/if}
	<div bind:this={shellEl} class="pc-card-shell">
		<section class="pc-card">
			<div class="pc-inside">
				<div class="pc-shine"></div>
				<div class="pc-glare"></div>
				<div class="pc-content pc-avatar-content">
					<img
						class="avatar"
						src={avatarUrl}
						alt={`${name || 'User'} avatar`}
						loading="lazy"
						onerror={handleAvatarError}
					/>
					{#if showUserInfo}
						<div class="pc-user-info">
							<div class="pc-user-details">
								<div class="pc-mini-avatar">
									<img
										src={miniAvatarUrl || avatarUrl}
										alt={`${name || 'User'} mini avatar`}
										loading="lazy"
										onerror={handleMiniAvatarError}
									/>
								</div>
								<div class="pc-user-text">
									<div class="pc-handle">@{handle}</div>
									<div class="pc-status">{status}</div>
								</div>
							</div>
							<button
								class="pc-contact-btn"
								onclick={() => onContactClick?.()}
								style="pointer-events:auto"
								type="button"
								aria-label={`Contact ${name || 'user'}`}>{contactText}</button
							>
						</div>
					{/if}
				</div>
				<div class="pc-content">
					<div class="pc-details">
						<h3>{name}</h3>
						<p>{title}</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.pc-card-wrapper {
		--pointer-x: 50%;
		--pointer-y: 50%;
		--pointer-from-center: 0;
		--pointer-from-top: 0.5;
		--pointer-from-left: 0.5;
		--card-opacity: 0;
		--rotate-x: 0deg;
		--rotate-y: 0deg;
		--background-x: 50%;
		--background-y: 50%;
		--grain: none;
		--icon: none;
		--behind-gradient: none;
		--behind-glow-color: rgba(125, 190, 255, 0.67);
		--behind-glow-size: 25%;
		--inner-gradient: none;
		--sunpillar-1: hsl(2, 100%, 73%);
		--sunpillar-2: hsl(53, 100%, 69%);
		--sunpillar-3: hsl(93, 100%, 69%);
		--sunpillar-4: hsl(176, 100%, 76%);
		--sunpillar-5: hsl(228, 100%, 74%);
		--sunpillar-6: hsl(283, 100%, 73%);
		--sunpillar-clr-1: var(--sunpillar-1);
		--sunpillar-clr-2: var(--sunpillar-2);
		--sunpillar-clr-3: var(--sunpillar-3);
		--sunpillar-clr-4: var(--sunpillar-4);
		--sunpillar-clr-5: var(--sunpillar-5);
		--sunpillar-clr-6: var(--sunpillar-6);
		--card-radius: 30px;
		perspective: 500px;
		transform: translate3d(0, 0, 0.1px);
		position: relative;
		touch-action: none;
	}

	.pc-behind {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: radial-gradient(
			circle at var(--pointer-x) var(--pointer-y),
			var(--behind-glow-color) 0%,
			transparent var(--behind-glow-size)
		);
		filter: blur(50px) saturate(1.1);
		opacity: calc(0.8 * var(--card-opacity));
		transition: opacity 200ms ease;
	}

	.pc-card-wrapper:hover {
		--card-opacity: 1;
	}
	:global(.pc-card-wrapper.active) {
		--card-opacity: 1;
	}

	.pc-card {
		height: 80svh;
		max-height: 540px;
		display: grid;
		aspect-ratio: 0.718;
		border-radius: var(--card-radius);
		position: relative;
		background-blend-mode: color-dodge, normal, normal, normal;
		animation: glow-bg 12s linear infinite;
		box-shadow:
			rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px)
			calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px;
		transition: transform 1s ease;
		transform: translateZ(0) rotateX(0deg) rotateY(0deg);
		background: rgba(0, 0, 0, 0.9);
		backface-visibility: hidden;
		overflow: hidden;
	}

	.pc-card:hover {
		transition: none;
		transform: translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
	}
	:global(.pc-card.active) {
		transition: none;
		transform: translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
	}

	:global(.pc-card-shell.entering) .pc-card {
		transition: transform 180ms ease-out;
	}

	.pc-card-shell {
		position: relative;
		z-index: 1;
	}

	.pc-card * {
		display: grid;
		grid-area: 1/-1;
		border-radius: var(--card-radius);
		pointer-events: none;
	}

	.pc-inside {
		inset: 0;
		position: absolute;
		background-image: var(--inner-gradient);
		background-color: rgba(0, 0, 0, 0.9);
		transform: none;
	}

	.pc-shine {
		mask-image: var(--icon);
		mask-mode: luminance;
		mask-repeat: repeat;
		mask-size: 150%;
		mask-position: top calc(200% - (var(--background-y) * 5)) left calc(100% - var(--background-x));
		transition: filter 0.8s ease;
		filter: brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5);
		animation: holo-bg 18s linear infinite;
		animation-play-state: running;
		mix-blend-mode: color-dodge;
	}

	.pc-shine,
	.pc-shine::after {
		--space: 5%;
		--angle: -45deg;
		transform: translate3d(0, 0, 1px);
		overflow: hidden;
		z-index: 3;
		background: transparent;
		background-size: cover;
		background-position: center;
		background-image:
			repeating-linear-gradient(
				0deg,
				var(--sunpillar-clr-1) calc(var(--space) * 1),
				var(--sunpillar-clr-2) calc(var(--space) * 2),
				var(--sunpillar-clr-3) calc(var(--space) * 3),
				var(--sunpillar-clr-4) calc(var(--space) * 4),
				var(--sunpillar-clr-5) calc(var(--space) * 5),
				var(--sunpillar-clr-6) calc(var(--space) * 6),
				var(--sunpillar-clr-1) calc(var(--space) * 7)
			),
			repeating-linear-gradient(
				var(--angle),
				#0e152e 0%,
				hsl(180, 10%, 60%) 3.8%,
				hsl(180, 29%, 66%) 4.5%,
				hsl(180, 10%, 60%) 5.2%,
				#0e152e 10%,
				#0e152e 12%
			),
			radial-gradient(
				farthest-corner circle at var(--pointer-x) var(--pointer-y),
				hsla(0, 0%, 0%, 0.1) 12%,
				hsla(0, 0%, 0%, 0.15) 20%,
				hsla(0, 0%, 0%, 0.25) 120%
			);
		background-position:
			0 var(--background-y),
			var(--background-x) var(--background-y),
			center;
		background-blend-mode: color, hard-light;
		background-size:
			500% 500%,
			300% 300%,
			200% 200%;
		background-repeat: repeat;
	}

	.pc-shine::before,
	.pc-shine::after {
		content: '';
		background-position: center;
		background-size: cover;
		grid-area: 1/1;
		opacity: 0;
		transition: opacity 0.8s ease;
	}

	.pc-card:hover .pc-shine {
		filter: brightness(0.85) contrast(1.5) saturate(0.5);
		animation-play-state: paused;
	}
	:global(.pc-card.active) .pc-shine {
		filter: brightness(0.85) contrast(1.5) saturate(0.5);
		animation-play-state: paused;
	}

	.pc-card:hover .pc-shine::before,
	.pc-card:hover .pc-shine::after {
		opacity: 1;
	}
	:global(.pc-card.active) .pc-shine::before,
	:global(.pc-card.active) .pc-shine::after {
		opacity: 1;
	}

	.pc-shine::before {
		background-image:
			linear-gradient(
				45deg,
				var(--sunpillar-4),
				var(--sunpillar-5),
				var(--sunpillar-6),
				var(--sunpillar-1),
				var(--sunpillar-2),
				var(--sunpillar-3)
			),
			radial-gradient(
				circle at var(--pointer-x) var(--pointer-y),
				hsl(0, 0%, 70%) 0%,
				hsla(0, 0%, 30%, 0.2) 90%
			),
			var(--grain);
		background-size:
			250% 250%,
			100% 100%,
			220px 220px;
		background-position:
			var(--pointer-x) var(--pointer-y),
			center,
			calc(var(--pointer-x) * 0.01) calc(var(--pointer-y) * 0.01);
		background-blend-mode: color-dodge;
		filter:
			brightness(calc(2 - var(--pointer-from-center)))
			contrast(calc(var(--pointer-from-center) + 2))
			saturate(calc(0.5 + var(--pointer-from-center)));
		mix-blend-mode: luminosity;
	}

	.pc-shine::after {
		background-position:
			0 var(--background-y),
			calc(var(--background-x) * 0.4) calc(var(--background-y) * 0.5),
			center;
		background-size:
			200% 300%,
			700% 700%,
			100% 100%;
		mix-blend-mode: difference;
		filter: brightness(0.8) contrast(1.5);
	}

	.pc-glare {
		transform: translate3d(0, 0, 1.1px);
		overflow: hidden;
		background-image: radial-gradient(
			farthest-corner circle at var(--pointer-x) var(--pointer-y),
			hsl(248, 25%, 80%) 12%,
			hsla(207, 40%, 30%, 0.8) 90%
		);
		mix-blend-mode: overlay;
		filter: brightness(0.8) contrast(1.2);
		z-index: 4;
	}

	.pc-avatar-content {
		mix-blend-mode: luminosity;
		overflow: visible;
		transform: translateZ(2);
		backface-visibility: hidden;
	}

	.pc-avatar-content .avatar {
		width: 100%;
		position: absolute;
		left: 50%;
		transform-origin: 50% 100%;
		transform:
			translateX(calc(-50% + (var(--pointer-from-left) - 0.5) * 6px)) translateZ(0)
			scaleY(calc(1 + (var(--pointer-from-top) - 0.5) * 0.02))
			scaleX(calc(1 + (var(--pointer-from-left) - 0.5) * 0.01));
		bottom: -1px;
		backface-visibility: hidden;
		will-change: transform;
		transition: transform 120ms ease-out;
	}

	.pc-avatar-content::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		backdrop-filter: none;
		pointer-events: none;
	}

	.pc-user-info {
		position: absolute;
		--ui-inset: 20px;
		--ui-radius-bias: 6px;
		bottom: var(--ui-inset);
		left: var(--ui-inset);
		right: var(--ui-inset);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(30px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: calc(max(0px, var(--card-radius) - var(--ui-inset) + var(--ui-radius-bias)));
		padding: 12px 14px;
		pointer-events: auto;
	}

	.pc-user-details {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.pc-mini-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.pc-mini-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.pc-user-text {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		gap: 6px;
	}

	.pc-handle {
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1;
	}

	.pc-status {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1;
	}

	.pc-contact-btn {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		background: transparent;
	}

	.pc-contact-btn:hover {
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-1px);
		transition: all 0.2s ease;
	}

	.pc-content:not(.pc-avatar-content) {
		max-height: 100%;
		overflow: hidden;
		text-align: center;
		position: relative;
		transform: translate3d(
			calc(var(--pointer-from-left) * -6px + 3px),
			calc(var(--pointer-from-top) * -6px + 3px),
			0.1px
		);
		z-index: 5;
		mix-blend-mode: luminosity;
	}

	.pc-details {
		width: 100%;
		position: absolute;
		top: 3em;
		display: flex;
		flex-direction: column;
	}

	.pc-details h3 {
		font-weight: 600;
		margin: 0;
		font-size: min(5svh, 3em);
		background-image: linear-gradient(to bottom, #fff, #6f6fbe);
		background-size: 1em 1.5em;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
	}

	.pc-details p {
		font-weight: 600;
		position: relative;
		top: -12px;
		white-space: nowrap;
		font-size: 16px;
		margin: 0 auto;
		width: min-content;
		background-image: linear-gradient(to bottom, #fff, #4a4ac0);
		background-size: 1em 1.5em;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
	}

	@keyframes glow-bg {
		0% {
			--bgrotate: 0deg;
		}
		100% {
			--bgrotate: 360deg;
		}
	}

	@keyframes holo-bg {
		0% {
			background-position:
				0 var(--background-y),
				0 0,
				center;
		}
		100% {
			background-position:
				0 var(--background-y),
				90% 90%,
				center;
		}
	}

	@media (max-width: 768px) {
		.pc-card {
			height: 70svh;
			max-height: 450px;
		}
		.pc-details {
			top: 2em;
		}
		.pc-details h3 {
			font-size: min(4svh, 2.5em);
		}
		.pc-details p {
			font-size: 14px;
		}
		.pc-user-info {
			--ui-inset: 15px;
			padding: 10px 12px;
		}
		.pc-mini-avatar {
			width: 28px;
			height: 28px;
		}
		.pc-user-details {
			gap: 10px;
		}
		.pc-handle {
			font-size: 13px;
		}
		.pc-status {
			font-size: 10px;
		}
		.pc-contact-btn {
			padding: 6px 12px;
			font-size: 11px;
		}
	}

	@media (max-width: 480px) {
		.pc-card {
			height: 60svh;
			max-height: 380px;
		}
		.pc-details {
			top: 1.5em;
		}
		.pc-details h3 {
			font-size: min(3.5svh, 2em);
		}
		.pc-details p {
			font-size: 12px;
			top: -8px;
		}
		.pc-user-info {
			--ui-inset: 12px;
			padding: 8px 10px;
		}
		.pc-mini-avatar {
			width: 24px;
			height: 24px;
		}
		.pc-user-details {
			gap: 8px;
		}
		.pc-handle {
			font-size: 12px;
		}
		.pc-status {
			font-size: 9px;
		}
		.pc-contact-btn {
			padding: 5px 10px;
			font-size: 10px;
			border-radius: 50px;
		}
	}

	@media (max-width: 320px) {
		.pc-card {
			height: 55svh;
			max-height: 320px;
		}
		.pc-details h3 {
			font-size: min(3svh, 1.5em);
		}
		.pc-details p {
			font-size: 11px;
		}
		.pc-user-info {
			padding: 6px 8px;
		}
		.pc-mini-avatar {
			width: 20px;
			height: 20px;
		}
		.pc-user-details {
			gap: 6px;
		}
		.pc-handle {
			font-size: 11px;
		}
		.pc-status {
			font-size: 8px;
		}
		.pc-contact-btn {
			padding: 4px 8px;
			font-size: 9px;
			border-radius: 50px;
		}
	}
</style>
