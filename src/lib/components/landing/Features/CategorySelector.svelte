<script lang="ts">
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import FeatureIcon from './FeatureIcon.svelte';
</script>

<div class="ln-feat-orbit">
	<div class="ln-feat-orbit-center">
		<img src={logo} alt="" aria-hidden="true" />
	</div>
	<div class="ln-feat-orbit-ring ln-feat-orbit-ring--1">
		<div class="ln-feat-orbit-node ln-feat-orbit-node--top"><FeatureIcon name="type" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--right"><FeatureIcon name="code" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><FeatureIcon name="layers" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--left"><FeatureIcon name="grid" /></div>
	</div>
	<div class="ln-feat-orbit-ring ln-feat-orbit-ring--2">
		<div class="ln-feat-orbit-node ln-feat-orbit-node--top"><FeatureIcon name="zap" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--tr"><FeatureIcon name="star" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--right"><FeatureIcon name="circle" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--br"><FeatureIcon name="eye" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><FeatureIcon name="box" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bl"><FeatureIcon name="heart" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--left"><FeatureIcon name="image" /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--tl"><FeatureIcon name="compass" /></div>
	</div>
</div>
