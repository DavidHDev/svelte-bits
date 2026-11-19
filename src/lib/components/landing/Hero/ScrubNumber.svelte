<script lang="ts">
	import { clamp, roundTo, type Field } from './hero';

	type Props = {
		value: number;
		field: Field & { min: number; max: number; step: number };
		onChange: (value: number) => void;
	};

	let { value, field, onChange }: Props = $props();

	let drag: { x: number; value: number } | null = null;
	let active = $state(false);

	const down = (event: PointerEvent) => {
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { x: event.clientX, value };
		active = true;
	};
	const move = (event: PointerEvent) => {
		if (!drag) return;
		const delta = ((event.clientX - drag.x) / 260) * (field.max - field.min);
		onChange(roundTo(clamp(drag.value + delta, field.min, field.max), field.step));
	};
	const up = () => {
		drag = null;
		active = false;
	};
	const key = (event: KeyboardEvent) => {
		const direction = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[
			event.key
		];
		if (!direction) return;
		event.preventDefault();
		const amount = field.step * (event.shiftKey ? 10 : 1) * direction;
		onChange(roundTo(clamp(value + amount, field.min, field.max), field.step));
	};
</script>

<span
	class="lh-scrub lh-value"
	role="slider"
	tabindex="0"
	aria-label={field.label}
	aria-valuemin={field.min}
	aria-valuemax={field.max}
	aria-valuenow={value}
	data-active={active ? '' : undefined}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onkeydown={key}
>{roundTo(value, field.step)}</span>
