<script lang="ts">
	import { onMount } from 'svelte';
	import CopyPageButton from '$lib/components/docs/getstarted/CopyPageButton.svelte';
	import { CHANGELOG_DESCRIPTION, getChangelogEntries, type ChangelogEntry } from '$lib/utils/changelog';

	const INITIAL_MONTHS = 6;
	const KIND_LABELS = { launch: 'New category', added: 'New', updated: 'Update' };

	type Day = { date: string; entries: ChangelogEntry[] };
	type Month = { month: string; label: string; days: Day[] };

	const toDate = (date: string) => new Date(`${date}T00:00:00Z`);
	const monthLabel = (date: string) =>
		toDate(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const dayLabel = (date: string) =>
		toDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

	const groupByMonth = (entries: ChangelogEntry[]) => {
		const months: Month[] = [];
		entries.forEach((entry) => {
			const month = entry.date.slice(0, 7);
			let group = months[months.length - 1];
			if (!group || group.month !== month) {
				group = { month, label: monthLabel(entry.date), days: [] };
				months.push(group);
			}
			let day = group.days[group.days.length - 1];
			if (!day || day.date !== entry.date) {
				day = { date: entry.date, entries: [] };
				group.days.push(day);
			}
			day.entries.push(entry);
		});
		return months;
	};

	const months = groupByMonth(getChangelogEntries());
	let showAll = $state(false);
	const visibleMonths = $derived(showAll ? months : months.slice(0, INITIAL_MONTHS));

	onMount(() => window.scrollTo(0, 0));
</script>

<section class="docs-section changelog">
	<div class="docs-page-header">
		<h1 class="docs-title">Changelog</h1>
		<CopyPageButton />
	</div>

	<p class="docs-lead">{CHANGELOG_DESCRIPTION}</p>

	<a class="changelog-rss" href="/rss.xml" target="_blank" rel="noreferrer">
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg
		>
		RSS feed
	</a>

	{#each visibleMonths as month (month.month)}
		<section class="changelog-month" aria-label={month.label}>
			<h2 class="changelog-month-title">{month.label}</h2>
			<ol class="changelog-days">
				{#each month.days as day (day.date)}
					<li class="changelog-day">
						<time class="changelog-date" datetime={day.date}>{dayLabel(day.date)}</time>
						<ul class="changelog-entries">
							{#each day.entries as entry (entry.id)}
								<li class="changelog-entry">
									<div class="changelog-entry-head">
										<a class="changelog-name" href={entry.path}>{entry.name}</a>
										<span class="changelog-meta">
											<span class="changelog-kind is-{entry.type}">{KIND_LABELS[entry.type]}</span>
											<span aria-hidden="true"> · </span>
											{entry.type === 'launch' ? `${entry.components?.length ?? 0} components` : entry.category}
										</span>
									</div>
									<p class="changelog-note">{entry.note}</p>
									{#if entry.type === 'launch'}
										<p class="changelog-includes">
											{#each entry.components ?? [] as component, index (component.path)}{index > 0 ? ', ' : ''}<a
													href={component.path}>{component.name}</a
												>{/each}
										</p>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ol>
		</section>
	{/each}

	{#if !showAll && months.length > INITIAL_MONTHS}
		<button type="button" class="changelog-older" onclick={() => (showAll = true)}>Show earlier months</button>
	{/if}
</section>
