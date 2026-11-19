<script lang="ts">
	import { createGlassScene } from './glassScene';
	import { PANE_WIDTH } from './shardGeometry';
	import type { PreviewSpring } from './previewSpring';

	type CanvasSink = { current: ((canvas: HTMLCanvasElement) => void) | null };

	type Props = {
		reducedMotion: boolean;
		theme: 'dark' | 'light';
		stageEl: HTMLElement | null;
		galleryEl: HTMLElement | null;
		reflection: CanvasSink;
		galleryReflection: CanvasSink;
		previewProgress: PreviewSpring;
		layoutKey: string;
	};

	let { reducedMotion, theme, stageEl, galleryEl, reflection, galleryReflection, previewProgress, layoutKey }: Props =
		$props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let measureFn: (() => void) | null = null;
	const entrance: { started: number | null; complete: boolean } = { started: null, complete: false };

	$effect(() => {
		const root = rootEl;
		const stage = stageEl;
		const gallery = galleryEl;
		const motionReduced = reducedMotion;
		const mode = theme;
		if (!root) return;
		const plane = root.querySelector<HTMLElement>('.nf-shard-plane');
		if (!plane) return;
		entrance.started ??= performance.now();
		if (motionReduced) entrance.complete = true;
		const glass = createGlassScene(plane, mode);
		if (!glass) return;

		const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
		const pointer = { x: 0, y: 0, active: 0 };
		let rect: DOMRect;
		let frame = 0;
		let last = 0;
		let time = 0;
		let sourceElapsed = 0;
		let sourceLast = 0;
		let sourceWidth = 0;
		let sourceHeight = 0;
		let inView = true;
		let disposed = false;
		let layoutDirty = false;
		const active = () => !disposed && inView && !document.hidden;

		const tick = (now: number) => {
			frame = 0;
			if (!active()) return;
			if (layoutDirty) {
				updateLayout();
				layoutDirty = false;
			}
			const dt = Math.min((now - (last || now)) / 1000, 0.032);
			last = now;
			if (!motionReduced) time += dt;
			const introTime = entrance.complete ? 3 : (now - (entrance.started ?? now)) / 1000;
			if (introTime >= 2) entrance.complete = true;
			glass.setPreview(Math.max(0, Math.min(1, previewProgress.get())));
			glass.render(time, pointer, motionReduced ? 0 : dt, introTime);
			if (!motionReduced) frame = requestAnimationFrame(tick);
		};
		const wake = () => {
			if (!frame && active()) frame = requestAnimationFrame(tick);
		};
		const capture = (canvas: HTMLCanvasElement) => {
			if (!active() || previewProgress.get() >= 0.999) return;
			if (motionReduced) {
				if (canvas.width !== sourceWidth || canvas.height !== sourceHeight) {
					sourceElapsed = 0;
					sourceLast = 0;
					sourceWidth = canvas.width;
					sourceHeight = canvas.height;
				}
				if (sourceElapsed >= 1.6) return;
				const now = performance.now();
				sourceElapsed += sourceLast ? Math.min((now - sourceLast) / 1000, 0.05) : 1 / 60;
				sourceLast = now;
			}
			glass.capture(canvas);
			wake();
		};
		reflection.current = capture;
		const captureGallery = (canvas: HTMLCanvasElement) => {
			if (!active()) return;
			glass.captureGallery(canvas);
			wake();
		};
		galleryReflection.current = captureGallery;

		const updateLayout = () => {
			rect = plane.getBoundingClientRect();
			const blocks = ['.nf-title', '.nf-lede', '.nf-suggest', '.nf-btn'].map((selector) =>
				root.parentElement?.querySelector(selector)?.getBoundingClientRect()
			);
			glass.resize(rect, stage?.getBoundingClientRect(), gallery?.getBoundingClientRect(), blocks);
		};
		const measure = () => {
			updateLayout();
			wake();
		};
		measureFn = measure;
		const stopPreview = previewProgress.on('change', () => {
			layoutDirty = true;
			sourceElapsed = 0;
			wake();
		});
		const reset = () => {
			pointer.active = 0;
		};
		const onMove = (event: PointerEvent) => {
			if (motionReduced || !pointerQuery.matches || event.pointerType !== 'mouse') return;
			const scale = rect.width / PANE_WIDTH;
			pointer.x = (event.clientX - rect.left - rect.width / 2) / scale;
			pointer.y = -(event.clientY - rect.top - rect.height / 2) / scale;
			pointer.active = 1;
		};
		const onOut = (event: PointerEvent) => {
			if (!event.relatedTarget) reset();
		};
		const playback = () => {
			root.dataset.paused = String(!active() || motionReduced);
			cancelAnimationFrame(frame);
			frame = 0;
			last = 0;
			wake();
		};
		const resize = new ResizeObserver(measure);
		resize.observe(root);
		resize.observe(plane);
		if (stage) resize.observe(stage);
		if (gallery) resize.observe(gallery);
		const visibility = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			playback();
		});
		visibility.observe(root);
		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerout', onOut);
		window.addEventListener('blur', reset);
		window.addEventListener('scroll', measure, { passive: true });
		document.addEventListener('visibilitychange', playback);
		pointerQuery.addEventListener('change', reset);
		measure();

		return () => {
			disposed = true;
			if (measureFn === measure) measureFn = null;
			if (reflection.current === capture) reflection.current = null;
			if (galleryReflection.current === captureGallery) galleryReflection.current = null;
			stopPreview();
			cancelAnimationFrame(frame);
			resize.disconnect();
			visibility.disconnect();
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerout', onOut);
			window.removeEventListener('blur', reset);
			window.removeEventListener('scroll', measure);
			document.removeEventListener('visibilitychange', playback);
			pointerQuery.removeEventListener('change', reset);
			glass.dispose();
		};
	});

	$effect(() => {
		void layoutKey;
		measureFn?.();
	});
</script>

<div bind:this={rootEl} class="nf-shards" aria-hidden="true" data-paused={reducedMotion}>
	<div class="nf-shard-plane"></div>
</div>
