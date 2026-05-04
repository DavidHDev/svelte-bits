<!-- @svelte-bits
{
  "title": "Glare Hover",
  "description": "Hover-triggered moving glare highlight across a card.",
  "dependencies": []
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		width?: string;
		height?: string;
		background?: string;
		borderRadius?: string;
		borderColor?: string;
		glareColor?: string;
		glareOpacity?: number;
		glareAngle?: number;
		glareSize?: number;
		transitionDuration?: number;
		playOnce?: boolean;
		class?: string;
		style?: string;
	};

	let {
		children,
		width = '500px',
		height = '500px',
		background = '#000',
		borderRadius = '10px',
		borderColor = '#333',
		glareColor = '#ffffff',
		glareOpacity = 0.5,
		glareAngle = -45,
		glareSize = 250,
		transitionDuration = 650,
		playOnce = false,
		class: className = '',
		style = ''
	}: Props = $props();

	const rgba = $derived.by(() => {
		const hex = glareColor.replace('#', '');
		if (/^[\dA-Fa-f]{6}$/.test(hex)) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
		}
		if (/^[\dA-Fa-f]{3}$/.test(hex)) {
			const r = parseInt(hex[0] + hex[0], 16);
			const g = parseInt(hex[1] + hex[1], 16);
			const b = parseInt(hex[2] + hex[2], 16);
			return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
		}
		return glareColor;
	});

	let overlay: HTMLDivElement;

	function animateIn() {
		if (!overlay) return;
		overlay.style.transition = 'none';
		overlay.style.backgroundPosition = '-100% -100%, 0 0';
		// force reflow
		void overlay.offsetWidth;
		overlay.style.transition = `${transitionDuration}ms ease`;
		overlay.style.backgroundPosition = '100% 100%, 0 0';
	}

	function animateOut() {
		if (!overlay) return;
		if (playOnce) {
			overlay.style.transition = 'none';
			overlay.style.backgroundPosition = '-100% -100%, 0 0';
		} else {
			overlay.style.transition = `${transitionDuration}ms ease`;
			overlay.style.backgroundPosition = '-100% -100%, 0 0';
		}
	}
</script>

<div
	class="relative grid place-items-center overflow-hidden border cursor-pointer {className}"
	style="width:{width};height:{height};background:{background};border-radius:{borderRadius};border-color:{borderColor};{style}"
	onmouseenter={animateIn}
	onmouseleave={animateOut}
	role="presentation"
>
	<div
		bind:this={overlay}
		style="position:absolute;inset:0;background:linear-gradient({glareAngle}deg, hsla(0,0%,0%,0) 60%, {rgba} 70%, hsla(0,0%,0%,0) 100%);background-size:{glareSize}% {glareSize}%, 100% 100%;background-repeat:no-repeat;background-position:-100% -100%, 0 0;pointer-events:none;"
	></div>
	{#if children}{@render children()}{/if}
</div>
