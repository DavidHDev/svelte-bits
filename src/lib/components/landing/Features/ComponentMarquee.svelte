<script lang="ts">
	const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

	const ROW_A = [
		{ name: 'Dot Field', cat: 'backgrounds' },
		{ name: 'Line Waves', cat: 'backgrounds' },
		{ name: 'Blob Cursor', cat: 'animations' },
		{ name: 'Soft Aurora', cat: 'backgrounds' },
		{ name: 'Magnet Lines', cat: 'backgrounds' },
		{ name: 'Antigravity', cat: 'animations' },
		{ name: 'Ballpit', cat: 'backgrounds' },
		{ name: 'Pixel Trail', cat: 'animations' },
		{ name: 'Magic Rings', cat: 'backgrounds' }
	];

	const ROW_B = [
		{ name: 'Radar', cat: 'backgrounds' },
		{ name: 'Shape Grid', cat: 'backgrounds' },
		{ name: 'Ribbons', cat: 'animations' },
		{ name: 'Grainient', cat: 'backgrounds' },
		{ name: 'Orbit Images', cat: 'animations' },
		{ name: 'Metallic Paint', cat: 'animations' },
		{ name: 'Balatro', cat: 'backgrounds' },
		{ name: 'Aurora', cat: 'backgrounds' },
		{ name: 'Splash Cursor', cat: 'animations' },
		{ name: 'Beams', cat: 'backgrounds' }
	];
</script>

<div class="ln-feat-marquee">
	<div class="ln-feat-marquee-track">
		<div class="ln-feat-marquee-scroll">
			{#each [...ROW_A, ...ROW_A] as c, i (i)}
				<a href="/{c.cat}/{toSlug(c.name)}" class="ln-feat-pill">{c.name}</a>
			{/each}
		</div>
	</div>
	<div class="ln-feat-marquee-track">
		<div class="ln-feat-marquee-scroll ln-feat-marquee-scroll--rev">
			{#each [...ROW_B, ...ROW_B] as c, i (i)}
				<a href="/{c.cat}/{toSlug(c.name)}" class="ln-feat-pill">{c.name}</a>
			{/each}
		</div>
	</div>
</div>
