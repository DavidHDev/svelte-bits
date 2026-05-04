export const COMPONENT_DEPENDENCIES: Record<string, string[]> = {
	'animated-content': ['gsap'],
	'aurora': ['ogl'],
	'blur-text': ['motion'],
	'color-bends': ['three'],
	'dock': ['motion'],
	'fade-content': ['gsap'],
	'faulty-terminal': ['ogl'],
	'flying-posters': ['ogl'],
	'gradient-text': ['motion'],
	'hyperspeed': ['three', 'postprocessing'],
	'liquid-ether': ['three'],
	'magic-rings': ['three'],
	'split-text': ['gsap'],
	'true-focus': ['motion'],
	'falling-text': ['matter-js'],
	'count-up': ['motion'],
	'scroll-float': ['gsap']
};

export function dependenciesForSlug(slug: string | undefined): string[] {
	return slug ? (COMPONENT_DEPENDENCIES[slug] ?? []) : [];
}
