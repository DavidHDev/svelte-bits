<script module lang="ts">
	export type PropRow = { name: string; type: string; default?: string; description: string };
</script>

<script lang="ts">
	import { useProSlot } from './lib/proSlot.svelte';
	import CategoryProFooter from '$lib/components/common/Pro/CategoryProFooter.svelte';

	type Props = { data?: PropRow[]; rows?: PropRow[] };

	let { data, rows }: Props = $props();

	const list = $derived(data ?? rows ?? []);
	const proSlot = useProSlot('props');
</script>

<div class="prop-table-section">
	<div class="prop-table-frame">
		<div class="prop-table-heading">
			<h2>Props</h2>
			<span>{list.length} {list.length === 1 ? 'property' : 'properties'}</span>
		</div>

		<div class="prop-table-wrap">
			<div class="prop-table-surface">
				<table class="prop-table">
					<caption>Component properties</caption>
					<colgroup>
						<col class="prop-column-name" />
						<col class="prop-column-type" />
						<col class="prop-column-default" />
						<col class="prop-column-description" />
					</colgroup>
					<thead>
						<tr>
							<th scope="col">Property</th>
							<th scope="col">Type</th>
							<th scope="col">Default</th>
							<th scope="col">Description</th>
						</tr>
					</thead>
					<tbody>
						{#each list as prop, index (index)}
							<tr>
								<td><code class="prop-name">{prop.name}</code></td>
								<td class="prop-type">{prop.type}</td>
								<td><code class="prop-default">{prop.default?.length ? prop.default : '—'}</code></td>
								<td class="prop-desc">{prop.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="prop-cards">
			<div class="prop-cards-surface">
				{#each list as prop, index (index)}
					<div class="prop-card">
						<div class="prop-card-header">
							<code class="prop-name">{prop.name}</code>
							<span class="prop-card-type">{prop.type}</span>
						</div>
						<p class="prop-card-desc">{prop.description}</p>
						<div class="prop-card-default">
							<span class="prop-card-label">Default</span>
							<code class="prop-default">{prop.default?.length ? prop.default : '—'}</code>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

{#if proSlot?.owns}
	<CategoryProFooter category={proSlot.category} />
{/if}
