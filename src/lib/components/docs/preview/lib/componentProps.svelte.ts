import { getContext, setContext } from 'svelte';
import { replaceState } from '$app/navigation';
import { theme } from '$lib/theme.svelte';
import { getBackgroundLightProps } from '$lib/constants/backgroundThemeProps';

type AnyProps = Record<string, unknown>;

type Parser = {
	parse: (value: string | null) => unknown;
	serialize: (value: unknown) => string;
};

const isHexColor = (value: unknown): value is string => typeof value === 'string' && /^#?[0-9a-fA-F]{3,8}$/.test(value);

const sameValue = (a: unknown, b: unknown) =>
	Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a) === JSON.stringify(b) : a === b;

const createParser = (defaultValue: unknown): Parser => {
	if (Array.isArray(defaultValue)) {
		return {
			parse: (v) =>
				v === null || v === ''
					? null
					: v.split(',').map((item) => (isHexColor(item) && !item.startsWith('#') ? `#${item}` : item)),
			serialize: (v) =>
				Array.isArray(v) ? v.map((item) => (isHexColor(item) ? item.replace(/^#/, '') : item)).join(',') : String(v)
		};
	}
	if (typeof defaultValue === 'number') {
		return { parse: (v) => (v === null || v === '' ? null : Number(v)), serialize: (v) => String(v) };
	}
	if (typeof defaultValue === 'boolean') {
		return { parse: (v) => (v === null || v === '' ? null : v === 'true'), serialize: (v) => String(v) };
	}
	if (typeof defaultValue === 'string' && defaultValue.startsWith('#') && isHexColor(defaultValue)) {
		return {
			parse: (v) => (v === null || v === '' ? null : isHexColor(v) ? `#${v.replace(/^#/, '')}` : v),
			serialize: (v) => (isHexColor(v) ? v.replace(/^#/, '') : String(v))
		};
	}
	return { parse: (v) => (v === null || v === '' ? null : v), serialize: (v) => String(v) };
};

export type ComponentPropsOptions<T extends AnyProps> = {
	lightProps?: Partial<T> | null;
	syncUrl?: boolean;
};

export class ComponentProps<T extends AnyProps> {
	readonly baseDefaults: T;
	readonly lightProps: Partial<T> | null;
	#parsers: Record<string, Parser>;
	#overrides = $state<Partial<T>>({});
	#syncUrl: boolean;

	constructor(defaults: T, options: ComponentPropsOptions<T> = {}) {
		this.baseDefaults = defaults;
		this.lightProps =
			options.lightProps === undefined ? (getBackgroundLightProps() as Partial<T> | null) : options.lightProps;
		this.#syncUrl = options.syncUrl ?? true;
		this.#parsers = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, createParser(value)]));
		if (this.#syncUrl && typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const initial: AnyProps = {};
			for (const key of Object.keys(defaults)) {
				const parsed = this.#parsers[key].parse(params.get(key));
				if (parsed !== null) initial[key] = parsed;
			}
			this.#overrides = initial as Partial<T>;
		}
	}

	get defaultProps(): T {
		return theme.colorMode === 'light' && this.lightProps
			? ({ ...this.baseDefaults, ...this.lightProps } as T)
			: this.baseDefaults;
	}

	get props(): T {
		return { ...this.defaultProps, ...this.#overrides } as T;
	}

	get hasChanges(): boolean {
		return Object.keys(this.#overrides).length > 0;
	}

	updateProp = <K extends keyof T>(name: K, value: T[K]) => {
		this.updateProps({ [name]: value } as unknown as Partial<T>);
	};

	updateProps = (updates: Partial<T>) => {
		const defaults = this.defaultProps;
		const next: AnyProps = { ...this.#overrides };
		for (const [name, value] of Object.entries(updates)) {
			if (sameValue(value, defaults[name])) delete next[name];
			else next[name] = value;
		}
		this.#overrides = next as Partial<T>;
		this.#writeUrl();
	};

	resetProps = () => {
		this.#overrides = {};
		this.#writeUrl();
	};

	#writeUrl() {
		if (!this.#syncUrl || typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		for (const key of Object.keys(this.baseDefaults)) url.searchParams.delete(key);
		for (const [key, value] of Object.entries(this.#overrides)) {
			url.searchParams.set(key, this.#parsers[key]?.serialize(value) ?? String(value));
		}
		if (url.href === window.location.href) return;
		try {
			replaceState(url, {});
		} catch {
			history.replaceState(history.state, '', url);
		}
	}
}

export const createComponentProps = <T extends AnyProps>(defaults: T, options?: ComponentPropsOptions<T>) =>
	new ComponentProps(defaults, options);

const valuesMatch = (value: unknown, defaultValue: unknown) => {
	if (Object.is(value, defaultValue)) return true;
	if (Array.isArray(value) || (value && typeof value === 'object')) {
		return JSON.stringify(value) === JSON.stringify(defaultValue);
	}
	return false;
};

export function themedProps<T extends AnyProps>(
	props: T,
	defaultProps: Partial<T>,
	lightProps: Partial<T> = {},
	darkProps: Partial<T> = {}
): T {
	const themeProps = theme.colorMode === 'light' ? lightProps : darkProps;
	return Object.fromEntries(
		Object.entries(props).map(([name, value]) => [
			name,
			Object.prototype.hasOwnProperty.call(themeProps, name) && valuesMatch(value, defaultProps[name])
				? themeProps[name]
				: value
		])
	) as T;
}

export type DemoContextValue = {
	readonly props: AnyProps;
	readonly defaultProps: AnyProps;
	readonly hasChanges: boolean;
	readonly demoOnlyProps: string[];
	readonly computedProps: AnyProps;
	readonly usage: string;
	readonly source: string;
	readonly componentName: string;
	readonly dependencies: string[];
	resetProps: () => void;
};

const DEMO_KEY = Symbol('svelte-bits-demo');
const CUSTOMIZE_KEY = Symbol('svelte-bits-customize');
const STAGE_KEY = Symbol('svelte-bits-stage');

export const setDemoContext = (value: DemoContextValue) => setContext(DEMO_KEY, value);
export const getDemoContext = () => getContext<DemoContextValue | undefined>(DEMO_KEY);

export type CustomizeActions = {
	readonly reset: (() => void) | null;
	readonly canReset: boolean;
};

export const setCustomizeActions = (value: CustomizeActions) => setContext(CUSTOMIZE_KEY, value);
export const getCustomizeActions = () => getContext<CustomizeActions | undefined>(CUSTOMIZE_KEY);

export type PreviewStage = {
	readonly controls: HTMLElement | null;
	readonly hasControls: boolean;
	readonly demo: {
		readonly mode: string;
		setMode: (value: string) => void;
		setNarrow: (value: boolean) => void;
		setPresent: (value: boolean) => void;
	} | null;
};

export const setPreviewStage = (value: PreviewStage) => setContext(STAGE_KEY, value);
export const getPreviewStage = () => getContext<PreviewStage | undefined>(STAGE_KEY);
