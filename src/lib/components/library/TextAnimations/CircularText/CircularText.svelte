<!-- @svelte-bits
{
  "title": "Circular Text",
  "description": "Layouts characters around a circle with optional rotation animation.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
  import { animate, type AnimationPlaybackControls } from "motion";

  type Props = {
    text: string;
    spinDuration?: number;
    onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers";
    className?: string;
  };

  let {
    text,
    spinDuration = 20,
    onHover = "speedUp",
    className = "",
  }: Props = $props();

  const letters = $derived(Array.from(text));

  let divEl = $state<HTMLDivElement | undefined>();
  let currentRotation = 0;
  let controls: AnimationPlaybackControls | undefined;

  function getRotationTransition(
    duration: number,
    from: number,
    loop: boolean = true,
  ) {
    return {
      from,
      to: from + 360,
      ease: "linear" as const,
      duration,
      repeat: loop ? Infinity : 0,
    };
  }

  function startAnimation(duration: number, scale: number = 1) {
    if (!divEl) return;
    controls?.stop();
    controls = animate(
      divEl,
      {
        rotate: [currentRotation, currentRotation + 360],
        scale,
      },
      {
        rotate: getRotationTransition(duration, currentRotation),
        scale: { type: "spring", damping: 20, stiffness: 300 },
      } as never,
    );

    controls.finished
      .then(() => {
        currentRotation = (currentRotation + 360) % 360;
      })
      .catch(() => {});
  }

  $effect(() => {
    void text;
    void spinDuration;
    void onHover;
    if (!divEl) return;
    startAnimation(spinDuration);
  });

  function handleMouseEnter() {
    if (!onHover) return;
    switch (onHover) {
      case "slowDown":
        startAnimation(spinDuration * 2);
        break;
      case "speedUp":
        startAnimation(spinDuration / 4);
        break;
      case "pause":
        controls?.stop();
        break;
      case "goBonkers":
        startAnimation(spinDuration / 20, 0.8);
        break;
    }
  }

  function handleMouseLeave() {
    startAnimation(spinDuration);
  }
</script>

<div
  bind:this={divEl}
  role="img"
  class="m-0 mx-auto rounded-full w-50 h-50 relative font-black text-white text-center cursor-pointer origin-center {className}"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  {#each letters as letter, i (i)}
    {@const rotationDeg = (360 / letters.length) * i}
    {@const factor = Math.PI / letters.length}
    {@const x = factor * i}
    {@const y = factor * i}
    {@const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`}
    <span
      class="inline-block absolute inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
      style:transform
      style:-webkit-transform={transform}
    >
      {letter}
    </span>
  {/each}
</div>
