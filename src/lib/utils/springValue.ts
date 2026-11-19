export type SpringConfig = { stiffness: number; damping: number; mass: number };

export function createSpringValue(initial: number, config: SpringConfig, onChange: (value: number) => void) {
	let value = initial;
	let target = initial;
	let velocity = 0;
	let raf = 0;
	let last = 0;

	const step = (now: number) => {
		const dt = Math.min(0.064, (now - last) / 1000);
		last = now;
		const steps = Math.max(1, Math.ceil(dt / 0.004));
		const h = dt / steps;
		for (let i = 0; i < steps; i++) {
			const force = -config.stiffness * (value - target) - config.damping * velocity;
			velocity += (force / config.mass) * h;
			value += velocity * h;
		}
		if (Math.abs(velocity) < 0.01 && Math.abs(value - target) < 0.01) {
			value = target;
			velocity = 0;
			raf = 0;
			onChange(value);
			return;
		}
		onChange(value);
		raf = requestAnimationFrame(step);
	};

	return {
		get value() {
			return value;
		},
		set(next: number) {
			target = next;
			if (!raf) {
				last = performance.now();
				raf = requestAnimationFrame(step);
			}
		},
		jump(next: number) {
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
			value = target = next;
			velocity = 0;
			onChange(value);
		},
		stop() {
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
		}
	};
}
