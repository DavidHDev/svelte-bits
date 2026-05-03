<script lang="ts">
	type Props = {
		dependencyList?: string[];
	};

	let { dependencyList = [] }: Props = $props();
</script>

{#if dependencyList.length > 0}
	<div class="dependencies-section">
		<h2 class="demo-title-extra">Dependencies</h2>
		<div class="demo-details">
			{#each dependencyList as dependency (dependency)}
				<span>{dependency}</span>
			{/each}
		</div>
	</div>
{/if}

<style>
	.dependencies-section {
		margin-top: 3rem;
	}

	.demo-details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.demo-details span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 25px;
		padding: .4rem .8rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 138, 76, 0.16);
		background: rgba(255, 138, 76, 0.06);
		color: var(--color-accent-muted);
		font-size: 14px;
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-weight: 500;
	}
</style>
