<script lang="ts">
	import { onMount } from 'svelte';
	import CopyPageButton from '$lib/components/docs/getstarted/CopyPageButton.svelte';
	import CommandList from '$lib/components/docs/getstarted/CommandList.svelte';
	import DocsStep from '$lib/components/docs/getstarted/DocsStep.svelte';
	import DocsCodeBlock from '$lib/components/docs/getstarted/DocsCodeBlock.svelte';
	import DocsButtonBar from '$lib/components/docs/getstarted/DocsButtonBar.svelte';
	import { jsrepoAddSnippet, shadcnAddSnippet } from '$lib/constants/cli';

	const SCRIPT_OPEN = '<' + 'script lang="ts">';
	const SCRIPT_CLOSE = '</' + 'script>';

	const USAGE = `${SCRIPT_OPEN}
  import SplitText from '$lib/components/SplitText.svelte';
${SCRIPT_CLOSE}

<SplitText
  text="Hello, you!"
  delay={100}
  duration={0.6}
/>`;

	const commands = [
		{ key: 'shadcn', label: 'shadcn', command: shadcnAddSnippet('split-text', 'npm') },
		{ key: 'jsrepo', label: 'jsrepo', command: jsrepoAddSnippet('split-text', 'npm') }
	];

	onMount(() => window.scrollTo(0, 0));
</script>

<section class="docs-section">
	<div class="docs-page-header">
		<h1 class="docs-title">Installation</h1>
		<CopyPageButton />
	</div>

	<p class="docs-lead">
		Every component installs as source code you own. Pull it in with one CLI command, or copy the file by hand.
	</p>

	<h2 class="docs-section-title">With the CLI</h2>

	<ol class="docs-steps">
		<DocsStep index={1} title="Run the add command">
			<p class="docs-step-text">Use whichever CLI you already have. Both install the same source.</p>
			<CommandList items={commands} />
			<p class="docs-step-note">
				Swap <code>split-text</code> for any component's name in kebab case. On pnpm, yarn or bun, replace
				<code>npx</code> with <code>pnpm dlx</code>, <code>yarn dlx</code> or <code>bunx --bun</code>.
			</p>
		</DocsStep>

		<DocsStep index={2} title="Import and use it">
			<p class="docs-step-text">Render it like any other component:</p>
			<DocsCodeBlock code={USAGE} language="svelte" showLineNumbers />
		</DocsStep>
	</ol>

	<h2 class="docs-section-title">By hand</h2>

	<ol class="docs-steps">
		<DocsStep index={1} title="Open a component's Code tab">
			<p class="docs-step-text">
				It shows the full source. Every component is a single TypeScript and Tailwind file, so there is only one thing
				to copy.
			</p>
		</DocsStep>

		<DocsStep index={2} title="Copy the file into your project">
			<p class="docs-step-text">
				Paste the component into a new file, for example <code>src/lib/components/SplitText.svelte</code>.
			</p>
		</DocsStep>

		<DocsStep index={3} title="Install its dependencies">
			<p class="docs-step-text">The Code tab lists what each component needs. Split Text uses GSAP:</p>
			<DocsCodeBlock code="npm install gsap" language="bash" />
		</DocsStep>

		<DocsStep index={4} title="Import and use it">
			<p class="docs-step-text">Import and render it the same way as the CLI example above.</p>
		</DocsStep>
	</ol>

	<h2 class="docs-section-title">That&apos;s all</h2>

	<p class="docs-paragraph">The code is yours now, so change the styles, props or behavior however you like.</p>

	<DocsButtonBar
		next={{ label: 'MCP Server', route: '/get-started/mcp' }}
		previous={{ label: 'Introduction', route: '/get-started/introduction' }}
	/>
</section>
