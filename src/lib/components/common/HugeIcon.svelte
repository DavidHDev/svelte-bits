<script lang="ts">
	type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

	type Props = {
		icon: IconNode;
		size?: number | string;
		strokeWidth?: number;
		color?: string;
		class?: string;
		'aria-hidden'?: boolean | 'true' | 'false';
	};

	let { icon, size = 24, strokeWidth, color = 'currentColor', class: className = '', ...rest }: Props = $props();

	const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
	const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

	const markup = $derived(
		icon
			.map(([tag, attrs]) => {
				const parts = Object.entries(attrs)
					.filter(([name]) => name !== 'key')
					.map(([name, value]) => {
						let next = String(value);
						if (name === 'strokeWidth' && strokeWidth !== undefined) next = String(strokeWidth);
						if ((name === 'stroke' || name === 'fill') && next === 'currentColor') next = color;
						return `${kebab(name)}="${escape(next)}"`;
					});
				return `<${tag} ${parts.join(' ')} />`;
			})
			.join('')
	);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	class={className}
	aria-hidden={rest['aria-hidden'] ?? true}
>
	{@html markup}
</svg>
