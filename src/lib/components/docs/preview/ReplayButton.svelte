<script lang="ts">
	type Props = {
		onClick: () => void;
		label?: string;
	};

	let { onClick, label = 'Replay animation' }: Props = $props();
</script>

<button type="button" class="replay-button" aria-label={label} title={label} onclick={onClick}>
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
		<path d="M3 3v5h5" />
	</svg>
</button>

<style>
	.replay-button {
		position: absolute;
		top: 14px;
		right: 14px;
		z-index: 10;
		display: inline-flex;
		width: 34px;
		height: 34px;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		border: 1px solid var(--border-primary);
		background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
		color: var(--text-primary);
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.replay-button:hover {
		border-color: rgba(255, 138, 76, 0.45);
		background: rgba(255, 138, 76, 0.12);
		color: #ff8a4c;
	}
</style>
