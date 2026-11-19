export type ColorMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'svelte-bits-theme';

const readInitial = (): ColorMode => {
	if (typeof document === 'undefined') return 'dark';
	return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
};

class ThemeState {
	#mode = $state<ColorMode>(readInitial());

	get colorMode(): ColorMode {
		return this.#mode;
	}

	get isLight(): boolean {
		return this.#mode === 'light';
	}

	setColorMode = (mode: ColorMode) => {
		this.#mode = mode;
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-theme', mode);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch {
			return;
		}
	};

	toggleColorMode = () => {
		this.setColorMode(this.#mode === 'dark' ? 'light' : 'dark');
	};
}

export const theme = new ThemeState();

export const useColorMode = () => theme;

export const colorModeValue = <T>(light: T, dark: T): T => (theme.colorMode === 'light' ? light : dark);

const isEditingTarget = (target: EventTarget | null) =>
	target instanceof Element &&
	Boolean(
		target.closest(
			'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="searchbox"]'
		)
	);

export function installThemeShortcut() {
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
		const key = event.key.toLowerCase();
		if (key !== 'd' && key !== 't') return;
		if (isEditingTarget(event.target)) return;
		event.preventDefault();
		theme.toggleColorMode();
	};
	window.addEventListener('keydown', onKeyDown);
	return () => window.removeEventListener('keydown', onKeyDown);
}
