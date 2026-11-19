import type { DocsIconName } from './icons';

export type IconSvgElement = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

export type AIMenuItemData = {
	key: string;
	label: string;
	icon: IconSvgElement | DocsIconName;
	run: () => void;
};
