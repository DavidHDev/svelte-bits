<script lang="ts">
	import PackIcon from '../shared/PackIcon.svelte';
	import {
		FiType,
		FiCircle,
		FiLayers,
		FiImage,
		FiCode,
		FiGrid,
		FiZap,
		FiBox,
		FiStar,
		FiHeart,
		FiEye,
		FiCompass
	} from 'svelte-icons-pack/fi';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
</script>

<div class="ln-feat-orbit">
	<div class="ln-feat-orbit-center">
		<img src={logo} alt="" width={18} height={18} />
	</div>
	<div class="ln-feat-orbit-ring ln-feat-orbit-ring--1">
		<div class="ln-feat-orbit-node ln-feat-orbit-node--top"><PackIcon src={FiType} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--right"><PackIcon src={FiCode} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><PackIcon src={FiLayers} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--left"><PackIcon src={FiGrid} size={16} /></div>
	</div>
	<div class="ln-feat-orbit-ring ln-feat-orbit-ring--2">
		<div class="ln-feat-orbit-node ln-feat-orbit-node--top"><PackIcon src={FiZap} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--tr"><PackIcon src={FiStar} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--right"><PackIcon src={FiCircle} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--br"><PackIcon src={FiEye} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><PackIcon src={FiBox} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--bl"><PackIcon src={FiHeart} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--left"><PackIcon src={FiImage} size={16} /></div>
		<div class="ln-feat-orbit-node ln-feat-orbit-node--tl"><PackIcon src={FiCompass} size={16} /></div>
	</div>
</div>
