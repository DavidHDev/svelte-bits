const DESKTOP_POINTER_QUERY = '(min-width: 968px) and (hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type NetworkInformation = EventTarget & { saveData?: boolean; effectiveType?: string };

const connection = (): NetworkInformation | undefined => {
	const nav = navigator as Navigator & {
		connection?: NetworkInformation;
		mozConnection?: NetworkInformation;
		webkitConnection?: NetworkInformation;
	};
	return nav.connection || nav.mozConnection || nav.webkitConnection;
};

const previewPreference = () => {
	if (typeof window === 'undefined') return false;
	const precisePointer = window.matchMedia(DESKTOP_POINTER_QUERY).matches;
	const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
	const info = connection();
	const constrained = Boolean(info?.saveData) || ['slow-2g', '2g'].includes(info?.effectiveType ?? '');
	return precisePointer && !reducedMotion && !constrained;
};

export function usePreviewMediaAllowed() {
	let allowed = $state(previewPreference());

	$effect(() => {
		const pointerQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
		const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
		const info = connection();
		const update = () => {
			allowed = previewPreference();
		};
		pointerQuery.addEventListener('change', update);
		motionQuery.addEventListener('change', update);
		info?.addEventListener?.('change', update);
		update();
		return () => {
			pointerQuery.removeEventListener('change', update);
			motionQuery.removeEventListener('change', update);
			info?.removeEventListener?.('change', update);
		};
	});

	return {
		get current() {
			return allowed;
		}
	};
}

export function useReducedMotion() {
	let reduced = $state(typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches);

	$effect(() => {
		const query = window.matchMedia(REDUCED_MOTION_QUERY);
		const update = () => {
			reduced = query.matches;
		};
		query.addEventListener('change', update);
		update();
		return () => query.removeEventListener('change', update);
	});

	return {
		get current() {
			return reduced;
		}
	};
}

const CATALOG_KEY = 'sveltebits:index-catalog';
const SESSION_KEY = 'sveltebits:index-new-this-visit';

const readList = (storage: Storage, key: string): string[] => {
	try {
		const value = JSON.parse(storage.getItem(key) || '[]');
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
};

export function readNewSinceLastVisit(keys: string[]): Set<string> {
	if (typeof window === 'undefined') return new Set();
	const currentKeys = [...keys].sort();
	let result: Set<string>;
	const sessionKeys = readList(window.sessionStorage, SESSION_KEY);
	if (sessionKeys.length > 0) {
		result = new Set(sessionKeys);
	} else {
		const previousKeys = readList(window.localStorage, CATALOG_KEY);
		if (previousKeys.length === 0) {
			result = new Set();
		} else {
			const previous = new Set(previousKeys);
			const discovered = currentKeys.filter((key) => !previous.has(key));
			try {
				window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(discovered));
			} catch {
				result = new Set(discovered);
			}
			result = new Set(discovered);
		}
	}
	try {
		window.localStorage.setItem(CATALOG_KEY, JSON.stringify(currentKeys));
	} catch {
		return result;
	}
	return result;
}
