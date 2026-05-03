<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Token = { cls: 'kw' | 'comp' | 'tag' | 'attr' | 'punc' | 'num' | 'str'; text: string };

	type Convo = { q: string; lines: Token[]; jsx: Token[] };

	const AI_CONVOS: Convo[] = [
		{
			q: 'add a glowing card',
			lines: [
				{ cls: 'kw', text: 'import ' },
				{ cls: 'comp', text: 'BorderGlow' },
				{ cls: 'kw', text: ' from ' },
				{ cls: 'str', text: '"./BorderGlow"' }
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
				{ cls: 'str', text: '"./SplitText"' }
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
				{ cls: 'str', text: '"./Ballpit"' }
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
	let typed = $state('');
	let phase = $state<'prompt' | 'thinking' | 'code'>('prompt');
	let codeLines = $state(0);

	let timers: ReturnType<typeof setTimeout>[] = [];

	const conv = $derived(AI_CONVOS[idx]);

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	function schedule(fn: () => void, ms: number) {
		const id = setTimeout(fn, ms);
		timers.push(id);
	}

	function runConvo(i: number) {
		const c = AI_CONVOS[i];
		typed = '';
		phase = 'prompt';
		codeLines = 0;

		let delay = 300;
		for (let k = 0; k <= c.q.length; k++) {
			const slice = c.q.slice(0, k);
			schedule(() => {
				typed = slice;
			}, delay);
			delay += 50;
		}

		schedule(() => {
			phase = 'thinking';
		}, delay);
		delay += 900;

		schedule(() => {
			phase = 'code';
			codeLines = 1;
		}, delay);
		delay += 280;
		schedule(() => {
			codeLines = 2;
		}, delay);
		delay += 280;
		schedule(() => {
			codeLines = 3;
		}, delay);
		delay += 2400;

		schedule(() => {
			idx = (idx + 1) % AI_CONVOS.length;
		}, delay);
	}

	onMount(() => {
		runConvo(0);
	});

	onDestroy(clearTimers);

	$effect(() => {
		// Re-run sequence when idx changes (after initial mount).
		const i = idx;
		if (i === 0) return; // initial run handled by onMount
		clearTimers();
		runConvo(i);
	});
</script>

<div class="ln-feat-aichat">
	{#key idx}
		<div class="ln-feat-aichat-inner">
			<div class="ln-feat-aichat-head">
				<div class="ln-feat-aichat-dots">
					<span></span><span></span><span></span>
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
					<span></span><span></span><span></span>
				</div>
			{/if}

			{#if phase === 'code'}
				<div class="ln-feat-aichat-code-block">
					{#if codeLines >= 1}
						<div class="ln-feat-aichat-code-line">
							<span class="ln-feat-aichat-ln">1</span>
							{#each conv.lines as t, j (j)}
								<span class="ac-{t.cls}">{t.text}</span>
							{/each}
						</div>
					{/if}
					{#if codeLines >= 2}
						<div class="ln-feat-aichat-code-line">
							<span class="ln-feat-aichat-ln">2</span>
						</div>
					{/if}
					{#if codeLines >= 3}
						<div class="ln-feat-aichat-code-line">
							<span class="ln-feat-aichat-ln">3</span>
							{#each conv.jsx as t, j (j)}
								<span class="ac-{t.cls}">{t.text}</span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/key}
</div>
