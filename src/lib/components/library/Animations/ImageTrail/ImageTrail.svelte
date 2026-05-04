<!-- @svelte-bits
{
  "title": "Image Trail",
  "description": "Mouse trail of images with 8 visually distinct GSAP variants.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';

	function lerp(a: number, b: number, n: number) {
		return (1 - n) * a + n * b;
	}

	function getLocalPointerPos(e: MouseEvent | TouchEvent, rect: DOMRect) {
		let clientX = 0,
			clientY = 0;
		if ('touches' in e && e.touches.length > 0) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else if ('clientX' in e) {
			clientX = (e as MouseEvent).clientX;
			clientY = (e as MouseEvent).clientY;
		}
		return { x: clientX - rect.left, y: clientY - rect.top };
	}

	function getMouseDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
		return Math.hypot(p1.x - p2.x, p1.y - p2.y);
	}

	type ImageItem = {
		el: HTMLDivElement;
		inner: HTMLDivElement | null;
		rect: DOMRect | null;
	};

	function createImageItems(container: HTMLDivElement): { items: ImageItem[]; cleanup: () => void } {
		const items = Array.from(container.querySelectorAll<HTMLDivElement>('.content__img')).map(
			(el) => {
				const item: ImageItem = {
					el,
					inner: el.querySelector<HTMLDivElement>('.content__img-inner'),
					rect: el.getBoundingClientRect()
				};
				return item;
			}
		);
		const onResize = () => {
			items.forEach((it) => {
				gsap.set(it.el, { scale: 1, x: 0, y: 0, opacity: 0 });
				it.rect = it.el.getBoundingClientRect();
			});
		};
		window.addEventListener('resize', onResize);
		return { items, cleanup: () => window.removeEventListener('resize', onResize) };
	}

	type State = {
		container: HTMLDivElement;
		items: ImageItem[];
		total: number;
		pos: number;
		zIdx: number;
		active: number;
		idle: boolean;
		threshold: number;
		mouse: { x: number; y: number };
		last: { x: number; y: number };
		cache: { x: number; y: number };
	};

	function makeState(container: HTMLDivElement, items: ImageItem[]): State {
		return {
			container,
			items,
			total: items.length,
			pos: 0,
			zIdx: 1,
			active: 0,
			idle: true,
			threshold: 80,
			mouse: { x: 0, y: 0 },
			last: { x: 0, y: 0 },
			cache: { x: 0, y: 0 }
		};
	}

	function attachLoop(s: State, lerpAmt: number, render: () => void): () => void {
		let raf = 0;
		let stopped = false;
		const onMove = (ev: MouseEvent | TouchEvent) => {
			const r = s.container.getBoundingClientRect();
			s.mouse = getLocalPointerPos(ev, r);
		};
		s.container.addEventListener('mousemove', onMove);
		s.container.addEventListener('touchmove', onMove);
		const init = (ev: MouseEvent | TouchEvent) => {
			const r = s.container.getBoundingClientRect();
			s.mouse = getLocalPointerPos(ev, r);
			s.cache = { ...s.mouse };
			const tick = () => {
				if (stopped) return;
				render();
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
			s.container.removeEventListener('mousemove', init);
			s.container.removeEventListener('touchmove', init);
		};
		s.container.addEventListener('mousemove', init);
		s.container.addEventListener('touchmove', init);
		return () => {
			stopped = true;
			cancelAnimationFrame(raf);
			s.container.removeEventListener('mousemove', onMove);
			s.container.removeEventListener('touchmove', onMove);
			s.container.removeEventListener('mousemove', init);
			s.container.removeEventListener('touchmove', init);
		};
	}

	function activated(s: State) {
		s.active++;
		s.idle = false;
	}
	function deactivated(s: State) {
		s.active--;
		if (s.active === 0) s.idle = true;
	}
	function nextImg(s: State) {
		++s.zIdx;
		s.pos = s.pos < s.total - 1 ? s.pos + 1 : 0;
		return s.items[s.pos];
	}

	function variant1(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		const show = () => {
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						scale: 1,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.4,
						ease: 'power1',
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				)
				.to(img.el, { duration: 0.4, ease: 'power3', opacity: 0, scale: 0.2 }, 0.4);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	function variant2(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		const show = () => {
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						scale: 0,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.4,
						ease: 'power1',
						scale: 1,
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				)
				.fromTo(
					img.inner,
					{ scale: 2.8, filter: 'brightness(250%)' },
					{ duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%)' },
					0
				)
				.to(img.el, { duration: 0.4, ease: 'power2', opacity: 0, scale: 0.2 }, 0.45);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	function variant3(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		const show = () => {
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						scale: 0,
						zIndex: s.zIdx,
						xPercent: 0,
						yPercent: 0,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.4,
						ease: 'power1',
						scale: 1,
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				)
				.fromTo(img.inner, { scale: 1.2 }, { duration: 0.4, ease: 'power1', scale: 1 }, 0)
				.to(
					img.el,
					{
						duration: 0.6,
						ease: 'power2',
						opacity: 0,
						scale: 0.2,
						xPercent: () => gsap.utils.random(-30, 30),
						yPercent: -200
					},
					0.6
				);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	function variant4(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		const show = () => {
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			let dx = s.mouse.x - s.cache.x;
			let dy = s.mouse.y - s.cache.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist !== 0) {
				dx /= dist;
				dy /= dist;
			}
			dx *= dist / 100;
			dy *= dist / 100;
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						scale: 0,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.4,
						ease: 'power1',
						scale: 1,
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				)
				.fromTo(
					img.inner,
					{
						scale: 2,
						filter: `brightness(${Math.max((400 * dist) / 100, 100)}%) contrast(${Math.max((400 * dist) / 100, 100)}%)`
					},
					{ duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%) contrast(100%)' },
					0
				)
				.to(img.el, { duration: 0.4, ease: 'power3', opacity: 0 }, 0.4)
				.to(img.el, { duration: 1.5, ease: 'power4', x: `+=${dx * 110}`, y: `+=${dy * 110}` }, 0.05);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	function variant5(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		let lastAngle = 0;
		const show = () => {
			let dx = s.mouse.x - s.cache.x;
			let dy = s.mouse.y - s.cache.y;
			let angle = Math.atan2(dy, dx) * (180 / Math.PI);
			if (angle < 0) angle += 360;
			if (angle > 90 && angle <= 270) angle += 180;
			const cw = angle >= lastAngle;
			lastAngle = angle;
			const startAngle = cw ? angle - 10 : angle + 10;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist !== 0) {
				dx /= dist;
				dy /= dist;
			}
			dx *= dist / 150;
			dy *= dist / 150;
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						filter: 'brightness(80%)',
						scale: 0.1,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2,
						rotation: startAngle
					},
					{
						duration: 1,
						ease: 'power2',
						scale: 1,
						filter: 'brightness(100%)',
						x: s.mouse.x - (img.rect?.width ?? 0) / 2 + dx * 70,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2 + dy * 70,
						rotation: lastAngle
					},
					0
				)
				.to(img.el, { duration: 0.4, ease: 'expo', opacity: 0 }, 0.5)
				.to(img.el, { duration: 1.5, ease: 'power4', x: `+=${dx * 120}`, y: `+=${dy * 120}` }, 0.05);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	function variant6(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		const map = (v: number, mx: number, mn: number, max: number) =>
			mn + (max - mn) * Math.min(v / mx, 1);
		const show = () => {
			const dx = s.mouse.x - s.cache.x;
			const dy = s.mouse.y - s.cache.y;
			const speed = Math.sqrt(dx * dx + dy * dy);
			const img = nextImg(s);
			const sf = map(speed, 200, 0.3, 2);
			const br = map(speed, 70, 0, 1.3);
			const bl = map(speed, 90, 20, 0);
			const gr = map(speed, 90, 600, 0);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						opacity: 1,
						scale: 0,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.8,
						ease: 'power3',
						scale: sf,
						filter: `grayscale(${gr * 100}%) brightness(${br * 100}%) blur(${bl}px)`,
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				)
				.fromTo(img.inner, { scale: 2 }, { duration: 0.8, ease: 'power3', scale: 1 }, 0)
				.to(img.el, { duration: 0.4, ease: 'power3.in', opacity: 0, scale: 0.2 }, 0.45);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.3);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.3);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.3, render);
	}

	function variant7(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		let visible = 0;
		const visibleTotal = Math.min(9, s.total - 1);
		const getNewPosition = (position: number, offset: number) => {
			const off = Math.abs(offset) % s.items.length;
			if (position - off >= 0) return position - off;
			return s.items.length - (off - position);
		};
		const show = () => {
			const img = nextImg(s);
			++visible;
			gsap.killTweensOf(img.el);
			const sv = gsap.utils.random(0.5, 1.6);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.fromTo(
					img.el,
					{
						scale: sv - Math.max(gsap.utils.random(0.2, 0.6), 0),
						rotationZ: 0,
						opacity: 1,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2
					},
					{
						duration: 0.4,
						ease: 'power3',
						scale: sv,
						rotationZ: gsap.utils.random(-3, 3),
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2
					},
					0
				);
			if (visible >= visibleTotal) {
				const last = getNewPosition(s.pos, visibleTotal);
				const old = s.items[last];
				gsap.to(old.el, {
					duration: 0.4,
					ease: 'power4',
					opacity: 0,
					scale: 1.3,
					onComplete: () => {
						if (s.active === 0) s.idle = true;
					}
				});
			}
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.3);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.3);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.3, render);
	}

	function variant8(container: HTMLDivElement, items: ImageItem[]) {
		const s = makeState(container, items);
		let rot = { x: 0, y: 0 };
		let cachedRot = { x: 0, y: 0 };
		let zVal = 0;
		let cachedZ = 0;
		const show = () => {
			const rect = container.getBoundingClientRect();
			const cx = rect.width / 2;
			const cy = rect.height / 2;
			const rx = s.mouse.x - cx;
			const ry = s.mouse.y - cy;
			rot.x = -(ry / cy) * 30;
			rot.y = (rx / cx) * 30;
			cachedRot = { ...rot };
			const dist = Math.sqrt(rx * rx + ry * ry);
			const max = Math.sqrt(cx * cx + cy * cy);
			const prop = dist / max;
			zVal = prop * 1200 - 600;
			cachedZ = zVal;
			const norm = (zVal + 600) / 1200;
			const brightness = 0.2 + norm * 2.3;
			const img = nextImg(s);
			gsap.killTweensOf(img.el);
			gsap
				.timeline({ onStart: () => activated(s), onComplete: () => deactivated(s) })
				.set(container, { perspective: 1000 }, 0)
				.fromTo(
					img.el,
					{
						opacity: 1,
						z: 0,
						scale: 1 + cachedZ / 1000,
						zIndex: s.zIdx,
						x: s.cache.x - (img.rect?.width ?? 0) / 2,
						y: s.cache.y - (img.rect?.height ?? 0) / 2,
						rotationX: cachedRot.x,
						rotationY: cachedRot.y,
						filter: `brightness(${brightness})`
					},
					{
						duration: 1,
						ease: 'expo',
						scale: 1 + zVal / 1000,
						x: s.mouse.x - (img.rect?.width ?? 0) / 2,
						y: s.mouse.y - (img.rect?.height ?? 0) / 2,
						rotationX: rot.x,
						rotationY: rot.y
					},
					0
				)
				.to(img.el, { duration: 0.4, ease: 'power2', opacity: 0, z: -800 }, 0.3);
		};
		const render = () => {
			const d = getMouseDistance(s.mouse, s.last);
			s.cache.x = lerp(s.cache.x, s.mouse.x, 0.1);
			s.cache.y = lerp(s.cache.y, s.mouse.y, 0.1);
			if (d > s.threshold) {
				show();
				s.last = { ...s.mouse };
			}
			if (s.idle && s.zIdx !== 1) s.zIdx = 1;
		};
		return attachLoop(s, 0.1, render);
	}

	const variantMap: Record<
		number,
		(c: HTMLDivElement, i: ImageItem[]) => () => void
	> = {
		1: variant1,
		2: variant2,
		3: variant3,
		4: variant4,
		5: variant5,
		6: variant6,
		7: variant7,
		8: variant8
	};

	export { createImageItems, variantMap };
</script>

<script lang="ts">
	type Props = { items?: string[]; variant?: number };
	let { items = [], variant = 1 }: Props = $props();

	let container: HTMLDivElement;

	$effect(() => {
		void items;
		void variant;
		if (!container) return;
		const { items: imgItems, cleanup } = createImageItems(container);
		const fn = variantMap[variant] || variantMap[1];
		const stop = fn(container, imgItems);
		return () => {
			stop();
			cleanup();
		};
	});
</script>

<div
	bind:this={container}
	class="absolute inset-0 z-[100] rounded-lg bg-transparent overflow-hidden"
>
	{#each items as url, i (i)}
		<div
			class="content__img w-[190px] aspect-[1.1] rounded-[15px] absolute top-0 left-0 opacity-0 overflow-hidden [will-change:transform,filter]"
		>
			<div
				class="content__img-inner bg-center bg-cover w-[calc(100%+20px)] h-[calc(100%+20px)] absolute top-[-10px] left-[-10px]"
				style="background-image: url({url})"
			></div>
		</div>
	{/each}
</div>
