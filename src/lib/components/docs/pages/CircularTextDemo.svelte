<script lang="ts">
  import Customize from "$lib/components/docs/preview/Customize.svelte";
  import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
  import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
  import PreviewSelect from "$lib/components/docs/preview/PreviewSelect.svelte";
  import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
  import PropTable, {
    type PropRow,
  } from "$lib/components/docs/preview/PropTable.svelte";
  import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
  import CircularText from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte";
  import source from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte?raw";

  const DEFAULTS = {
    text: "SVELTE*BITS*COMPONENTS*",
    onHover: "speedUp" as "slowDown" | "speedUp" | "pause" | "goBonkers",
    spinDuration: 20,
  };

  let text = $state(DEFAULTS.text);
  let onHover = $state<"slowDown" | "speedUp" | "pause" | "goBonkers">(
    DEFAULTS.onHover,
  );
  let spinDuration = $state(DEFAULTS.spinDuration);

  let replay = $state(0);

  const hasChanges = $derived(
    text !== DEFAULTS.text ||
      onHover !== DEFAULTS.onHover ||
      spinDuration !== DEFAULTS.spinDuration,
  );

  function reset() {
    text = DEFAULTS.text;
    onHover = DEFAULTS.onHover;
    spinDuration = DEFAULTS.spinDuration;
    replay++;
  }

  const usage = $derived(`${"<" + 'script lang="ts">'}
  import CircularText from '$lib/components/CircularText.svelte';
${"</" + "script>"}

<CircularText
  text="${text}"
  onHover="${onHover}"
  spinDuration={${spinDuration}}
  className="custom-class"
/>`);

  const props: PropRow[] = [
    {
      name: "text",
      type: "string",
      default: "''",
      description: "The text to display in a circular layout.",
    },
    {
      name: "spinDuration",
      type: "number",
      default: "20",
      description: "The duration (in seconds) for one full rotation.",
    },
    {
      name: "onHover",
      type: "'slowDown' | 'speedUp' | 'pause' | 'goBonkers'",
      default: "undefined",
      description:
        "Specifies the hover behavior variant. Options include 'slowDown', 'speedUp', 'pause', and 'goBonkers'.",
    },
    {
      name: "className",
      type: "string",
      default: "''",
      description: "Optional additional CSS classes to apply to the component.",
    },
  ];
</script>

<svelte:head>
  <title>Circular Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Circular Text</h1>

<TabsLayout
  onreset={reset}
  {hasChanges}
  componentName="CircularText"
  {usage}
  {source}
  {props}
>
  {#snippet preview()}
    <div class="relative p-0 h-125 overflow-hidden demo-container">
      {#key replay}
        <CircularText {text} {onHover} {spinDuration} />
      {/key}
    </div>
  {/snippet}
  {#snippet code()}
    <DemoCodeTab slug="circular-text" {usage} {source} />
  {/snippet}
  {#snippet customize()}
    <Customize>
      <PreviewInput
        title="Text"
        value={text}
        placeholder="Enter text..."
        onChange={(v) => (text = v)}
      />
      <PreviewSelect
        title="On Hover"
        options={[
          { label: "Slow Down", value: "slowDown" },
          { label: "Speed Up", value: "speedUp" },
          { label: "Pause", value: "pause" },
          { label: "Go Bonkers", value: "goBonkers" },
        ]}
        value={onHover}
        onChange={(v) =>
          (onHover = v as "slowDown" | "speedUp" | "pause" | "goBonkers")}
      />
      <PreviewSlider
        title="Spin Duration"
        value={spinDuration}
        min={1}
        max={60}
        step={1}
        valueUnit="s"
        onChange={(v) => (spinDuration = v)}
      />
    </Customize>
  {/snippet}
  {#snippet propTable()}
    <PropTable rows={props} />
  {/snippet}
</TabsLayout>
