export type TooltipOptions = {
	label: string;
	placement?: 'top' | 'bottom';
	gutter?: number;
	openDelay?: number;
	closeDelay?: number;
};

export function tooltip(node: HTMLElement, initial: TooltipOptions) {
	let options = initial;
	let el: HTMLDivElement | null = null;
	let openTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const position = () => {
		if (!el) return;
		const rect = node.getBoundingClientRect();
		const gutter = options.gutter ?? 8;
		const width = el.offsetWidth;
		const height = el.offsetHeight;
		const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 8), window.innerWidth - width - 8);
		const top = (options.placement ?? 'top') === 'top' ? rect.top - height - gutter : rect.bottom + gutter;
		el.style.left = `${left}px`;
		el.style.top = `${top}px`;
	};

	const show = () => {
		clearTimeout(closeTimer);
		if (el) return;
		openTimer = setTimeout(() => {
			el = document.createElement('div');
			el.className = 'docs-tooltip docs-tooltip-floating';
			el.setAttribute('role', 'tooltip');
			el.textContent = options.label;
			el.style.position = 'fixed';
			el.style.zIndex = '1600';
			document.body.appendChild(el);
			position();
		}, options.openDelay ?? 300);
	};

	const hide = () => {
		clearTimeout(openTimer);
		closeTimer = setTimeout(() => {
			el?.remove();
			el = null;
		}, options.closeDelay ?? 80);
	};

	const hideNow = () => {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
		el?.remove();
		el = null;
	};

	node.addEventListener('pointerenter', show);
	node.addEventListener('pointerleave', hide);
	node.addEventListener('focus', show);
	node.addEventListener('blur', hide);
	node.addEventListener('pointerdown', hideNow);

	return {
		update(next: TooltipOptions) {
			options = next;
			if (el) {
				el.textContent = options.label;
				position();
			}
		},
		destroy() {
			node.removeEventListener('pointerenter', show);
			node.removeEventListener('pointerleave', hide);
			node.removeEventListener('focus', show);
			node.removeEventListener('blur', hide);
			node.removeEventListener('pointerdown', hideNow);
			hideNow();
		}
	};
}
