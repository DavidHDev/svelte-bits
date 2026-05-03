<script lang="ts">
	type Props = {
		title?: string;
		value?: string;
		onChange?: (v: string) => void;
	};
	let { title = '', value = '#ffffff', onChange }: Props = $props();

	let hex = $derived(value);

	function commitHex(v: string) {
		const trimmed = v.trim();
		if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
			const next = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
			onChange?.(next.toLowerCase());
		}
	}
</script>

<div class="scrubber">
	<div
		class="scrubber-track scrubber-track--color"
		role="group"
		aria-label={title}
	>
		<div class="scrubber-label">{title}</div>
		<div class="scrubber-color-controls">
			<input
				class="scrubber-color-text"
				type="text"
				value={hex}
				oninput={(e) => (hex = (e.currentTarget as HTMLInputElement).value)}
				onblur={(e) => commitHex((e.currentTarget as HTMLInputElement).value)}
				onkeydown={(e) => {
					if (e.key === 'Enter') commitHex((e.currentTarget as HTMLInputElement).value);
				}}
			/>
			<label class="scrubber-color-swatch-preview" style:background={value}>
				<input
					type="color"
					value={value}
					oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
					style="opacity:0;width:100%;height:100%;cursor:pointer;"
				/>
			</label>
		</div>
	</div>
</div>
