<script lang="ts">
	import { untrack } from 'svelte';
	import { animate } from 'motion';
	import { fadeSlideIn, observeVisible } from '../shared/motion';

	type Token = { cls: string; text: string };

	const AI_CONVOS: { q: string; lines: Token[]; jsx: Token[] }[] = [
		{
			q: 'add a glowing card',
			lines: [
				{ cls: 'kw', text: 'import ' },
				{ cls: 'comp', text: 'BorderGlow' },
				{ cls: 'kw', text: ' from ' },
				{ cls: 'str', text: '"./BorderGlow.svelte"' }
			],
			jsx: [
				{ cls: 'tag', text: '<' },
				{ cls: 'comp', text: 'BorderGlow' },
				{ cls: 'attr', text: ' glowIntensity' },
				{ cls: 'punc', text: '=' },
				{ cls: 'num', text: '{0.8}' },
				{ cls: 'tag', text: ' />' }
			]
		},
		{
			q: 'animate hero text',
			lines: [
				{ cls: 'kw', text: 'import ' },
				{ cls: 'comp', text: 'SplitText' },
				{ cls: 'kw', text: ' from ' },
				{ cls: 'str', text: '"./SplitText.svelte"' }
			],
			jsx: [
				{ cls: 'tag', text: '<' },
				{ cls: 'comp', text: 'SplitText' },
				{ cls: 'attr', text: ' animation' },
				{ cls: 'punc', text: '=' },
				{ cls: 'str', text: '"fadeUp"' },
				{ cls: 'tag', text: ' />' }
			]
		},
		{
			q: 'particle background',
			lines: [
				{ cls: 'kw', text: 'import ' },
				{ cls: 'comp', text: 'Ballpit' },
				{ cls: 'kw', text: ' from ' },
				{ cls: 'str', text: '"./Ballpit.svelte"' }
			],
			jsx: [
				{ cls: 'tag', text: '<' },
				{ cls: 'comp', text: 'Ballpit' },
				{ cls: 'attr', text: ' count' },
				{ cls: 'punc', text: '=' },
				{ cls: 'num', text: '{200}' },
				{ cls: 'tag', text: ' />' }
			]
		}
	];

	let idx = $state(0);
	let shownIdx = $state(0);
	let typed = $state('');
	let phase = $state<'prompt' | 'thinking' | 'code'>('prompt');
	let codeLines = $state(0);
	let visible = $state(false);
	let root = $state<HTMLDivElement | null>(null);
	let inner = $state<HTMLDivElement | null>(null);
	let started = false;

	$effect(() => {
		if (!root) return;
		return observeVisible(root, (next) => (visible = next));
	});

	$effect(() => {
		const current = idx;
		if (!visible || !inner) return;
		const el = inner;
		const timers: ReturnType<typeof setTimeout>[] = [];
		const schedule = (fn: () => void, ms: number) => {
			timers.push(setTimeout(fn, ms));
		};
		const conv = AI_CONVOS[current];
		const enter = () => {
			shownIdx = current;
			typed = '';
			phase = 'prompt';
			codeLines = 0;
			animate(el, { opacity: [0, 1] }, { duration: 0.3 });
		};
		if (!started) {
			started = true;
			enter();
		} else if (current !== untrack(() => shownIdx)) {
			animate(el, { opacity: 0 }, { duration: 0.3 });
			schedule(enter, 300);
		} else {
			enter();
		}

		let delay = 300;
		for (let c = 0; c <= conv.q.length; c++) {
			const slice = conv.q.slice(0, c);
			schedule(() => (typed = slice), delay);
			delay += 50;
		}

		schedule(() => (phase = 'thinking'), delay);
		delay += 900;

		schedule(() => {
			phase = 'code';
			codeLines = 1;
		}, delay);
		delay += 280;
		schedule(() => (codeLines = 2), delay);
		delay += 280;
		schedule(() => (codeLines = 3), delay);
		delay += 2400;

		schedule(() => (idx = (current + 1) % AI_CONVOS.length), delay);

		return () => timers.forEach(clearTimeout);
	});

	const conv = $derived(AI_CONVOS[shownIdx]);
</script>

<div class="ln-feat-aichat" bind:this={root}>
	<div class="ln-feat-aichat-inner" bind:this={inner} style:opacity="0">
		<div class="ln-feat-aichat-head">
			<div class="ln-feat-aichat-dots">
				<span></span>
				<span></span>
				<span></span>
			</div>
			<span class="ln-feat-aichat-title">Editor</span>
		</div>

		<div class="ln-feat-aichat-prompt-row">
			<span class="ln-feat-aichat-chevron">$</span>
			<span class="ln-feat-aichat-prompt">{typed}</span>
			{#if phase === 'prompt'}
				<span class="ln-feat-aichat-cursor"></span>
			{/if}
		</div>

		{#if phase === 'thinking'}
			<div class="ln-feat-aichat-thinking">
				<span></span>
				<span></span>
				<span></span>
			</div>
		{/if}

		{#if phase === 'code'}
			<div class="ln-feat-aichat-code-block">
				{#if codeLines >= 1}
					<div class="ln-feat-aichat-code-line" use:fadeSlideIn>
						<span class="ln-feat-aichat-ln">1</span>
						{#each conv.lines as t, j (j)}<span class="ac-{t.cls}">{t.text}</span>{/each}
					</div>
				{/if}
				{#if codeLines >= 2}
					<div class="ln-feat-aichat-code-line" use:fadeSlideIn>
						<span class="ln-feat-aichat-ln">2</span>
					</div>
				{/if}
				{#if codeLines >= 3}
					<div class="ln-feat-aichat-code-line" use:fadeSlideIn>
						<span class="ln-feat-aichat-ln">3</span>
						{#each conv.jsx as t, j (j)}<span class="ac-{t.cls}">{t.text}</span>{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
