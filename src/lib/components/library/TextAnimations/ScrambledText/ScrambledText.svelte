<!-- @svelte-bits
{
  "title": "Scrambled Text",
  "description": "Detects cursor position and applies a distortion effect to text.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
  import { gsap } from "gsap";
  import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
  import { SplitText } from "gsap/SplitText";
  import type { Snippet } from "svelte";

  gsap.registerPlugin(SplitText, ScrambleTextPlugin);

  type Props = {
    radius?: number;
    duration?: number;
    speed?: number;
    scrambleChars?: string;
    className?: string;
    style?: string;
    children: Snippet;
  };

  let {
    radius = 100,
    duration = 1.2,
    speed = 0.5,
    scrambleChars = ".:",
    className = "",
    style = "",
    children,
  }: Props = $props();

  let rootEl = $state<HTMLDivElement | undefined>();

  $effect(() => {
    void radius;
    void duration;
    void speed;
    void scrambleChars;

    if (!rootEl) return;

    const pEl = rootEl.querySelector("p");
    if (!pEl) return;

    const split = SplitText.create(pEl, {
      type: "chars",
      charsClass: "inline-block will-change-transform",
    });

    split.chars.forEach((el) => {
      const c = el as HTMLElement;
      gsap.set(c, { attr: { "data-content": c.innerHTML } });
    });

    const handleMove = (e: PointerEvent) => {
      split.chars.forEach((el) => {
        const c = el as HTMLElement;
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || "",
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      });
    };

    rootEl.addEventListener("pointermove", handleMove);

    return () => {
      rootEl?.removeEventListener("pointermove", handleMove);
      split.revert();
    };
  });
</script>

<div
  bind:this={rootEl}
  class="m-[7vw] max-w-200 font-mono text-[clamp(14px,4vw,32px)] text-white {className}"
  {style}
>
  <p>{@render children()}</p>
</div>
