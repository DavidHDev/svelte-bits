<script lang="ts">
	type Props = {
		title?: string;
		value?: string;
		placeholder?: string;
		maxlength?: number;
		isDisabled?: boolean;
		onChange?: (v: string) => void;
	};

	let {
		title = '',
		value = '',
		placeholder = '',
		maxlength,
		isDisabled = false,
		onChange
	}: Props = $props();
</script>

<div class="scrubber">
	<div class="scrubber-track scrubber-track--input" data-disabled={isDisabled}>
		<span class="scrubber-label">{title}</span>
		<input
			class="scrubber-input"
			type="text"
			{value}
			{placeholder}
			{maxlength}
			disabled={isDisabled}
			aria-label={title}
			oninput={(e) => onChange?.((e.target as HTMLInputElement).value)}
		/>
	</div>
</div>
