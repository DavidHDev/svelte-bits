import { GITHUB_API_URL } from '$lib/constants/site';

const formatNumber = (num: number): string => {
	if (num < 1000) return num.toString();
	const rounded = Math.ceil(num / 100) * 100;
	return new Intl.NumberFormat('en', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(rounded);
};

export const getStarsCount = async (): Promise<string | null> => {
	try {
		const response = await fetch(GITHUB_API_URL);
		const data = await response.json();
		if (typeof data.stargazers_count !== 'number') return null;
		return String(formatNumber(data.stargazers_count)).toUpperCase();
	} catch (error) {
		console.error('Error fetching stargazers count:', error);
		return null;
	}
};
