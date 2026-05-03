<script lang="ts">
	export type PropRow = {
		name: string;
		type: string;
		default: string;
		description: string;
	};

	type Props = { rows: PropRow[] };
	let { rows }: Props = $props();
</script>

<section class="prop-table-section">
	<h2 class="demo-title-extra">Props</h2>

	<div class="prop-table-wrap">
		<table class="prop-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.name)}
					<tr>
						<td><code class="prop-code">{row.name}</code></td>
						<td><span class="prop-type">{row.type}</span></td>
						<td><code class="prop-code">{row.default}</code></td>
						<td>{row.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="prop-cards">
		{#each rows as row (row.name)}
			<div class="prop-card">
				<div class="prop-card-header">
					<code class="prop-code">{row.name}</code>
					<span class="prop-card-type">{row.type}</span>
				</div>
				<p class="prop-card-desc">{row.description}</p>
				<div class="prop-card-default">
					<span class="prop-card-label">Default:</span>
					<code class="prop-code">{row.default}</code>
				</div>
			</div>
		{/each}
	</div>
</section>
