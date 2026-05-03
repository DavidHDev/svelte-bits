<!-- @svelte-bits
{
  "title": "Dock",
  "description": "macOS-style magnification dock with spring physics. Each item scales smoothly based on cursor distance.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import {
		motionValue,
		animate,
		transform,
		type MotionValue,
		type SpringOptions
	} from 'motion';
	import type { Snippet } from 'svelte';

	export type DockItemData = {
		icon: Snippet;
		label: string;
		onClick?: () => void;
		class?: string;
	};

	type DockItemActionParams = {
		mouseX: MotionValue<number>;
		spring: SpringOptions;
		distance: number;
		baseItemSize: number;
		magnification: number;
		setSize: (v: number) => void;
	};

	// Svelte action that mirrors the upstream DockItem motion chain:
	//   mouseX → mouseDistance → targetSize (useTransform) → spring → applied size
	export function dockItem(node: HTMLElement, params: DockItemActionParams) {
		let { mouseX, spring, distance, baseItemSize, magnification, setSize } = params;

		const target = motionValue(baseItemSize);
		const animated = motionValue(baseItemSize);
		let currentAnim: ReturnType<typeof animate> | null = null;

		const compute = (mx: number) => {
			const rect = node.getBoundingClientRect();
			const md = mx - rect.x - baseItemSize / 2;
			return transform([-distance, 0, distance], [baseItemSize, magnification, baseItemSize])(md);
		};

		const offTarget = target.on('change', (v: number) => {
			currentAnim?.stop?.();
			currentAnim = animate(animated, v, { type: 'spring', ...spring });
		});
		const offAnimated = animated.on('change', (v: number) => setSize(v));
		const offMouse = mouseX.on('change', (mx: number) => target.set(compute(mx)));
		target.set(compute(mouseX.get()));

		return {
			update(next: DockItemActionParams) {
				distance = next.distance;
				baseItemSize = next.baseItemSize;
				magnification = next.magnification;
				spring = next.spring;
			},
			destroy() {
				offTarget();
				offAnimated();
				offMouse();
				currentAnim?.stop?.();
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		items: DockItemData[];
		class?: string;
		distance?: number;
		panelHeight?: number;
		baseItemSize?: number;
		dockHeight?: number;
		magnification?: number;
		spring?: SpringOptions;
	};

	let {
		items,
		class: className = '',
		spring = { mass: 0.1, stiffness: 150, damping: 12 },
		magnification = 70,
		distance = 200,
		panelHeight = 64,
		dockHeight = 256,
		baseItemSize = 50
	}: Props = $props();

	const maxHeight = $derived(Math.max(dockHeight, magnification + magnification / 2 + 4));

	const mouseX: MotionValue<number> = motionValue(Infinity);
	const isHovered: MotionValue<number> = motionValue(0);

	let outerHeight = $state(panelHeight);

	// Per-item size state (parallel array indexed by item index)
	let sizes = $state<number[]>(items.map(() => baseItemSize));
	$effect(() => {
		// keep array length in sync
		if (sizes.length !== items.length) {
			sizes = items.map(() => baseItemSize);
		}
	});

	// Per-item label visibility
	let labelVisible = $state<boolean[]>(items.map(() => false));
	$effect(() => {
		if (labelVisible.length !== items.length) {
			labelVisible = items.map(() => false);
		}
	});

	onMount(() => {
		const heightTarget = motionValue(panelHeight);
		const heightAnimated = motionValue(panelHeight);

		let curAnim: ReturnType<typeof animate> | null = null;
		const offTarget = heightTarget.on('change', (v: number) => {
			curAnim?.stop?.();
			curAnim = animate(heightAnimated, v, { type: 'spring', ...spring });
		});
		const offAnim = heightAnimated.on('change', (v: number) => (outerHeight = v));
		const offHover = isHovered.on('change', (v: number) => {
			heightTarget.set(transform([0, 1], [panelHeight, maxHeight])(v));
		});

		return () => {
			offTarget();
			offAnim();
			offHover();
			curAnim?.stop?.();
		};
	});
</script>

<div
	class="mx-2 flex max-w-full items-center"
	style:height="{outerHeight}px"
	style:scrollbar-width="none"
>
	<div
		class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-neutral-700 border-2 pb-2 px-4 {className}"
		style:height="{panelHeight}px"
		role="toolbar"
		tabindex="-1"
		aria-label="Application dock"
		onmousemove={(e) => {
			isHovered.set(1);
			mouseX.set(e.pageX);
		}}
		onmouseleave={() => {
			isHovered.set(0);
			mouseX.set(Infinity);
		}}
	>
		{#each items as item, i (i)}
			<div
				use:dockItem={{
					mouseX,
					spring,
					distance,
					baseItemSize,
					magnification,
					setSize: (v: number) => (sizes[i] = v)
				}}
				style:width="{sizes[i] ?? baseItemSize}px"
				style:height="{sizes[i] ?? baseItemSize}px"
				class="relative inline-flex items-center justify-center rounded-full bg-[#120F17] border-neutral-700 border-2 shadow-md cursor-pointer {item.class ?? ''}"
				tabindex="0"
				role="button"
				aria-haspopup="true"
				aria-label={item.label}
				onmouseenter={() => (labelVisible[i] = true)}
				onmouseleave={() => (labelVisible[i] = false)}
				onfocus={() => (labelVisible[i] = true)}
				onblur={() => (labelVisible[i] = false)}
				onclick={() => item.onClick?.()}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						item.onClick?.();
					}
				}}
			>
				<div class="flex items-center justify-center">
					{@render item.icon()}
				</div>

				{#if labelVisible[i]}
					<div
						role="tooltip"
						class="absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#120F17] px-2 py-0.5 text-xs text-white"
						style:transform="translateX(-50%) translateY(-10px)"
						style:opacity="1"
						style:transition="opacity 200ms ease, transform 200ms ease"
					>
						{item.label}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
