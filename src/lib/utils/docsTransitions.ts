export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
	const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
	const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
	const solve = (x: number) => {
		let t = x;
		for (let i = 0; i < 8; i++) {
			const error = sampleX(t) - x;
			if (Math.abs(error) < 1e-6) return t;
			const slope = slopeX(t);
			if (Math.abs(slope) < 1e-6) break;
			t -= error / slope;
		}
		let lo = 0;
		let hi = 1;
		t = x;
		while (lo < hi) {
			const value = sampleX(t);
			if (Math.abs(value - x) < 1e-6) return t;
			if (x > value) lo = t;
			else hi = t;
			t = (hi + lo) / 2;
			if (hi - lo < 1e-6) break;
		}
		return t;
	};
	return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}

export const easeOutQuint = cubicBezier(0.23, 1, 0.32, 1);
export const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1);

type ShiftOptions = {
	x?: number;
	y?: number;
	blur?: number;
	scale?: number;
	duration?: number;
	reduce?: boolean;
	absolute?: boolean;
	base?: string;
	easing?: (t: number) => number;
};

export function shift(_node: Element, options: ShiftOptions = {}) {
	const {
		x = 0,
		y = 0,
		blur = 0,
		scale = 1,
		duration = 220,
		reduce = false,
		absolute = false,
		base = '',
		easing = easeOutQuint
	} = options;
	return {
		duration: reduce ? 0 : duration,
		easing,
		css: (t: number, u: number) => {
			const moves = reduce ? '' : `translate(${u * x}px, ${u * y}px) scale(${1 + (scale - 1) * u})`;
			return `${absolute ? 'position:absolute;' : ''}opacity:${t};transform:${base} ${moves};${
				blur && !reduce ? `filter:blur(${u * blur}px);` : ''
			}`;
		}
	};
}
