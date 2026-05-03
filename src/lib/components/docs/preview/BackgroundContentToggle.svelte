<script lang="ts">
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	type Props = {
		headline?: string;
		showContent?: boolean;
		onToggle?: (value: boolean) => void;
	};

	let { headline = 'Build interfaces that feel alive', showContent = true, onToggle }: Props = $props();
</script>

<div class="bg-content-root" aria-hidden="true">
	<div class="bg-content-toggle-wrap">
		<label class="bg-content-switch-row">
			<span>Demo Content</span>
			<input
				type="checkbox"
				checked={showContent}
				onchange={(e) => onToggle?.((e.currentTarget as HTMLInputElement).checked)}
			/>
			<span class="bg-content-switch" aria-hidden="true"></span>
		</label>
	</div>

	{#if showContent}
		<div class="bg-content-nav-wrap">
			<div class="bg-content-nav bg-content-glass">
				<div class="bg-content-logo-wrap">
					<img src={logo} alt="" />
				</div>
				<div class="bg-content-menu-icon">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="4" y1="7" x2="20" y2="7" />
						<line x1="4" y1="12" x2="20" y2="12" />
						<line x1="4" y1="17" x2="20" y2="17" />
					</svg>
				</div>
				<div class="bg-content-nav-links">
					<span>Features</span>
					<span>About</span>
					<span class="bg-content-signup">Sign up</span>
				</div>
			</div>
		</div>

		<div class="bg-content-hero">
			<div class="bg-content-tag bg-content-glass">
				<span class="bg-content-tag-new">New</span>
				<span>Just shipped v2.0</span>
			</div>

			<h2>{headline}</h2>

			<div class="bg-content-actions">
				<span class="bg-content-primary">Get started</span>
				<span class="bg-content-secondary bg-content-glass">Learn more</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.bg-content-root {
		position: absolute;
		inset: 0;
		user-select: none;
		pointer-events: none;
		z-index: 10;
	}

	.bg-content-glass {
		backdrop-filter: blur(32px) saturate(1.35);
		-webkit-backdrop-filter: blur(32px) saturate(1.35);
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.22),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.08);
	}

	.bg-content-toggle-wrap {
		position: absolute;
		right: 12px;
		bottom: 12px;
		z-index: 10;
		width: 180px;
		opacity: 0.5;
		transition: opacity 0.3s ease;
		pointer-events: auto;
	}

	.bg-content-toggle-wrap:hover {
		opacity: 1;
	}

	.bg-content-switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		min-height: 36px;
		padding: 8px 10px 8px 12px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(18, 15, 23, 0.5);
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		box-sizing: border-box;
	}

	.bg-content-switch-row input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.bg-content-switch {
		position: relative;
		width: 34px;
		height: 20px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
		transition: background 0.2s ease;
	}

	.bg-content-switch::before {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.85);
		transition: transform 0.2s ease;
	}

	.bg-content-switch-row input:checked + .bg-content-switch {
		background: #ff3e00;
	}

	.bg-content-switch-row input:checked + .bg-content-switch::before {
		transform: translateX(14px);
	}

	.bg-content-nav-wrap {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
		width: 100%;
		pointer-events: none;
	}

	.bg-content-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 70%;
		height: 48px;
		margin: 20px auto 0;
		padding: 0 8px 0 14px;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		box-sizing: border-box;
	}

	.bg-content-logo-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bg-content-logo-wrap img {
		height: 20px;
		width: 20px;
	}

	.bg-content-menu-icon {
		display: none;
		align-items: center;
		color: rgba(255, 255, 255, 0.5);
	}

	.bg-content-nav-links {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.bg-content-nav-links span {
		color: rgba(255, 255, 255, 0.4);
		font-size: 13px;
		font-weight: 500;
	}

	.bg-content-nav-links .bg-content-signup {
		display: flex;
		align-items: center;
		height: 30px;
		padding: 0 16px;
		border-radius: 8px;
		background: #fff;
		color: #000;
		font-size: 12px;
		font-weight: 600;
	}

	.bg-content-hero {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 0 24px;
		pointer-events: none;
	}

	.bg-content-tag {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 14px 5px 5px;
		border-radius: 50px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(18, 15, 23, 0.5);
	}

	.bg-content-tag-new {
		padding: 3px 10px;
		border-radius: 50px;
		background: #fff;
		color: #000;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.bg-content-tag span:last-child {
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.5);
	}

	.bg-content-hero h2 {
		max-width: 20ch;
		margin: 24px 0 0;
		color: #fff;
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		line-height: 1.1;
		text-align: center;
		letter-spacing: -0.03em;
		font-weight: 600;
		text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
	}

	.bg-content-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 28px;
	}

	.bg-content-primary,
	.bg-content-secondary {
		display: flex;
		align-items: center;
		height: 40px;
		padding: 0 20px;
		border-radius: 10px;
		font-size: 13px;
	}

	.bg-content-primary {
		background: #fff;
		color: #000;
		font-weight: 600;
	}

	.bg-content-secondary {
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.bg-content-nav {
			width: 92%;
		}

		.bg-content-menu-icon {
			display: flex;
		}

		.bg-content-nav-links {
			display: none;
		}
	}
</style>
