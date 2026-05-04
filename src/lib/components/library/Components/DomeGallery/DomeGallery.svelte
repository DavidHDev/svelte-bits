<!-- @svelte-bits
{
  "title": "Dome Gallery",
  "description": "Draggable 3D image dome with momentum, click-to-enlarge, and dome blur overlays.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type DomeGalleryImage = string | { src: string; alt?: string };
	type ItemDef = { src: string; alt: string; x: number; y: number; sizeX: number; sizeY: number };

	const DEFAULT_IMAGES: DomeGalleryImage[] = [
		{ src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop', alt: 'Abstract art' },
		{ src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop', alt: 'Modern sculpture' },
		{ src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop', alt: 'Digital artwork' },
		{ src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop', alt: 'Contemporary art' },
		{ src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop', alt: 'Geometric pattern' },
		{ src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop', alt: 'Textured surface' }
	];

	const clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);
	const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
	const wrapSigned = (d: number) => { const a = (((d + 180) % 360) + 360) % 360; return a - 180; };

	function buildItems(pool: DomeGalleryImage[], seg: number): ItemDef[] {
		const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
		const evenY = [-4, -2, 0, 2, 4];
		const oddY = [-3, -1, 1, 3, 5];
		const coords = xCols.flatMap((x, c) => (c % 2 === 0 ? evenY : oddY).map((y) => ({ x, y, sizeX: 2, sizeY: 2 })));
		if (pool.length === 0) return coords.map((c) => ({ ...c, src: '', alt: '' }));
		const norm = pool.map((im) => (typeof im === 'string' ? { src: im, alt: '' } : { src: im.src || '', alt: im.alt || '' }));
		const used = Array.from({ length: coords.length }, (_, i) => norm[i % norm.length]);
		for (let i = 1; i < used.length; i++) {
			if (used[i].src === used[i - 1].src) {
				for (let j = i + 1; j < used.length; j++) {
					if (used[j].src !== used[i].src) {
						const tmp = used[i];
						used[i] = used[j];
						used[j] = tmp;
						break;
					}
				}
			}
		}
		return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt }));
	}

	function computeBaseRot(ox: number, oy: number, sx: number, sy: number, seg: number) {
		const unit = 360 / seg / 2;
		return { rotateY: unit * (ox + (sx - 1) / 2), rotateX: unit * (oy - (sy - 1) / 2) };
	}

	function getDataNumber(el: HTMLElement, name: string, fallback: number) {
		const v = el.dataset[name];
		const n = v == null ? NaN : parseFloat(v);
		return Number.isFinite(n) ? n : fallback;
	}

	export { DEFAULT_IMAGES };
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		images?: DomeGalleryImage[];
		fit?: number;
		fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
		minRadius?: number;
		maxRadius?: number;
		padFactor?: number;
		overlayBlurColor?: string;
		maxVerticalRotationDeg?: number;
		dragSensitivity?: number;
		enlargeTransitionMs?: number;
		segments?: number;
		dragDampening?: number;
		openedImageWidth?: string;
		openedImageHeight?: string;
		imageBorderRadius?: string;
		openedImageBorderRadius?: string;
		grayscale?: boolean;
	};

	let {
		images = DEFAULT_IMAGES,
		fit = 0.5,
		fitBasis = 'auto',
		minRadius = 600,
		maxRadius = Infinity,
		padFactor = 0.25,
		overlayBlurColor = '#14110E',
		maxVerticalRotationDeg = 5,
		dragSensitivity = 20,
		enlargeTransitionMs = 300,
		segments = 35,
		dragDampening = 2,
		openedImageWidth = '400px',
		openedImageHeight = '400px',
		imageBorderRadius = '30px',
		openedImageBorderRadius = '30px',
		grayscale = true
	}: Props = $props();

	let rootRef: HTMLDivElement;
	let mainRef: HTMLDivElement;
	let sphereRef: HTMLDivElement;
	let frameRef: HTMLDivElement;
	let viewerRef: HTMLDivElement;
	let scrimRef: HTMLDivElement;

	const items = $derived(buildItems(images, segments));

	let rotation = { x: 0, y: 0 };
	let startRot = { x: 0, y: 0 };
	let startPos: { x: number; y: number } | null = null;
	let lastPos = { x: 0, y: 0, t: 0 };
	let velocity = { x: 0, y: 0 };
	let dragging = false;
	let moved = false;
	let pointerType: 'mouse' | 'pen' | 'touch' = 'mouse';
	let openingRef = false;
	let openStartedAt = 0;
	let lastDragEndAt = 0;
	let inertiaRAF: number | null = null;
	let focusedEl: HTMLElement | null = null;
	let originalTilePos: { left: number; top: number; width: number; height: number } | null = null;
	let scrollLocked = false;

	function applyTransform(x: number, y: number) {
		if (sphereRef) sphereRef.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
	}
	function lockScroll() {
		if (scrollLocked) return;
		scrollLocked = true;
		document.body.classList.add('dg-scroll-lock');
	}
	function unlockScroll() {
		if (!scrollLocked) return;
		if (rootRef?.getAttribute('data-enlarging') === 'true') return;
		scrollLocked = false;
		document.body.classList.remove('dg-scroll-lock');
	}
	function stopInertia() {
		if (inertiaRAF != null) {
			cancelAnimationFrame(inertiaRAF);
			inertiaRAF = null;
		}
	}
	function startInertia(vx: number, vy: number) {
		const MAX = 1.4;
		let vX = clamp(vx, -MAX, MAX) * 80;
		let vY = clamp(vy, -MAX, MAX) * 80;
		let frames = 0;
		const d = clamp(dragDampening ?? 0.6, 0, 1);
		const fric = 0.94 + 0.055 * d;
		const stop = 0.015 - 0.01 * d;
		const maxF = Math.round(90 + 270 * d);
		const step = () => {
			vX *= fric;
			vY *= fric;
			if (Math.abs(vX) < stop && Math.abs(vY) < stop) { inertiaRAF = null; return; }
			if (++frames > maxF) { inertiaRAF = null; return; }
			const nx = clamp(rotation.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
			const ny = wrapSigned(rotation.y + vX / 200);
			rotation = { x: nx, y: ny };
			applyTransform(nx, ny);
			inertiaRAF = requestAnimationFrame(step);
		};
		stopInertia();
		inertiaRAF = requestAnimationFrame(step);
	}

	function onPointerDown(e: PointerEvent) {
		if (focusedEl) return;
		stopInertia();
		pointerType = (e.pointerType as 'mouse' | 'pen' | 'touch') || 'mouse';
		if (pointerType === 'touch') { e.preventDefault(); lockScroll(); }
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		dragging = true;
		moved = false;
		startRot = { ...rotation };
		startPos = { x: e.clientX, y: e.clientY };
		lastPos = { x: e.clientX, y: e.clientY, t: performance.now() };
		velocity = { x: 0, y: 0 };
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging || !startPos) return;
		if (pointerType === 'touch') e.preventDefault();
		const dx = e.clientX - startPos.x;
		const dy = e.clientY - startPos.y;
		if (!moved && dx * dx + dy * dy > 16) moved = true;
		const nx = clamp(startRot.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
		const ny = startRot.y + dx / dragSensitivity;
		rotation = { x: nx, y: ny };
		applyTransform(nx, ny);
		// velocity sample
		const t = performance.now();
		const dt = Math.max(1, t - lastPos.t);
		velocity = { x: (e.clientX - lastPos.x) / dt, y: (e.clientY - lastPos.y) / dt };
		lastPos = { x: e.clientX, y: e.clientY, t };
	}
	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const tap = !moved && startPos && Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) <= (pointerType === 'touch' ? 10 : 6);
		const targetTile = (e.target as Element).closest?.('.item__image') as HTMLElement | null;
		if (tap && targetTile && !focusedEl) openItemFromElement(targetTile);
		else if (Math.abs(velocity.x) > 0.005 || Math.abs(velocity.y) > 0.005) startInertia(velocity.x, velocity.y);
		startPos = null;
		if (pointerType === 'touch') unlockScroll();
		if (moved) lastDragEndAt = performance.now();
		moved = false;
	}

	function openItemFromElement(el: HTMLElement) {
		if (openingRef) return;
		openingRef = true;
		openStartedAt = performance.now();
		lockScroll();
		const parent = el.parentElement as HTMLElement;
		focusedEl = el;
		el.setAttribute('data-focused', 'true');
		const ox = getDataNumber(parent, 'offsetX', 0);
		const oy = getDataNumber(parent, 'offsetY', 0);
		const sx = getDataNumber(parent, 'sizeX', 2);
		const sy = getDataNumber(parent, 'sizeY', 2);
		const pr = computeBaseRot(ox, oy, sx, sy, segments);
		const py = normalizeAngle(pr.rotateY);
		const gy = normalizeAngle(rotation.y);
		let rotY = -(py + gy) % 360;
		if (rotY < -180) rotY += 360;
		const rotX = -pr.rotateX - rotation.x;
		parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
		parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
		const refDiv = document.createElement('div');
		refDiv.className = 'item__image item__image--reference opacity-0';
		refDiv.style.transform = `rotateX(${-pr.rotateX}deg) rotateY(${-pr.rotateY}deg)`;
		parent.appendChild(refDiv);
		void refDiv.offsetHeight;
		const tileR = refDiv.getBoundingClientRect();
		const mainR = mainRef?.getBoundingClientRect();
		const frameR = frameRef?.getBoundingClientRect();
		if (!mainR || !frameR || tileR.width <= 0) {
			openingRef = false;
			focusedEl = null;
			parent.removeChild(refDiv);
			unlockScroll();
			return;
		}
		originalTilePos = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
		el.style.visibility = 'hidden';
		el.style.zIndex = '0';
		const overlay = document.createElement('div');
		overlay.className = 'enlarge';
		overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;opacity:0;z-index:30;will-change:transform,opacity;transform-origin:top left;transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);`;
		const rawSrc = parent.dataset.src || (el.querySelector('img') as HTMLImageElement)?.src || '';
		const rawAlt = parent.dataset.alt || (el.querySelector('img') as HTMLImageElement)?.alt || '';
		const img = document.createElement('img');
		img.src = rawSrc;
		img.alt = rawAlt;
		img.style.cssText = `width:100%;height:100%;object-fit:cover;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
		overlay.appendChild(img);
		viewerRef.appendChild(overlay);
		const tx0 = tileR.left - frameR.left;
		const ty0 = tileR.top - frameR.top;
		const sx0 = tileR.width / frameR.width;
		const sy0 = tileR.height / frameR.height;
		const vsx = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
		const vsy = isFinite(sy0) && sy0 > 0 ? sy0 : 1;
		overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${vsx}, ${vsy})`;
		setTimeout(() => {
			if (!overlay.parentElement) return;
			overlay.style.opacity = '1';
			overlay.style.transform = 'translate(0,0) scale(1,1)';
			rootRef?.setAttribute('data-enlarging', 'true');
		}, 16);
		const wantsResize = openedImageWidth || openedImageHeight;
		if (wantsResize) {
			const onFirstEnd = (ev: TransitionEvent) => {
				if (ev.propertyName !== 'transform') return;
				overlay.removeEventListener('transitionend', onFirstEnd);
				const prevT = overlay.style.transition;
				overlay.style.transition = 'none';
				const tw = openedImageWidth || `${frameR.width}px`;
				const th = openedImageHeight || `${frameR.height}px`;
				overlay.style.width = tw;
				overlay.style.height = th;
				const nr = overlay.getBoundingClientRect();
				overlay.style.width = frameR.width + 'px';
				overlay.style.height = frameR.height + 'px';
				void overlay.offsetWidth;
				overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
				const cl = frameR.left - mainR.left + (frameR.width - nr.width) / 2;
				const ct = frameR.top - mainR.top + (frameR.height - nr.height) / 2;
				requestAnimationFrame(() => {
					overlay.style.left = `${cl}px`;
					overlay.style.top = `${ct}px`;
					overlay.style.width = tw;
					overlay.style.height = th;
				});
				overlay.addEventListener('transitionend', () => { overlay.style.transition = prevT; }, { once: true });
			};
			overlay.addEventListener('transitionend', onFirstEnd);
		}
	}

	function closeOverlay() {
		if (performance.now() - openStartedAt < 250) return;
		const el = focusedEl;
		if (!el) return;
		const parent = el.parentElement as HTMLElement;
		const overlay = viewerRef?.querySelector('.enlarge') as HTMLElement | null;
		if (!overlay) return;
		const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
		const op = originalTilePos;
		if (!op) {
			overlay.remove();
			refDiv?.remove();
			parent.style.setProperty('--rot-y-delta', `0deg`);
			parent.style.setProperty('--rot-x-delta', `0deg`);
			el.style.visibility = '';
			el.style.zIndex = '0';
			focusedEl = null;
			rootRef?.removeAttribute('data-enlarging');
			openingRef = false;
			return;
		}
		const cur = overlay.getBoundingClientRect();
		const rr = rootRef.getBoundingClientRect();
		const opR = { left: op.left - rr.left, top: op.top - rr.top, width: op.width, height: op.height };
		const ovR = { left: cur.left - rr.left, top: cur.top - rr.top, width: cur.width, height: cur.height };
		const ao = document.createElement('div');
		ao.className = 'enlarge-closing';
		ao.style.cssText = `position:absolute;left:${ovR.left}px;top:${ovR.top}px;width:${ovR.width}px;height:${ovR.height}px;z-index:9999;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
		const oi = overlay.querySelector('img');
		if (oi) {
			const img = oi.cloneNode() as HTMLImageElement;
			img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
			ao.appendChild(img);
		}
		overlay.remove();
		rootRef.appendChild(ao);
		void ao.getBoundingClientRect();
		requestAnimationFrame(() => {
			ao.style.left = `${opR.left}px`;
			ao.style.top = `${opR.top}px`;
			ao.style.width = `${opR.width}px`;
			ao.style.height = `${opR.height}px`;
			ao.style.opacity = '0';
		});
		ao.addEventListener('transitionend', () => {
			ao.remove();
			originalTilePos = null;
			refDiv?.remove();
			parent.style.transition = 'none';
			el.style.transition = 'none';
			parent.style.setProperty('--rot-y-delta', `0deg`);
			parent.style.setProperty('--rot-x-delta', `0deg`);
			requestAnimationFrame(() => {
				el.style.visibility = '';
				el.style.opacity = '0';
				el.style.zIndex = '0';
				focusedEl = null;
				rootRef?.removeAttribute('data-enlarging');
				requestAnimationFrame(() => {
					parent.style.transition = '';
					el.style.transition = 'opacity 300ms ease-out';
					requestAnimationFrame(() => {
						el.style.opacity = '1';
						setTimeout(() => {
							el.style.transition = '';
							el.style.opacity = '';
							openingRef = false;
							if (!dragging && rootRef?.getAttribute('data-enlarging') !== 'true') {
								document.body.classList.remove('dg-scroll-lock');
							}
						}, 300);
					});
				});
			});
		}, { once: true });
	}

	onMount(() => {
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0].contentRect;
			const w = Math.max(1, cr.width);
			const h = Math.max(1, cr.height);
			const minDim = Math.min(w, h);
			const maxDim = Math.max(w, h);
			const aspect = w / h;
			let basis: number;
			switch (fitBasis) {
				case 'min': basis = minDim; break;
				case 'max': basis = maxDim; break;
				case 'width': basis = w; break;
				case 'height': basis = h; break;
				default: basis = aspect >= 1.3 ? w : minDim;
			}
			let radius = basis * fit;
			radius = Math.min(radius, h * 1.35);
			radius = clamp(radius, minRadius, maxRadius);
			const r = Math.round(radius);
			const pad = Math.max(8, Math.round(minDim * padFactor));
			rootRef.style.setProperty('--radius', `${r}px`);
			rootRef.style.setProperty('--viewer-pad', `${pad}px`);
			rootRef.style.setProperty('--overlay-blur-color', overlayBlurColor);
			rootRef.style.setProperty('--tile-radius', imageBorderRadius);
			rootRef.style.setProperty('--enlarge-radius', openedImageBorderRadius);
			rootRef.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
			applyTransform(rotation.x, rotation.y);
		});
		ro.observe(rootRef);
		applyTransform(0, 0);

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeOverlay();
		};
		const onScrim = () => closeOverlay();
		scrimRef.addEventListener('click', onScrim);
		window.addEventListener('keydown', onKey);

		return () => {
			ro.disconnect();
			scrimRef?.removeEventListener('click', onScrim);
			window.removeEventListener('keydown', onKey);
			document.body.classList.remove('dg-scroll-lock');
			stopInertia();
		};
	});

	function tileClick(e: MouseEvent | PointerEvent) {
		if (dragging) return;
		if (moved) return;
		if (performance.now() - lastDragEndAt < 80) return;
		if (openingRef) return;
		openItemFromElement(e.currentTarget as HTMLElement);
	}
