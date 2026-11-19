import { createSpringValue } from '$lib/utils/springValue';

export type PreviewSpring = {
	get: () => number;
	set: (value: number) => void;
	jump: (value: number) => void;
	on: (event: 'change', listener: (value: number) => void) => () => void;
	stop: () => void;
};

export function createPreviewSpring(initial = 0): PreviewSpring {
	const listeners = new Set<(value: number) => void>();
	const spring = createSpringValue(initial, { stiffness: 180, damping: 27, mass: 1 }, (value) => {
		listeners.forEach((listener) => listener(value));
	});
	return {
		get: () => spring.value,
		set: (value) => spring.set(value),
		jump: (value) => spring.jump(value),
		on: (_event, listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		stop: () => spring.stop()
	};
}
