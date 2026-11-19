import type { Component } from 'svelte';

const modules = import.meta.glob([
	'/src/lib/components/library/Backgrounds/GradientWaves/GradientWaves.svelte',
	'/src/lib/components/library/Backgrounds/DotGrid/DotGrid.svelte',
	'/src/lib/components/library/Backgrounds/MicroSlats/MicroSlats.svelte',
	'/src/lib/components/library/Backgrounds/ShapeWaves/ShapeWaves.svelte',
	'/src/lib/components/library/Backgrounds/Topography/Topography.svelte',
	'/src/lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte',
	'/src/lib/components/library/Animations/ElectricLogo/ElectricLogo.svelte',
	'/src/lib/components/library/TextAnimations/TechText/TechText.svelte',
	'/src/lib/components/library/Components/CircularCarousel/CircularCarousel.svelte',
	'/src/lib/components/library/Micro/HoldButton/HoldButton.svelte'
]);

export type LibraryComponent = Component<Record<string, unknown>>;

const keyFor = (path: string) => `/src/lib/components/library/${path}/${path.split('/').pop()}.svelte`;

export const hasLibrary = (path: string) => keyFor(path) in modules;

export const loadLibrary = async (path: string): Promise<LibraryComponent | null> => {
	const loader = modules[keyFor(path)];
	if (!loader) return null;
	try {
		const module = (await loader()) as { default: LibraryComponent };
		return module.default;
	} catch {
		return null;
	}
};

const presetModules = import.meta.glob('/src/lib/components/docs/pages/presets/GradientWaves.ts', { eager: true });

export type GradientWavesPresets = {
	LOOK: Record<string, unknown>;
	PRESET_OPTIONS: { value: string; label: string }[];
	presetProps: (
		value: string,
		options?: { light?: boolean; defaults?: Record<string, unknown> }
	) => Record<string, unknown>;
};

export const gradientWavesPresets = (presetModules['/src/lib/components/docs/pages/presets/GradientWaves.ts'] ??
	null) as GradientWavesPresets | null;
