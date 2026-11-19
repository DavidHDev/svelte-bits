export const LOOK = {
	shardColor: '#BD896A',
	accentColor: '#FF8A4C',
	lightMode: false,
	placement: 'full' as 'full' | 'left' | 'right' | 'center',
	material: 'glass' as 'glass' | 'chrome',
	markers: 'plus' as 'plus' | 'dots' | 'none',
	count: 1300,
	shardSize: 1,
	spread: 1,
	twist: 1,
	billow: 1,
	speed: 1,
	scale: 1,
	depthOfField: 0.75,
	glow: 0.35,
	grain: 0.06,
	vignette: 0.3
};

type AeroShardsLook = typeof LOOK;

export const PRESETS: Record<string, Partial<AeroShardsLook>> = {
	ember: {},
	glacier: {
		shardColor: '#9cc9ff',
		accentColor: '#38bdf8',
		material: 'glass',
		placement: 'right',
		spread: 1.2,
		speed: 0.8
	},
	copper: {
		shardColor: '#e3a17a',
		accentColor: '#f97316',
		material: 'chrome',
		markers: 'dots',
		twist: 1.3,
		speed: 0.9
	},
	graphite: {
		shardColor: '#a8a29e',
		accentColor: '#e7e5e4',
		material: 'chrome',
		glow: 0.25,
		billow: 0.7
	},
	halo: {
		shardColor: '#f0d9a6',
		accentColor: '#fbbf24',
		placement: 'center',
		twist: 1.4,
		count: 1500
	}
};

export const LIGHT_SWAP: Record<string, Partial<AeroShardsLook>> = {
	ember: { lightMode: true, shardColor: '#b4532a', accentColor: '#ea580c' },
	glacier: { lightMode: true, shardColor: '#3b82f6', accentColor: '#0ea5e9' },
	copper: { lightMode: true, shardColor: '#c2410c', accentColor: '#f97316' },
	graphite: { lightMode: true, shardColor: '#44403c', accentColor: '#78716c' },
	halo: { lightMode: true, shardColor: '#a16207', accentColor: '#d97706' }
};

export const PRESET_OPTIONS = [
	{ value: 'ember', label: 'Ember' },
	{ value: 'glacier', label: 'Glacier' },
	{ value: 'copper', label: 'Copper' },
	{ value: 'graphite', label: 'Graphite' },
	{ value: 'halo', label: 'Halo' }
];

export const presetProps = (value: string, { light = false }: { light?: boolean } = {}) => {
	return {
		...LOOK,
		...PRESETS[value],
		...(light ? LIGHT_SWAP[value] : null)
	};
};
