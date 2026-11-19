<script lang="ts">
	import Icon from './Icon.svelte';
	import { MIN_PREVIEW_WIDTH, type PreviewFrame } from './lib/previewFrame';

	type Props = {
		frame: PreviewFrame | null;
		width: number | null;
		onWidthChange: (width: number | null) => void;
		onResizingChange: (resizing: boolean) => void;
	};

	let { frame, width, onWidthChange, onResizingChange }: Props = $props();

	const INDICATOR_MS = 2000;
	const KEY_STEP = 10;
	const KEY_STEP_LARGE = 50;
	const HANDLE_INSET = 32;

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	let dragging = $state(false);
	let showIndicator = $state(false);
	let drag: { id: number; startX: number; startWidth: number } | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let lastWidth: number | null = null;
	let pendingWidth: number | null = null;
	let resizeRaf = 0;

	$effect(() => {
		const w = width;
		if (lastWidth === w) return;
		lastWidth = w;
		if (w === null) {
			showIndicator = false;
			return;
		}
		showIndicator = true;
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => (showIndicator = false), INDICATOR_MS);
	});

	$effect(() => () => {
		clearTimeout(hideTimer);
		cancelAnimationFrame(resizeRaf);
		delete document.documentElement.dataset.previewResizing;
	});

	const current = $derived(frame ? (width ?? frame.fullWidth) : 0);

	function commit(next: number) {
		if (!frame) return;
		const rounded = Math.round(clamp(next, MIN_PREVIEW_WIDTH, frame.fullWidth));
		onWidthChange(rounded >= frame.fullWidth ? null : rounded);
	}

	function flushWidth() {
		cancelAnimationFrame(resizeRaf);
		resizeRaf = 0;
		if (pendingWidth === null) return;
		const next = pendingWidth;
		pendingWidth = null;
		commit(next);
	}

	function finishDrag(event: PointerEvent) {
		if (drag?.id !== event.pointerId) return;
		flushWidth();
		drag = null;
		dragging = false;
		onResizingChange(false);
		delete document.documentElement.dataset.previewResizing;
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { id: event.pointerId, startX: event.clientX, startWidth: current };
		dragging = true;
		onResizingChange(true);
		document.documentElement.dataset.previewResizing = '';
	}

	function onPointerMove(event: PointerEvent) {
		if (drag?.id !== event.pointerId) return;
		pendingWidth = drag.startWidth + event.clientX - drag.startX;
		if (!resizeRaf) resizeRaf = requestAnimationFrame(flushWidth);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (!frame) return;
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

{#if frame}
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
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={finishDrag}
		onpointercancel={finishDrag}
		onlostpointercapture={finishDrag}
		ondblclick={() => onWidthChange(null)}
		onkeydown={onKeyDown}
	>
		<span class="preview-resize-bar"></span>
		<Icon name="GripVertical" class="preview-resize-grip" />
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
{/if}
