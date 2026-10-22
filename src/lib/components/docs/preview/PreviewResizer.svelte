<script lang="ts">
	import { MIN_PREVIEW_WIDTH, type PreviewFrame } from '$lib/hooks/use-preview-frame.svelte';

	type Props = {
		frame: PreviewFrame;
		width: number | null;
		onwidthchange: (width: number | null) => void;
		onresizingchange: (resizing: boolean) => void;
	};

	let { frame, width, onwidthchange, onresizingchange }: Props = $props();

	const INDICATOR_MS = 2000;
	const KEY_STEP = 10;
	const KEY_STEP_LARGE = 50;
	const HANDLE_INSET = 32;

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	let dragging = $state(false);
	let showIndicator = $state(false);
	let drag: { id: number; startX: number; startWidth: number } | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let lastWidth: number | null | undefined;

	const current = $derived(width ?? frame.fullWidth);

	// Briefly show the px readout whenever the width changes (not on first render).
	$effect(() => {
		const next = width;
		if (lastWidth === undefined) {
			lastWidth = next;
			return;
		}
		if (lastWidth === next) return;
		lastWidth = next;
		clearTimeout(hideTimer);
		if (next === null) {
			showIndicator = false;
			return;
		}
		showIndicator = true;
		hideTimer = setTimeout(() => (showIndicator = false), INDICATOR_MS);
	});

	$effect(() => () => {
		clearTimeout(hideTimer);
		delete document.documentElement.dataset.previewResizing;
	});

	function commit(next: number) {
		const rounded = Math.round(clamp(next, MIN_PREVIEW_WIDTH, frame.fullWidth));
		onwidthchange(rounded >= frame.fullWidth ? null : rounded);
	}

	function finishDrag(event: PointerEvent) {
		if (drag?.id !== event.pointerId) return;
		drag = null;
		dragging = false;
		onresizingchange(false);
		delete document.documentElement.dataset.previewResizing;
	}

	function onpointerdown(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		drag = { id: event.pointerId, startX: event.clientX, startWidth: current };
		dragging = true;
		onresizingchange(true);
		document.documentElement.dataset.previewResizing = '';
	}

	function onpointermove(event: PointerEvent) {
		if (drag?.id !== event.pointerId) return;
		commit(drag.startWidth + event.clientX - drag.startX);
	}

	function onkeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
		const targets: Record<string, number> = {
			ArrowLeft: current - step,
			ArrowRight: current + step,
			Home: MIN_PREVIEW_WIDTH,
			End: frame.fullWidth
		};
		if (!(event.key in targets)) return;
		event.preventDefault();
		commit(targets[event.key]);
	}
</script>

<!-- role="separator" with tabindex is the ARIA pattern for a focusable, keyboard-operable splitter. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="preview-resize-handle"
	role="separator"
	tabindex="0"
	aria-orientation="vertical"
	aria-label="Drag to resize preview"
	aria-valuemin={MIN_PREVIEW_WIDTH}
	aria-valuemax={frame.fullWidth}
	aria-valuenow={Math.round(current)}
	data-dragging={dragging ? '' : undefined}
	style:top="{frame.top + HANDLE_INSET}px"
	style:left="{frame.left + current}px"
	style:height="{Math.max(0, frame.height - HANDLE_INSET * 2)}px"
	{onpointerdown}
	{onpointermove}
	onpointerup={finishDrag}
	onpointercancel={finishDrag}
	onlostpointercapture={finishDrag}
	ondblclick={() => onwidthchange(null)}
	{onkeydown}
>
	<span class="preview-resize-bar"></span>
	<svg
		class="preview-resize-grip"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="9" cy="12" r="1" />
		<circle cx="9" cy="5" r="1" />
		<circle cx="9" cy="19" r="1" />
		<circle cx="15" cy="12" r="1" />
		<circle cx="15" cy="5" r="1" />
		<circle cx="15" cy="19" r="1" />
	</svg>
</div>
<div
	class="preview-width-indicator"
	aria-hidden="true"
	data-visible={dragging || (showIndicator && width !== null) ? '' : undefined}
	style:top="{frame.top + frame.height}px"
	style:left="{frame.left + frame.fullWidth / 2}px"
>
	{Math.round(current)}px
</div>
