<script lang="ts">
  import CliInstall from "$lib/components/docs/preview/CliInstall.svelte";
  import CodeBlock from "$lib/components/docs/preview/CodeBlock.svelte";
  import Customize from "$lib/components/docs/preview/Customize.svelte";
  import PreviewColorPicker from "$lib/components/docs/preview/PreviewColorPicker.svelte";
  import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
  import PreviewSwitch from "$lib/components/docs/preview/PreviewSwitch.svelte";
  import PropTable, {
    type PropRow,
  } from "$lib/components/docs/preview/PropTable.svelte";
  import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
  import TrueFocus from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte";
  import trueFocusSource from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte?raw";

  const DEFAULTS = {
    manualMode: false,
    blurAmount: 5,
    animationDuration: 0.5,
    pauseBetweenAnimations: 1,
    borderColor: "#ff8a4c",
  };

  const text = "True Focus";
  let manualMode = $state(DEFAULTS.manualMode);
  let blurAmount = $state(DEFAULTS.blurAmount);
  let animationDuration = $state(DEFAULTS.animationDuration);
  let pauseBetweenAnimations = $state(DEFAULTS.pauseBetweenAnimations);
  let borderColor = $state(DEFAULTS.borderColor);

  let replay = $state(0);

  const hasChanges = $derived(
    manualMode !== DEFAULTS.manualMode ||
      blurAmount !== DEFAULTS.blurAmount ||
      animationDuration !== DEFAULTS.animationDuration ||
      pauseBetweenAnimations !== DEFAULTS.pauseBetweenAnimations ||
      borderColor !== DEFAULTS.borderColor,
  );

  function reset() {
    manualMode = DEFAULTS.manualMode;
    blurAmount = DEFAULTS.blurAmount;
    animationDuration = DEFAULTS.animationDuration;
    pauseBetweenAnimations = DEFAULTS.pauseBetweenAnimations;
    borderColor = DEFAULTS.borderColor;
    replay++;
  }

  const usage = $derived(`${"<" + 'script lang="ts">'}
  import TrueFocus from '$lib/components/TrueFocus.svelte';
${"</" + "script>"}

<TrueFocus
  sentence="${text}"
  manualMode={${manualMode}}
  blurAmount={${blurAmount}}
  borderColor="${borderColor}"
  animationDuration={${animationDuration}}
  pauseBetweenAnimations={${pauseBetweenAnimations}}
/>`);

  const props: PropRow[] = [
    {
      name: "sentence",
      type: "string",
      default: "'True Focus'",
      description: "The text to display with the focus animation.",
    },
    {
      name: "separator",
      type: "string",
      default: "' '",
      description: "Optional string used to separate words in the sentence.",
    },
    {
      name: "manualMode",
      type: "boolean",
      default: "false",
      description: "Disables automatic animation when set to true.",
    },
    {
      name: "blurAmount",
      type: "number",
      default: "5",
      description: "The amount of blur applied to non-active words.",
    },
    {
      name: "borderColor",
      type: "string",
      default: "'#ff8a4c'",
      description: "The color of the focus borders.",
    },
    {
      name: "glowColor",
      type: "string",
      default: "'rgba(0, 255, 0, 0.6)'",
      description: "The color of the glowing effect on the borders.",
    },
    {
      name: "animationDuration",
      type: "number",
      default: "0.5",
      description: "The duration of the animation for each word.",
    },
    {
      name: "pauseBetweenAnimations",
      type: "number",
      default: "1",
      description:
        "Time to pause between focusing on each word (in auto mode).",
    },
  ];
</script>

<svelte:head>
  <title>True Focus - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">True Focus</h1>

<TabsLayout
  onreset={reset}
  {hasChanges}
  componentName="TrueFocus"
  {usage}
  source={trueFocusSource}
  {props}
>
  {#snippet preview()}
    <div
      style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;"
    >
      {#key replay}
        <TrueFocus
          sentence={text}
          {manualMode}
          {blurAmount}
          {borderColor}
          {animationDuration}
          {pauseBetweenAnimations}
        />
      {/key}
    </div>
  {/snippet}
  {#snippet code()}
    <CliInstall slug="true-focus" />
    <h3 class="demo-title-extra">Usage</h3>
    <CodeBlock code={usage} language="svelte" />
    <h3 class="demo-title-extra">Component source</h3>
    <CodeBlock code={trueFocusSource} language="svelte" />
  {/snippet}
  {#snippet customize()}
    <Customize>
      <PreviewColorPicker
        title="Border Color"
        value={borderColor}
        onChange={(v) => (borderColor = v)}
      />
      <PreviewSwitch
        title="Hover Mode"
        checked={manualMode}
        onChange={(v) => {
          manualMode = v;
        }}
      />
      <PreviewSlider
        title="Blur Amount"
        min={0}
        max={15}
        step={0.05}
        valueUnit="px"
        value={blurAmount}
        onChange={(v) => (blurAmount = v)}
      />
      <PreviewSlider
        title="Animation Duration"
        min={0.1}
        max={3}
        step={0.1}
        valueUnit="s"
        value={animationDuration}
        onChange={(v) => (animationDuration = v)}
        isDisabled={!manualMode}
      />
      <PreviewSlider
        title="Pause Between Animations"
        min={0}
        max={5}
        step={0.5}
        valueUnit="s"
        value={pauseBetweenAnimations}
        onChange={(v) => (pauseBetweenAnimations = v)}
      />
    </Customize>
  {/snippet}
  {#snippet propTable()}
    <PropTable rows={props} />
  {/snippet}
</TabsLayout>
