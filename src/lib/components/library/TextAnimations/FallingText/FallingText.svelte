<!-- @svelte-bits
{
  "title": "Falling Text",
  "description": "Characters fall with gravity + bounce creating a playful entrance.",
  "dependencies": ["matter-js"]
}
-->
<script lang="ts">
  import Matter from "matter-js";

  type Props = {
    text?: string;
    highlightWords?: string[];
    highlightClass?: string;
    trigger?: "auto" | "scroll" | "click" | "hover";
    backgroundColor?: string;
    wireframes?: boolean;
    gravity?: number;
    mouseConstraintStiffness?: number;
    fontSize?: string;
  };

  let {
    text = "",
    highlightWords = [],
    highlightClass = "highlighted",
    trigger = "auto",
    backgroundColor = "transparent",
    wireframes = false,
    gravity = 1,
    mouseConstraintStiffness = 0.2,
    fontSize = "1rem",
  }: Props = $props();

  let containerEl = $state<HTMLDivElement | undefined>();
  let canvasEl = $state<HTMLCanvasElement | undefined>();

  let effectStarted = $state(false);

  const words = $derived(
    text.split(" ").map((word) => ({
      word,
      isHighlighted: highlightWords.some((hw) => word.startsWith(hw)),
    })),
  );

  let spanEls = $state<(HTMLSpanElement | undefined)[]>([]);

  $effect(() => {
    if (trigger === "auto") {
      effectStarted = true;
      return;
    }
    if (trigger === "scroll" && containerEl) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            effectStarted = true;
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(containerEl);
      return () => observer.disconnect();
    }
  });

  $effect(() => {
    if (!effectStarted) return;
    if (!containerEl || !canvasEl) return;
    if (spanEls.some((el) => !el)) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } =
      Matter;

    const containerRect = containerEl.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      canvas: canvasEl,
      engine,
      options: { width, height, background: backgroundColor, wireframes },
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: "transparent" },
    };
    const floor = Bodies.rectangle(
      width / 2,
      height + 25,
      width,
      50,
      boundaryOptions,
    );
    const leftWall = Bodies.rectangle(
      -25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );
    const rightWall = Bodies.rectangle(
      width + 25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );
    const ceiling = Bodies.rectangle(
      width / 2,
      -25,
      width,
      50,
      boundaryOptions,
    );

    const wordBodies = (spanEls as HTMLSpanElement[]).map((elem) => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: "transparent" },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2,
      });

      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 0 });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

      return { elem, body };
    });

    wordBodies.forEach(({ elem, body }) => {
      elem.style.position = "absolute";
      elem.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x / 2}px`;
      elem.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y / 2}px`;
      elem.style.transform = "none";
    });

    const mouse = Mouse.create(containerEl);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    });
    render.mouse = mouse;

    World.add(engine.world, [
      floor,
      leftWall,
      rightWall,
      ceiling,
      mouseConstraint,
      ...wordBodies.map((wb) => wb.body),
    ]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    let rafId: number;
    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
      rafId = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      cancelAnimationFrame(rafId);
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  });

  function handleTrigger() {
    if (!effectStarted && (trigger === "click" || trigger === "hover")) {
      effectStarted = true;
    }
  }
</script>

<div
  bind:this={containerEl}
  class="z-1 relative pt-8 w-full h-full overflow-hidden text-center cursor-pointer"
  onclick={trigger === "click" ? handleTrigger : undefined}
  onmouseenter={trigger === "hover" ? handleTrigger : undefined}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Enter" && handleTrigger()}
>
  <div class="inline-block" style:font-size={fontSize} style:line-height={1.4}>
    {#each words as { word, isHighlighted }, index (index)}
      <span
        bind:this={spanEls[index]}
        class="inline-block mx-0.5 select-none {isHighlighted
          ? highlightClass
          : ''}">{word}</span
      >
    {/each}
  </div>

  <canvas bind:this={canvasEl} class="top-0 left-0 z-0 absolute"></canvas>
</div>
