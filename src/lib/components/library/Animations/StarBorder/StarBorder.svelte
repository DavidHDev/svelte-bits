<!-- @svelte-bits
{
  "title": "Star Border",
  "description": "Button-like wrapper with two animated radial-gradient sweeps tracing the top and bottom border."
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		as?: string;
		class?: string;
		color?: string;
		speed?: string;
		thickness?: number;
		[key: string]: unknown;
	};

	let {
		children,
		as = 'button',
		class: className = '',
		color = 'white',
		speed = '6s',
		thickness = 1,
		...rest
	}: Props = $props();

	const gradientBg = $derived(`radial-gradient(circle, ${color}, transparent 10%)`);
</script>

<svelte:element
	this={as}
	class="star-border relative inline-block overflow-hidden rounded-[20px] {className}"
	style:padding="{thickness}px 0"
	{...rest}
>
	<div
		class="star-sweep-bottom absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full z-0"
		style:background={gradientBg}
		style:animation-duration={speed}
	></div>
	<div
		class="star-sweep-top absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full z-0"
		style:background={gradientBg}
		style:animation-duration={speed}
	></div>
	<div class="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px]">
		{@render children?.()}
	</div>
</svelte:element>

<style>
	.star-sweep-bottom {
		animation-name: star-movement-bottom;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}
	.star-sweep-top {
		animation-name: star-movement-top;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}
	@keyframes star-movement-bottom {
		0% { transform: translate(0%, 0%); opacity: 1; }
		100% { transform: translate(-100%, 0%); opacity: 0; }
	}
	@keyframes star-movement-top {
		0% { transform: translate(0%, 0%); opacity: 1; }
		100% { transform: translate(100%, 0%); opacity: 0; }
	}
</style>
