export const NEW: string[] = ["True Focus", "Falling Text"];

export const UPDATED: string[] = [

];

export type Category = {
	name: string;
	subcategories: string[];
};

export const CATEGORIES: Category[] = [
	{
		name: 'Get Started',
		subcategories: ['Introduction', 'Installation', 'MCP Server', 'Index']
	},
	{
		name: 'Text Animations',
		subcategories: [
			'Split Text',
			'Blur Text',
			'Circular Text',
			'Text Type',
			'Shuffle',
			'Shiny Text',
			'Text Pressure',
			'Curved Loop',
			'Fuzzy Text',
			'Gradient Text',
			'Falling Text',
			'Text Cursor',
			'Decrypted Text',
			'True Focus',
			'Scroll Float',
			'Scroll Reveal',
			'ASCII Text',
			'Scrambled Text',
			'Rotating Text',
			'Glitch Text',
			'Scroll Velocity',
			'Variable Proximity',
			'Count Up'
		]
	},
	{
		name: 'Animations',
		subcategories: [
			'Animated Content',
			'Fade Content',
			'Electric Border',
			'Orbit Images',
			'Pixel Transition',
			'Glare Hover',
			'Antigravity',
			'Logo Loop',
			'Target Cursor',
			'Magic Rings',
			'Laser Flow',
			'Magnet Lines',
			'Ghost Cursor',
			'Gradual Blur',
			'Click Spark',
			'Magnet',
			'Sticker Peel',
			'Pixel Trail',
			'Cubes',
			'Metallic Paint',
			'Noise',
			'Shape Blur',
			'Crosshair',
			'Image Trail',
			'Ribbons',
			'Splash Cursor',
			'Meta Balls',
			'Blob Cursor',
			'Star Border'
		]
	},
	{
		name: 'Components',
		subcategories: [
			'Animated List',
			'Scroll Stack',
			'Bubble Menu',
			'Magic Bento',
			'Circular Gallery',
			'Reflective Card',
			'Card Nav',
			'Stack',
			'Fluid Glass',
			'Pill Nav',
			'Tilted Card',
			'Masonry',
			'Glass Surface',
			'Dome Gallery',
			'Chroma Grid',
			'Folder',
			'Staggered Menu',
			'Model Viewer',
			'Lanyard',
			'Profile Card',
			'Dock',
			'Gooey Nav',
			'Pixel Card',
			'Carousel',
			'Spotlight Card',
			'Border Glow',
			'Flying Posters',
			'Card Swap',
			'Glass Icons',
			'Decay Card',
			'Flowing Menu',
			'Elastic Slider',
			'Counter',
			'Infinite Menu',
			'Stepper',
			'Bounce Cards'
		]
	},
	{
		name: 'Backgrounds',
		subcategories: [
			'Liquid Ether',
			'Prism',
			'Dark Veil',
			'Light Pillar',
			'Silk',
			'Floating Lines',
			'Light Rays',
			'Pixel Blast',
			'Color Bends',
			'Evil Eye',
			'Line Waves',
			'Radar',
			'Soft Aurora',
			'Aurora',
			'Plasma',
			'Plasma Wave',
			'Particles',
			'Gradient Blinds',
			'Grainient',
			'Grid Scan',
			'Beams',
			'Pixel Snow',
			'Lightning',
			'Prismatic Burst',
			'Galaxy',
			'Dither',
			'Faulty Terminal',
			'Ripple Grid',
			'Dot Field',
			'Dot Grid',
			'Threads',
			'Hyperspeed',
			'Iridescence',
			'Waves',
			'Grid Distortion',
			'Ballpit',
			'Orb',
			'Letter Glitch',
			'Grid Motion',
			'Shape Grid',
			'Liquid Chrome',
			'Balatro'
		]
	}
];

// Slug helpers (kebab-case used in URLs).
export const slug = (s: string) => s.replace(/\s+/g, '-').toLowerCase();
export const decodeLabel = (s: string) =>
	s
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

// List of subcategory slugs that have a real implementation in svelte-bits.
// Anything not in this set renders a "Coming soon" placeholder on the demo page.
export const IMPLEMENTED_DEMOS = new Set<string>([
	'introduction',
	'installation',
	'mcp-server',
	'index',
	'shiny-text',
	'split-text',
	'animated-content',
	'dock',
	'aurora',
	'shape-grid',
	'magic-rings',
	'gradient-text',
	'glitch-text',
	'star-border',
	'splash-cursor',
	'noise',
	'blur-text',
	'fade-content',
	'dot-field',
	'color-bends',
	'liquid-ether',
	'faulty-terminal',
	'hyperspeed',
	'flying-posters',
	'true-focus',
	'falling-text'
]);

// Helper: is this subcategory label fully ported?
export const isImplemented = (sub: string): boolean => IMPLEMENTED_DEMOS.has(slug(sub));
