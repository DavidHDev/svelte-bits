<script lang="ts">
	type Props = { name: string };
	let { name }: Props = $props();
</script>

<div class="coming-soon-card">
	<span class="coming-soon-tag">Coming soon</span>
	<h3 style="margin:0;font-size:1.4rem;color:var(--text-primary);font-weight:700;">
		{name}
	</h3>
	<p style="margin:0;max-width:42ch;line-height:1.55;">
		This component hasn't been ported to Svelte yet. svelte-bits is being built incrementally —
		check back soon, or
		<a
			href="https://github.com/DavidHDev/svelte-bits"
			target="_blank"
			rel="noreferrer"
			style="color:var(--color-accent);text-decoration:underline;"
		>
			contribute on GitHub
		</a>.
	</p>
</div>
