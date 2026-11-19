<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		command: string;
	};

	let { command }: Props = $props();

	const OUTPUT = ['✔ Checking registry.', '✔ Created 1 file.'];

	let typed = $state(0);
	let shown = $state(0);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			typed = command.length;
			shown = OUTPUT.length;
			return;
		}
		let timer = 0;
		const later = (fn: () => void, ms: number) => {
			timer = window.setTimeout(fn, ms);
		};
		const reveal = (count: number) => {
			shown = count;
			if (count < OUTPUT.length) later(() => reveal(count + 1), 560);
		};
		const type = (count: number) => {
			typed = count;
			if (count < command.length) later(() => type(count + 1), 18 + ((count * 37) % 29));
			else later(() => reveal(1), 480);
		};
		const begin = () => {
			if (document.querySelector('.landing-wrapper.ln-loading')) later(begin, 200);
			else later(() => type(1), 1500);
		};
		begin();
		return () => window.clearTimeout(timer);
	});

	const typing = $derived(typed < command.length);
	const done = $derived(shown >= OUTPUT.length);
</script>

<div class="lh-term">
	<div class="lh-term-line"><span class="lh-term-prompt">$</span> {command.slice(0, typed)}{#if typing && typed > 0}<span class="lh-caret"></span>{/if}<span class="lh-term-rest">{command.slice(typed)}</span></div>
	{#each OUTPUT as line, index (line)}
		<div class="lh-term-line lh-term-out" data-shown={index < shown ? '' : undefined}><span class="lh-term-ok">{line.slice(0, 1)}</span>{line.slice(1)}{#if done && index === OUTPUT.length - 1}<span class="lh-caret lh-caret--idle"></span>{/if}</div>
	{/each}
</div>
