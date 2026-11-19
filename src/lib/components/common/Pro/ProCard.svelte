<script lang="ts">
	import { PRO_COUNTS, PRO_PANEL } from '$lib/constants/pro';
	import { proLinkProps } from '$lib/utils/pro';
	import ProCardDither from './ProCardDither.svelte';
	import './ProCard.css';

	type Props = { placement?: string };

	let { placement = 'right-panel-card' }: Props = $props();

	const MEDIA = 'https://reactbits.dev/assets/pro-card';
</script>

<a {...proLinkProps(PRO_PANEL.path, placement)} class="pro-card-link">
	<article class="pro-card">
		<div class="pro-card-preview" aria-hidden="true">
			<ProCardDither class="pro-card-dither" />
			<img
				class="pro-card-og pro-card-og-dark"
				src="{MEDIA}/og-dark.webp"
				alt=""
				width="800"
				height="420"
				loading="lazy"
				decoding="async"
			/>
			<img
				class="pro-card-og pro-card-og-light"
				src="{MEDIA}/og-light.webp"
				alt=""
				width="800"
				height="420"
				loading="lazy"
				decoding="async"
			/>
		</div>

		<div class="pro-card-content">
			<h3 class="pro-card-title">{PRO_PANEL.title}</h3>
			<p class="pro-card-desc">{PRO_PANEL.description}</p>
			<div class="pro-card-counts">
				<span>{PRO_COUNTS.components} Components · {PRO_COUNTS.blocks} Blocks</span>
				<span>
					{PRO_COUNTS.appUi} App UI · {PRO_COUNTS.templates} Templates · {PRO_COUNTS.agentKit} Agent Skills
				</span>
			</div>

			<div class="pro-card-cta ln-navbar-pro">
				<span>Explore React Bits Pro</span>
			</div>
		</div>
	</article>
</a>
