const INTENT_THRESHOLD_PX = 6;

export type ScrubGestureOptions = {
	track: () => HTMLElement | null;
	computeValue: (clientX: number) => number;
	onChange: (value: number) => void;
	isDisabled: () => boolean;
};

export class ScrubGesture {
	isDragging = $state(false);
	#dragging = false;
	#pending: { id: number; x: number; y: number } | null = null;
	#opts: ScrubGestureOptions;

	constructor(opts: ScrubGestureOptions) {
		this.#opts = opts;
	}

	#begin(e: PointerEvent) {
		this.#dragging = true;
		this.isDragging = true;
		this.#opts.track()?.setPointerCapture(e.pointerId);
		this.#opts.onChange(this.#opts.computeValue(e.clientX));
	}

	#end() {
		this.#dragging = false;
		this.#pending = null;
		this.isDragging = false;
	}

	onPointerDown = (e: PointerEvent) => {
		if (this.#opts.isDisabled()) return;
		if (e.pointerType === 'touch') {
			this.#pending = { id: e.pointerId, x: e.clientX, y: e.clientY };
			return;
		}
		e.preventDefault();
		this.#begin(e);
	};

	onPointerMove = (e: PointerEvent) => {
		const pending = this.#pending;
		if (pending) {
			if (e.pointerId !== pending.id) return;
			const dx = e.clientX - pending.x;
			const dy = e.clientY - pending.y;
			if (Math.abs(dx) < INTENT_THRESHOLD_PX && Math.abs(dy) < INTENT_THRESHOLD_PX) return;
			this.#pending = null;
			if (Math.abs(dy) >= Math.abs(dx)) return;
			this.#begin(e);
			return;
		}
		if (!this.#dragging) return;
		this.#opts.onChange(this.#opts.computeValue(e.clientX));
	};

	onPointerUp = (e: PointerEvent) => {
		if (this.#pending?.id === e.pointerId) this.#opts.onChange(this.#opts.computeValue(e.clientX));
		this.#end();
	};

	onPointerCancel = () => this.#end();
}
