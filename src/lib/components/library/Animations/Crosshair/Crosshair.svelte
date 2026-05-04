<!-- @svelte-bits
{
  "title": "Crosshair",
  "description": "Animated crosshair lines that follow the cursor with subtle SVG turbulence on hover.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { gsap } from 'gsap';

	type Props = {
		color?: string;
		containerRef?: HTMLElement | null;
	};

	let { color = 'white', containerRef: container = null }: Props = $props();

	let lineH: HTMLDivElement;
	let lineV: HTMLDivElement;
	let filterX: SVGFETurbulenceElement;
	let filterY: SVGFETurbulenceElement;

	$effect(() => {
		const target: HTMLElement | Window = container || window;
		const mouse = { x: 0, y: 0 };

		const getPos = (e: MouseEvent) => {
			if (container) {
				const b = container.getBoundingClientRect();
				return { x: e.clientX - b.left, y: e.clientY - b.top };
			}
			return { x: e.clientX, y: e.clientY };
		};

		const handleMove = (ev: Event) => {
			const e = ev as MouseEvent;
			const p = getPos(e);
			mouse.x = p.x;
			mouse.y = p.y;
			if (container) {
				const b = container.getBoundingClientRect();
				const out =
					e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom;
				gsap.to([lineH, lineV], { opacity: out ? 0 : 1 });
			}
		};

		const rendered = {
			tx: { previous: 0, current: 0, amt: 0.15 },
			ty: { previous: 0, current: 0, amt: 0.15 }
		};

		gsap.set([lineH, lineV], { opacity: 0 });

		let raf = 0;
		const render = () => {
			rendered.tx.current = mouse.x;
			rendered.ty.current = mouse.y;
			rendered.tx.previous += (rendered.tx.current - rendered.tx.previous) * rendered.tx.amt;
			rendered.ty.previous += (rendered.ty.current - rendered.ty.previous) * rendered.ty.amt;
			gsap.set(lineV, { x: rendered.tx.previous });
			gsap.set(lineH, { y: rendered.ty.previous });
			raf = requestAnimationFrame(render);
		};

		const firstMove = (ev: Event) => {
			const e = ev as MouseEvent;
			const p = getPos(e);
			mouse.x = p.x;
			mouse.y = p.y;
			rendered.tx.previous = rendered.tx.current = mouse.x;
			rendered.ty.previous = rendered.ty.current = mouse.y;
			gsap.to([lineH, lineV], { duration: 0.9, ease: 'power3.out', opacity: 1 });
			raf = requestAnimationFrame(render);
			target.removeEventListener('mousemove', firstMove as EventListener);
		};

		target.addEventListener('mousemove', handleMove as EventListener);
		target.addEventListener('mousemove', firstMove as EventListener);

		const prim = { turbulence: 0 };
		const tl = gsap
			.timeline({
				paused: true,
				onStart: () => {
					lineH.style.filter = 'url(#filter-noise-x)';
					lineV.style.filter = 'url(#filter-noise-y)';
				},
				onUpdate: () => {
					filterX?.setAttribute('baseFrequency', String(prim.turbulence));
					filterY?.setAttribute('baseFrequency', String(prim.turbulence));
				},
				onComplete: () => {
					lineH.style.filter = 'none';
					lineV.style.filter = 'none';
				}
			})
			.to(prim, { duration: 0.5, ease: 'power1', startAt: { turbulence: 1 }, turbulence: 0 });

		const enter = () => tl.restart();
		const leave = () => {
			tl.progress(1).kill();
		};

		const linksRoot: ParentNode = container ?? document;
		const links = linksRoot.querySelectorAll<HTMLAnchorElement>('a');
		links.forEach((l) => {
			l.addEventListener('mouseenter', enter);
			l.addEventListener('mouseleave', leave);
		});

		return () => {
			cancelAnimationFrame(raf);
			target.removeEventListener('mousemove', handleMove as EventListener);
			target.removeEventListener('mousemove', firstMove as EventListener);
			links.forEach((l) => {
				l.removeEventListener('mouseenter', enter);
				l.removeEventListener('mouseleave', leave);
			});
		};
	});
</script>

<div
	class="{container ? 'absolute' : 'fixed'} top-0 left-0 w-full h-full pointer-events-none z-[10000]"
>
	<svg class="absolute top-0 left-0 w-full h-full" aria-hidden="true">
		<defs>
			<filter id="filter-noise-x">
				<feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" bind:this={filterX} />
				<feDisplacementMap in="SourceGraphic" scale="40" />
			</filter>
			<filter id="filter-noise-y">
				<feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" bind:this={filterY} />
				<feDisplacementMap in="SourceGraphic" scale="40" />
			</filter>
		</defs>
	</svg>
	<div
		bind:this={lineH}
		class="absolute w-full pointer-events-none opacity-0 transform translate-y-1/2"
		style="height:1px;background:{color};"
	></div>
	<div
		bind:this={lineV}
		class="absolute h-full pointer-events-none opacity-0 transform translate-x-1/2"
		style="width:1px;background:{color};"
	></div>
</div>
