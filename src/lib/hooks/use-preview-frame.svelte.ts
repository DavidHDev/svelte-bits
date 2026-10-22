import { untrack } from 'svelte';

export const MIN_PREVIEW_WIDTH = 320;

export type PreviewFrame = {
	top: number;
	left: number;
	height: number;
	fullWidth: number;
};

const sameFrame = (a: PreviewFrame | null, b: PreviewFrame | null) =>
	a !== null &&
	b !== null &&
	a.top === b.top &&
	a.left === b.left &&
	a.height === b.height &&
	a.fullWidth === b.fullWidth;

function readFrame(panel: HTMLElement): { demo: HTMLElement | null; frame: PreviewFrame | null } {
	const demo = panel.querySelector<HTMLElement>(':scope > .demo-container');
	const parent = demo?.parentElement;
	if (!demo || !parent) return { demo: null, frame: null };
	const panelRect = panel.getBoundingClientRect();
	const demoRect = demo.getBoundingClientRect();
	if (panelRect.width === 0 || demoRect.width === 0) return { demo, frame: null };
	const parentRect = parent.getBoundingClientRect();
	const contentRight =
		parentRect.left +
		parent.clientLeft +
		parent.clientWidth -
		parseFloat(getComputedStyle(parent).paddingRight);
	return {
		demo,
		frame: {
			top: demoRect.top - panelRect.top - panel.clientTop,
			left: demoRect.left - panelRect.left - panel.clientLeft,
			height: demoRect.height,
			fullWidth: Math.max(MIN_PREVIEW_WIDTH, Math.floor(contentRight - demoRect.left))
		}
	};
}

/** Tracks where the demo box sits inside the preview panel and how wide it can grow. */
export class UsePreviewFrame {
	current = $state<PreviewFrame | null>(null);

	/** Starts measuring `panel`; returns a cleanup function for use in an `$effect`. */
	observe(panel: HTMLElement) {
		let observed: HTMLElement | null = null;
		const observer = new ResizeObserver(() => measure());
		const measure = () => {
			const { demo, frame } = readFrame(panel);
			if (demo !== observed) {
				if (observed) observer.unobserve(observed);
				if (demo) observer.observe(demo);
				observed = demo;
			}
			// observe() runs inside an $effect; reading `current` tracked would make that effect re-run on its own write.
			const previous = untrack(() => this.current);
			if (!sameFrame(previous, frame)) this.current = frame;
		};
		observer.observe(panel);
		measure();
		return () => {
			observer.disconnect();
			this.current = null;
		};
	}
}
