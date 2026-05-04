<!-- @svelte-bits
{
  "title": "Stepper",
  "description": "Animated multi-step form with sliding step content and round step indicators.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	type Props = {
		steps: Snippet[];
		initialStep?: number;
		onStepChange?: (step: number) => void;
		onFinalStepCompleted?: () => void;
		stepCircleContainerClass?: string;
		stepContainerClass?: string;
		contentClass?: string;
		footerClass?: string;
		backButtonText?: string;
		nextButtonText?: string;
		disableStepIndicators?: boolean;
		accentColor?: string;
	};

	let {
		steps,
		initialStep = 1,
		onStepChange,
		onFinalStepCompleted,
		stepCircleContainerClass = '',
		stepContainerClass = '',
		contentClass = '',
		footerClass = '',
		backButtonText = 'Back',
		nextButtonText = 'Continue',
		disableStepIndicators = false,
		accentColor = '#FF8A4C'
	}: Props = $props();

	let currentStep = $state(initialStep);
	let direction = $state(0);
	let parentHeight = $state(0);
	let measureRef: HTMLDivElement | null = $state(null);

	const totalSteps = $derived(steps.length);
	const isCompleted = $derived(currentStep > totalSteps);
	const isLastStep = $derived(currentStep === totalSteps);

	function updateStep(n: number) {
		currentStep = n;
		if (n > totalSteps) onFinalStepCompleted?.();
		else onStepChange?.(n);
	}
	function back() {
		if (currentStep > 1) { direction = -1; updateStep(currentStep - 1); }
	}
	function next() {
		if (!isLastStep) { direction = 1; updateStep(currentStep + 1); }
	}
	function complete() {
		direction = 1;
		updateStep(totalSteps + 1);
	}
	function goTo(n: number) {
		if (disableStepIndicators) return;
		if (n === currentStep) return;
		direction = n > currentStep ? 1 : -1;
		updateStep(n);
	}

	$effect(() => {
		void currentStep;
		(async () => {
			await tick();
			if (measureRef) parentHeight = measureRef.offsetHeight;
		})();
	});
</script>

<div class="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1]">
	<div class={`mx-auto w-full max-w-md rounded-4xl shadow-xl ${stepCircleContainerClass}`} style="border:1px solid #222;">
		<div class={`${stepContainerClass} flex w-full items-center p-8`}>
			{#each steps as _, i}
				{@const stepNumber = i + 1}
				{@const status = currentStep === stepNumber ? 'active' : currentStep < stepNumber ? 'inactive' : 'complete'}
				<div
					class={`relative outline-none focus:outline-none ${disableStepIndicators ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
					role="button"
					tabindex="0"
					onclick={() => goTo(stepNumber)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo(stepNumber)}
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-[background-color,color] duration-300"
						style={status === 'inactive'
							? 'background:#222;color:#a3a3a3;'
							: `background:${accentColor};color:${accentColor};`}
					>
						{#if status === 'complete'}
							<svg class="h-4 w-4 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{:else if status === 'active'}
							<div class="h-3 w-3 rounded-full bg-[#120F17]"></div>
						{:else}
							<span class="text-sm">{stepNumber}</span>
						{/if}
					</div>
				</div>
				{#if i < steps.length - 1}
					<div class="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-neutral-600">
						<div
							class="absolute left-0 top-0 h-full transition-[width,background-color] duration-[400ms]"
							style={currentStep > stepNumber
								? `width:100%;background-color:${accentColor};`
								: 'width:0;background-color:transparent;'}
						></div>
					</div>
				{/if}
			{/each}
		</div>

		<div
			class={`space-y-2 px-8 ${contentClass}`}
			style="position:relative;overflow:hidden;height:{isCompleted ? 0 : parentHeight}px;transition:height 0.4s cubic-bezier(0.5,1,0.5,1);"
		>
			{#if !isCompleted}
				{#key currentStep}
					<div
						bind:this={measureRef}
						style="position:absolute;left:0;right:0;top:0;animation:stepper-enter 0.4s cubic-bezier(0.4,0,0.2,1) forwards;--enter-x:{direction >= 0 ? '-100%' : '100%'};"
					>
						<div class="px-8">
							{@render steps[currentStep - 1]?.()}
						</div>
					</div>
				{/key}
			{/if}
		</div>

		{#if !isCompleted}
			<div class={`px-8 pb-8 ${footerClass}`}>
				<div class={`mt-10 flex ${currentStep !== 1 ? 'justify-between' : 'justify-end'}`}>
					{#if currentStep !== 1}
						<button
							onclick={back}
							class={`duration-350 rounded px-2 py-1 transition ${currentStep === 1 ? 'pointer-events-none opacity-50 text-neutral-400' : 'text-neutral-400 hover:text-neutral-700'}`}
						>{backButtonText}</button>
					{/if}
					<button
						onclick={isLastStep ? complete : next}
						class="next-button duration-350 flex items-center justify-center rounded-full py-1.5 px-3.5 font-medium tracking-tight transition"
					>{isLastStep ? 'Complete' : nextButtonText}</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes stepper-enter {
		from { transform: translateX(var(--enter-x)); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
	.next-button {
		background-color: #ff8a4c;
		color: #120f17;
	}
	.next-button:hover { background-color: #ff7a36; }
	.next-button:active { background-color: #e86a2a; }
</style>
