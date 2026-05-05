<script lang="ts">
  import Customize from "$lib/components/docs/preview/Customize.svelte";
  import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
  import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
  import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
  import PropTable, {
    type PropRow,
  } from "$lib/components/docs/preview/PropTable.svelte";
  import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
  import ScrambledText from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte";
  import scrambledTextSource from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte?raw";

  const DEFAULTS = {
    radius: 100,
    duration: 1.2,
    speed: 0.5,
    scrambleChars: ".:",
  };

  let radius = $state(DEFAULTS.radius);
  let duration = $state(DEFAULTS.duration);
  let speed = $state(DEFAULTS.speed);
  let scrambleChars = $state(DEFAULTS.scrambleChars);

  let replay = $state(0);

  const hasChanges = $derived(
    radius !== DEFAULTS.radius ||
      duration !== DEFAULTS.duration ||
      speed !== DEFAULTS.speed ||
      scrambleChars !== DEFAULTS.scrambleChars,
  );

  function reset() {
    radius = DEFAULTS.radius;
    duration = DEFAULTS.duration;
    speed = DEFAULTS.speed;
    scrambleChars = DEFAULTS.scrambleChars;
    replay++;
  }

  const usage = $derived(`${"<" + 'script lang="ts">'}
  import ScrambledText from '$lib/components/ScrambledText.svelte';
${"</" + "script>"}

<ScrambledText
  className="scrambled-text-demo"
  radius={${radius}}
  duration={${duration}}
  speed={${speed}}
  scrambleChars="${scrambleChars}"
>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
  Similique pariatur dignissimos porro eius quam doloremque 
  et enim velit nobis maxime.
</ScrambledText>`);

  const props: PropRow[] = [
    {
      name: "radius",
      type: "number",
      default: "100",
      description:
        "The radius around the mouse pointer within which characters will scramble.",
    },
    {
      name: "duration",
      type: "number",
      default: "1.2",
      description: "The duration of the scramble effect on a character.",
    },
    {
      name: "speed",
      type: "number",
      default: "0.5",
      description: "The speed of the scramble animation.",
    },
    {
      name: "scrambleChars",
      type: "string",
      default: "'.:'",
      description: "The characters used for scrambling.",
    },
    {
      name: "className",
      type: "string",
      default: '""',
      description: "Additional CSS classes for the component.",
    },
    {
      name: "style",
      type: "string",
      default: '""',
      description: "Inline styles for the component.",
    },
  ];
</script>

<svelte:head>
  <title>Scrambled Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Scrambled Text</h1>

<TabsLayout
  onreset={reset}
  {hasChanges}
  componentName="ScrambledText"
  {usage}
  source={scrambledTextSource}
  {props}
>
  {#snippet preview()}
    <div class="relative p-0 h-125 overflow-hidden demo-container">
      {#key replay}
        <ScrambledText
          className="max-w-150 font-bold text-[1rem] text-(--color-primary)"
          {radius}
          {duration}
          {speed}
          {scrambleChars}
        >
          Once you hover over me, you will see the effect in action! You can
          customize the radius, duration, and speed of the scramble effect.
        </ScrambledText>
      {/key}
    </div>
  {/snippet}
  {#snippet code()}
    <DemoCodeTab slug="scrambled-text" {usage} source={scrambledTextSource} />
  {/snippet}
  {#snippet customize()}
    <Customize>
      <PreviewInput
        title="Scramble Characters"
        value={scrambleChars}
        placeholder="Enter text..."
        onChange={(v) => (scrambleChars = v)}
        maxlength={5}
      />
      <PreviewSlider
        title="Radius"
        min={10}
        max={300}
        step={10}
        value={radius}
        onChange={(v) => (radius = v)}
      />
      <PreviewSlider
        title="Duration"
        min={0.1}
        max={5}
        step={0.1}
        value={duration}
        onChange={(v) => (duration = v)}
      />
      <PreviewSlider
        title="Speed"
        min={0.1}
        max={2}
        step={0.1}
        value={speed}
        onChange={(v) => (speed = v)}
      />
    </Customize>
  {/snippet}
  {#snippet propTable()}
    <PropTable rows={props} />
  {/snippet}
</TabsLayout>
