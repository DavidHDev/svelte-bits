<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ArrowRight02Icon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { jsrepoAddSnippet } from '$lib/constants/cli';
	import { reveal } from '../shared/motion';
	import './HowItWorks.css';

	const COMMAND = jsrepoAddSnippet('aurora', 'npm');

	const OUTPUT = ['✔ Checking registry.', '✔ Created 1 file:', '  - src/lib/components/Aurora.svelte'];

	const CODE: [string, string][][] = [
		[
			['<', 'punc'],
			['script', 'kw'],
			[' lang', 'attr'],
			['=', 'punc'],
			['"ts"', 'str'],
			['>', 'punc']
		],
		[
			['  import', 'kw'],
			[' { onMount } ', 'ink'],
			['from', 'kw'],
			[" 'svelte'", 'str'],
			[';', 'punc']
		],
		[],
		[
			['  let', 'kw'],
			[' {', 'punc']
		],
		[
			['    colorStops', 'attr'],
			[' = [', 'punc'],
			["'#ff3e00'", 'str'],
			[', ', 'punc'],
			["'#7cff67'", 'str'],
			[', ', 'punc'],
			["'#ff3e00'", 'str'],
			['],', 'punc']
		],
		[
			['    amplitude', 'attr'],
			[' = ', 'punc'],
			['1', 'ink'],
			[',', 'punc']
		],
		[
			['    blend', 'attr'],
			[' = ', 'punc'],
			['0.5', 'ink'],
			[',', 'punc']
		],
		[
			['    speed', 'attr'],
			[' = ', 'punc'],
			['0.6', 'ink'],
			[',', 'punc']
		],
		[
			['  }: ', 'punc'],
			['AuroraProps', 'ink'],
			[' = ', 'punc'],
			['$props', 'ink'],
			['();', 'punc']
		],
		[],
		[
			['  let', 'kw'],
			[' container', 'ink'],
			[': ', 'punc'],
			['HTMLDivElement', 'ink'],
			[';', 'punc']
		]
	];

	const EDITED_LINE = 7;

	let copied = $state(false);
	let timer = 0;

	onDestroy(() => {
		if (typeof window !== 'undefined') window.clearTimeout(timer);
	});

	const copy = () => {
		navigator.clipboard?.writeText(COMMAND);
		copied = true;
		window.clearTimeout(timer);
		timer = window.setTimeout(() => (copied = false), 1400);
	};
</script>

<section class="ln-how-section">
	<div class="ln-how-inner">
		<div class="ln-how-copy-block" use:reveal>
			<h2 class="ln-how-title">One command, and the code is yours.</h2>
			<p class="ln-how-sub">
				The CLI copies the component's source into your SvelteKit, Vite or Astro project. No wrapper library, no
				runtime dependency, nothing to lock you in.
			</p>
			<a href="/get-started/installation" class="ln-how-btn">
				Installation guide
				<HugeIcon icon={ArrowRight02Icon} size={17} strokeWidth={1.8} />
			</a>
		</div>

		<div class="ln-how-visual" use:reveal={{ delay: 0.07 }}>
			<div class="ln-how-window ln-how-terminal">
				<div class="ln-how-bar">
					Terminal
					<button type="button" class="ln-how-copy" onclick={copy} aria-label="Copy install command">
						<HugeIcon icon={copied ? Tick02Icon : Copy01Icon} size={13} strokeWidth={1.8} />
					</button>
				</div>
				<div class="ln-how-well ln-how-term">
					<div class="ln-how-term-line"><span class="ln-how-t-punc">$</span> {COMMAND}</div>
					{#each OUTPUT as line (line)}
						<div class="ln-how-term-line ln-how-t-muted">{line}</div>
					{/each}
				</div>
			</div>

			<div class="ln-how-window ln-how-editor" role="img" aria-label="Aurora.svelte open in your editor as plain source">
				<div class="ln-how-bar">Aurora.svelte</div>
				<pre class="ln-how-well ln-how-code"><code>{#each CODE as line, index (index)}<span class="ln-how-line{index === EDITED_LINE ? ' is-edited' : ''}">{#if line.length}{#each line as [text, kind], part (part)}<span class="ln-how-t-{kind}">{text}</span>{/each}{:else}{' '}{/if}</span>{/each}</code></pre>
			</div>
		</div>
	</div>
</section>
