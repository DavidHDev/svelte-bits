<script lang="ts">
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import ProPillars from '$lib/components/common/Pro/ProPillars.svelte';
	import { proLinkProps } from '$lib/utils/pro';
	import { reveal } from '../shared/motion';
	import './ProSpotlight.css';

	const PLACEMENT = 'landing-pro-spotlight';
</script>

<section class="ln-prospot-section" aria-labelledby="ln-prospot-title">
	<div class="ln-prospot-inner" use:reveal>
		<header class="ln-prospot-header">
			<div class="ln-prospot-copy">
				<h2 id="ln-prospot-title">Also building with React?</h2>
				<p>
					From the maker of Svelte Bits. React Bits Pro has page sections, app UI, full Next.js templates and agent
					skills for React, all as source you own.
				</p>
			</div>

			<a class="ln-prospot-btn ln-prospot-btn--primary" {...proLinkProps('/', PLACEMENT)}>
				Explore React Bits Pro
				<HugeIcon icon={ArrowRight02Icon} size={17} strokeWidth={1.8} />
			</a>
		</header>

		<ProPillars placement="landing-pro" />
	</div>
</section>
