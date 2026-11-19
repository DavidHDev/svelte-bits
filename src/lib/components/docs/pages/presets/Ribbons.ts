export const LOOK = {
	colors: ['#ff3e00', '#FF8A4C', '#FFB089'],
	shape: 'lens' as 'lens' | 'comet' | 'even',
	thickness: 30,
	length: 1.4,
	spread: 18,
	stiffness: 0.5,
	bounce: 0.5,
	wave: 0,
	softness: 0,
	opacity: 1,
	fade: false
};

export type RibbonsLook = typeof LOOK;

export const PRESETS: Record<string, RibbonsLook> = {
	layers: LOOK,
	solo: { ...LOOK, colors: ['#ff3e00'], length: 1 },
	comet: {
		...LOOK,
		colors: ['#ff3e00', '#ff642e', '#ff8a5b', '#ffb089'],
		shape: 'comet',
		thickness: 26,
		length: 2.2,
		spread: 14,
		fade: true
	},
	glow: { ...LOOK, thickness: 36, length: 2.4, softness: 0.8, fade: true },
	streamers: {
		...LOOK,
		colors: ['#c2410c', '#ff3e00', '#ff642e', '#ff8a5b', '#ffb089'],
		shape: 'even',
		thickness: 10,
		length: 2.4,
		spread: 14,
		bounce: 0.7,
		wave: 0.5
	}
};

export const PRESET_OPTIONS = [
	{ value: 'layers', label: 'Layers' },
	{ value: 'solo', label: 'Solo' },
	{ value: 'comet', label: 'Comet' },
	{ value: 'glow', label: 'Glow' },
	{ value: 'streamers', label: 'Streamers' }
];

export const DEFAULT_PROPS = { preset: 'layers', ...LOOK };

export const presetProps = (
	value: string,
	{ defaults = {} }: { light?: boolean; defaults?: Record<string, unknown> } = {}
): Partial<RibbonsLook> => {
	const base = Object.fromEntries(Object.keys(LOOK).map(name => [name, defaults[name]])) as Partial<RibbonsLook>;
	return {
		...base,
		...PRESETS[value]
	};
};
