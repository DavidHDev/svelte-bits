import { getStarsCount } from '$lib/utils/stars';

const CACHE_KEY = 'github_stars_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const DEFAULT_STARS: string = '0';

/**
 * Reactive stars value. Fetches once per browser session,
 * caches in localStorage for 24 h, falls back to DEFAULT_STARS.
 */
export function useStars() {
	let stars = $state<string>(DEFAULT_STARS);

	if (typeof window !== 'undefined') {
		(async () => {
			try {
				const cachedData = localStorage.getItem(CACHE_KEY);
				if (cachedData) {
					const { count, timestamp } = JSON.parse(cachedData);
					const now = Date.now();
					if (now - timestamp < CACHE_DURATION && count && count !== 'NAN') {
						stars = count;
						return;
					}
				}
				const count = await getStarsCount();
				if (count && count !== 'NAN') {
					localStorage.setItem(
						CACHE_KEY,
						JSON.stringify({ count, timestamp: Date.now() })
					);
					stars = count;
				}
			} catch (err) {
				console.error('Error fetching stars:', err);
				const cachedData = localStorage.getItem(CACHE_KEY);
				if (cachedData) {
					try {
						const { count } = JSON.parse(cachedData);
						if (count && count !== 'NAN') stars = count;
					} catch {
						/* ignore */
					}
				}
			}
		})();
	}

	return {
		get value() {
			return stars;
		}
	};
}
