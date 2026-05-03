const STORAGE_KEY = 'savedComponents';

function read(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
	} catch {
		return [];
	}
}

function write(list: string[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		window.dispatchEvent(new CustomEvent('favorites:updated', { detail: list }));
	} catch {
		/* noop */
	}
}

export const getSavedComponents = () => read();
export const isComponentSaved = (key: string) => read().includes(key);

export function removeSavedComponent(key: string) {
	const next = read().filter((item) => item !== key);
	write(next);
	return next;
}

export function toggleSavedComponent(key: string) {
	const list = read();
	if (list.includes(key)) {
		const next = list.filter((item) => item !== key);
		write(next);
		return { saved: false, list: next };
	}
	const next = [...list, key];
	write(next);
	return { saved: true, list: next };
}
