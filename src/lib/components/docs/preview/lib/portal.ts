export function portal(node: HTMLElement, target: HTMLElement | null = null) {
	const host = target ?? document.body;
	host.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
