<script lang="ts">
	type Props = {
		title?: string;
		value?: string;
		placeholder?: string;
		maxLength?: number;
		maxlength?: number;
		isDisabled?: boolean;
		onChange?: (v: string) => void;
	};

	let { title = '', value = '', placeholder = '', maxLength, maxlength, isDisabled = false, onChange }: Props = $props();
</script>

<div class="scrubber">
	<div class="scrubber-track scrubber-track--input" data-disabled={isDisabled}>
		<span class="scrubber-label">{title}</span>
		<input
			class="scrubber-input"
			type="text"
			{value}
			{placeholder}
			maxlength={maxLength ?? maxlength}
			disabled={isDisabled}
			aria-label={title}
			oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
		/>
	</div>
</div>
