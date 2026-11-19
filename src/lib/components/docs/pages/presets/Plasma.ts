export const SHAPE = {
	speed: 1,
	twist: 1,
	wave: 1,
	softness: 0.5,
	shine: 1
};

export const DEFAULT_PROPS = {
	preset: 'silver',
	color: '#b8aca3',
	...SHAPE,
	direction: 'forward' as 'forward' | 'reverse' | 'pingpong',
	scale: 1,
	brightness: 1,
	grain: 0.04,
	quality: 0.75,
	fade: 0,
	opacity: 1,
	mouseInteractive: true,
	intro: true,
	lightMode: false
};

type PlasmaLook = typeof SHAPE & { color: string };

export const PRESETS: Record<string, PlasmaLook> = {
	silver: { ...SHAPE, color: '#b8aca3' },
	copper: { ...SHAPE, color: '#ff8a5c' },
	ocean: { ...SHAPE, color: '#4f7cff' },
	jade: { ...SHAPE, color: '#2fbf8f' },
	vortex: { ...SHAPE, color: '#b8aca3', twist: 1.8, speed: 1.3, softness: 0.3, shine: 1.4 }
};

export const PRESET_OPTIONS = [
	{ value: 'silver', label: 'Silver' },
	{ value: 'copper', label: 'Copper' },
	{ value: 'ocean', label: 'Ocean' },
	{ value: 'jade', label: 'Jade' },
	{ value: 'vortex', label: 'Vortex' }
];

type PlasmaProps = typeof DEFAULT_PROPS;

export const presetProps = (
	value: string,
	{ defaults = {} }: { light?: boolean; defaults?: Partial<PlasmaProps> } = {}
): Partial<PlasmaProps> => {
	const base = Object.fromEntries(
		Object.keys(DEFAULT_PROPS).map((name) => [name, defaults[name as keyof PlasmaProps]])
	) as Partial<PlasmaProps>;
	return {
		...base,
		...PRESETS[value]
	};
};
