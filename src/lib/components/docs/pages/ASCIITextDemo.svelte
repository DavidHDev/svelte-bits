<script lang="ts">
  import Customize from "$lib/components/docs/preview/Customize.svelte";
  import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
  import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
  import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
  import PreviewSwitch from "$lib/components/docs/preview/PreviewSwitch.svelte";
  import PropTable, {
    type PropRow,
  } from "$lib/components/docs/preview/PropTable.svelte";
  import ReplayButton from "$lib/components/docs/preview/ReplayButton.svelte";
  import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
  import ASCIIText from "$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte";
  import source from "$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte?raw";

  const DEFAULTS = {
    text: "Hey!",
    enableWaves: true,
    asciiFontSize: 8,
  };

  let text = $state(DEFAULTS.text);
  let enableWaves = $state(DEFAULTS.enableWaves);
  let asciiFontSize = $state(DEFAULTS.asciiFontSize);

  let replay = $state(0);

  const hasChanges = $derived(
    text !== DEFAULTS.text ||
      enableWaves !== DEFAULTS.enableWaves ||
      asciiFontSize !== DEFAULTS.asciiFontSize,
  );

  function reset() {
    text = DEFAULTS.text;
    enableWaves = DEFAULTS.enableWaves;
    asciiFontSize = DEFAULTS.asciiFontSize;
    replay++;
  }

  const scriptOpen = "<" + 'script lang="ts">';
  const scriptClose = "</" + "script>";

  const usage = $derived(`${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<ASCIIText
  text="${text}"
  enableWaves={${enableWaves}}
  asciiFontSize={${asciiFontSize}}
/>`);

  const props: PropRow[] = [
    {
      name: "text",
      type: "string",
      default: '"Hello World!"',
      description: "The text displayed on the plane in the ASCII scene.",
    },
    {
      name: "enableWaves",
      type: "boolean",
      default: "true",
      description: "If false, disables the wavy text animation.",
    },
    {
      name: "asciiFontSize",
      type: "number",
      default: "12",
      description: "Size of the ASCII glyphs in the overlay.",
    },
    {
      name: "textFontSize",
      type: "number",
      default: "200",
      description:
        "Pixel size for the text that's drawn onto the plane texture.",
    },
    {
      name: "planeBaseHeight",
      type: "number",
      default: "8",
      description:
        "How tall the plane is in 3D. The plane width is auto-based on text aspect.",
    },
    {
      name: "textColor",
      type: "string",
      default: "#FF8A4C",
      description: "The color of the text drawn onto the plane texture.",
    },
    {
      name: "strokeColor",
      type: "string",
      default: "N/A",
      description:
        "Not used here, but you could add it if you want an outline effect.",
    },
  ];
</script>

<svelte:head><title>ASCII Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">ASCII Text</h1>

<TabsLayout
  onreset={reset}
  {hasChanges}
  componentName="ASCIIText"
  {usage}
  {source}
  {props}
>
  {#snippet preview()}
    <div
      class="relative flex justify-center items-center w-full min-h-100 overflow-hidden demo-container"
    >
      <ReplayButton onClick={() => replay++} />
      {#key replay}
        <ASCIIText {text} {enableWaves} {asciiFontSize} />
      {/key}
    </div>
  {/snippet}
  {#snippet code()}
    <DemoCodeTab slug="ascii-text" {usage} {source} />
  {/snippet}
  {#snippet customize()}
    <Customize>
      <PreviewInput
        title="Text"
        value={text}
        placeholder="Enter text..."
        onChange={(val) => (text = val)}
      />
      <PreviewSlider
        title="Size"
        min={1}
        max={64}
        step={1}
        value={asciiFontSize}
        onChange={(val) => (asciiFontSize = val)}
      />
      <PreviewSwitch
        title="Waves"
        checked={enableWaves}
        onChange={(checked) => (enableWaves = checked)}
      />
    </Customize>
  {/snippet}
  {#snippet propTable()}
    <PropTable rows={props} />
  {/snippet}
</TabsLayout>
