import { animate, inView } from 'motion';

export const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function reveal(node: HTMLElement, options: { delay?: number } = {}) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
	node.style.opacity = '0';
	node.style.transform = 'translateY(24px)';
	let animation: ReturnType<typeof animate> | null = null;
	const stop = inView(
		node,
		() => {
			animation = animate(
				node,
				{ opacity: [0, 1], y: [24, 0] },
				{ duration: 0.5, delay: options.delay ?? 0, ease: EASE }
			);
			stop();
		},
		{ margin: '-60px' }
	);
	return {
		destroy() {
			stop();
			animation?.stop();
		}
	};
}

export function fadeSlideIn(node: HTMLElement) {
	animate(node, { opacity: [0, 1], x: [-6, 0] }, { duration: 0.2 });
	return {};
}

export function observeVisible(node: Element, onChange: (visible: boolean) => void, rootMargin = '150px') {
	if (typeof IntersectionObserver === 'undefined') {
		onChange(true);
		return () => {};
	}
	let inViewNow = false;
	let tabVisible = document.visibilityState !== 'hidden';
	const sync = () => onChange(inViewNow && tabVisible);
	const observer = new IntersectionObserver(
		(entries) => {
			inViewNow = entries[entries.length - 1].isIntersecting;
			sync();
		},
		{ rootMargin }
	);
	observer.observe(node);
	const onVisibility = () => {
		tabVisible = document.visibilityState !== 'hidden';
		sync();
	};
	document.addEventListener('visibilitychange', onVisibility);
	return () => {
		observer.disconnect();
		document.removeEventListener('visibilitychange', onVisibility);
	};
}

export function observeNearOnce(node: Element, onNear: () => void, rootMargin = '600px 0px') {
	if (typeof IntersectionObserver === 'undefined') {
		onNear();
		return () => {};
	}
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			onNear();
			observer.disconnect();
		},
		{ rootMargin }
	);
	observer.observe(node);
	return () => observer.disconnect();
}