</script>

<div
	bind:this={rootRef}
	class="sphere-root relative w-full h-full"
	style="--segments-x:{segments};--segments-y:{segments};--overlay-blur-color:{overlayBlurColor};--tile-radius:{imageBorderRadius};--enlarge-radius:{openedImageBorderRadius};--image-filter:{grayscale ? 'grayscale(1)' : 'none'};"
>
	<div
		bind:this={mainRef}
		class="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
		style="touch-action:none;-webkit-user-select:none;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		role="presentation"
	>
		<div class="stage">
			<div bind:this={sphereRef} class="sphere">
				{#each items as it, i (`${it.x},${it.y},${i}`)}
					<div
						class="sphere-item absolute m-auto"
						data-src={it.src}
						data-alt={it.alt}
						data-offset-x={it.x}
						data-offset-y={it.y}
						data-size-x={it.sizeX}
						data-size-y={it.sizeY}
						style="--offset-x:{it.x};--offset-y:{it.y};--item-size-x:{it.sizeX};--item-size-y:{it.sizeY};top:-999px;bottom:-999px;left:-999px;right:-999px;"
					>
						<div
							class="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
							role="button"
							tabindex="0"
							aria-label={it.alt || 'Open image'}
							onclick={tileClick}
							style="inset:10px;border-radius:var(--tile-radius, {imageBorderRadius});backface-visibility:hidden;"
						>
							<img
								src={it.src}
								draggable="false"
								alt={it.alt}
								class="w-full h-full object-cover pointer-events-none"
								style="backface-visibility:hidden;filter:var(--image-filter, {grayscale ? 'grayscale(1)' : 'none'});"
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div
			class="absolute inset-0 m-auto z-[3] pointer-events-none"
			style="background-image:radial-gradient(rgba(235,235,235,0) 65%, var(--overlay-blur-color, {overlayBlurColor}) 100%);"
		></div>
		<div
			class="absolute inset-0 m-auto z-[3] pointer-events-none"
			style="-webkit-mask-image:radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, {overlayBlurColor}) 90%);mask-image:radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, {overlayBlurColor}) 90%);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"
		></div>
		<div
			class="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
			style="background:linear-gradient(to bottom, transparent, var(--overlay-blur-color, {overlayBlurColor}));"
		></div>
		<div
			class="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
			style="background:linear-gradient(to bottom, transparent, var(--overlay-blur-color, {overlayBlurColor}));"
		></div>
		<div
			bind:this={viewerRef}
			class="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
			style="padding:var(--viewer-pad);"
		>
			<div
				bind:this={scrimRef}
				class="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
				style="background:rgba(0,0,0,0.4);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"
			></div>
			<div
				bind:this={frameRef}
				class="viewer-frame h-full aspect-square flex"
				style="border-radius:var(--enlarge-radius, {openedImageBorderRadius});"
			></div>
		</div>
	</div>
</div>

<style>
	:global(.sphere-root) {
		--radius: 520px;
		--viewer-pad: 72px;
		--circ: calc(var(--radius) * 3.14);
		--rot-y: calc((360deg / var(--segments-x)) / 2);
		--rot-x: calc((360deg / var(--segments-y)) / 2);
		--item-width: calc(var(--circ) / var(--segments-x));
		--item-height: calc(var(--circ) / var(--segments-y));
	}
	:global(.sphere-root *) { box-sizing: border-box; }
	:global(.sphere-root .sphere),
	:global(.sphere-root .sphere-item),
	:global(.sphere-root .item__image) { transform-style: preserve-3d; }
	:global(.sphere-root .stage) {
		width: 100%; height: 100%;
		display: grid; place-items: center;
		position: absolute; inset: 0; margin: auto;
		perspective: calc(var(--radius) * 2);
		perspective-origin: 50% 50%;
	}
	:global(.sphere-root .sphere) {
		transform: translateZ(calc(var(--radius) * -1));
		will-change: transform;
		position: absolute;
	}
	:global(.sphere-root .sphere-item) {
		width: calc(var(--item-width) * var(--item-size-x));
		height: calc(var(--item-height) * var(--item-size-y));
		position: absolute;
		top: -999px; bottom: -999px; left: -999px; right: -999px;
		margin: auto;
		transform-origin: 50% 50%;
		backface-visibility: hidden;
		transition: transform 300ms;
		transform:
			rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
			rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
			translateZ(var(--radius));
	}
	:global(.sphere-root[data-enlarging="true"] .scrim) {
		opacity: 1 !important;
		pointer-events: all !important;
	}
	@media (max-aspect-ratio: 1/1) {
		:global(.sphere-root .viewer-frame) { height: auto !important; width: 100% !important; }
	}
	:global(.item__image) {
		position: absolute;
		inset: 10px;
		border-radius: var(--tile-radius, 12px);
		overflow: hidden;
		cursor: pointer;
		backface-visibility: hidden;
		transition: transform 300ms;
		pointer-events: auto;
		transform: translateZ(0);
	}
	:global(.item__image--reference) {
		position: absolute;
		inset: 10px;
		pointer-events: none;
	}
</style>
