import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import {
	CheckCircle,
	Clock,
	Coins,
	FunnelSimple,
	MagnifyingGlass,
	PlugsConnected,
	SmileyBlank,
	Warning,
} from 'phosphor-react';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { GET_AI_SEARCH_METRICS } from '../../apollo/admin/query';
import {
	AiSearchDailyMetrics,
	AiSearchMetrics,
	aiSearchHealth,
	percent,
	seconds,
} from '../../libs/types/ai-search/ai-search-metrics';

const RANGES = [
	{ days: 1, label: '24 h' },
	{ days: 7, label: '7 days' },
	{ days: 30, label: '30 days' },
];

const FIELD_WORDS: Record<string, string> = {
	typeList: 'stay type',
	guestsCount: 'number of guests',
	pricesRange: 'budget',
	locationList: 'city',
};

const dayLabel = (date: string) =>
	new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Simple SVG chart: bars or a line over the days, with a native hover title per day. */
const DailyChart = ({
	days,
	value,
	title,
	kind,
	format,
}: {
	days: AiSearchDailyMetrics[];
	value: (day: AiSearchDailyMetrics) => number;
	title: (day: AiSearchDailyMetrics) => string;
	kind: 'bar' | 'line';
	format: (n: number) => string;
}) => {
	const width = 520;
	const height = 150;
	const pad = { top: 10, right: 8, bottom: 22, left: 44 };
	const innerW = width - pad.left - pad.right;
	const innerH = height - pad.top - pad.bottom;
	const values = days.map(value);
	const max = Math.max(...values, 0) || 1;
	const step = innerW / Math.max(days.length, 1);
	const x = (i: number) => pad.left + step * i + step / 2;
	const y = (v: number) => pad.top + innerH - (v / max) * innerH;
	const labelEvery = Math.ceil(days.length / 7);
	const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');

	return (
		<svg className={'ais-chart'} viewBox={`0 0 ${width} ${height}`} role={'img'}>
			{[0, 0.5, 1].map((share) => (
				<g key={share}>
					<line className={'ais-grid'} x1={pad.left} x2={width - pad.right} y1={y(max * share)} y2={y(max * share)} />
					<text className={'ais-axis'} x={pad.left - 8} y={y(max * share) + 4} textAnchor={'end'}>
						{format(max * share)}
					</text>
				</g>
			))}
			{kind === 'line' && values.length > 1 && (
				<>
					<path className={'ais-area'} d={`${line} L${x(values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} />
					<path className={'ais-line'} d={line} />
				</>
			)}
			{days.map((day, i) => {
				const v = values[i];
				const barW = Math.min(22, step * 0.6);
				return (
					<g key={day.date}>
						<title>{title(day)}</title>
						{kind === 'bar' ? (
							<rect
								className={'ais-bar'}
								x={x(i) - barW / 2}
								y={y(v)}
								width={barW}
								height={Math.max(v ? 2 : 0, y(0) - y(v))}
								rx={4}
							/>
						) : (
							<circle className={'ais-dot'} cx={x(i)} cy={y(v)} r={3} />
						)}
						<rect x={x(i) - step / 2} y={pad.top} width={step} height={innerH} fill={'transparent'} />
						{i % labelEvery === 0 && (
							<text className={'ais-axis'} x={x(i)} y={height - 6} textAnchor={'middle'}>
								{dayLabel(day.date)}
							</text>
						)}
					</g>
				);
			})}
		</svg>
	);
};

/** Admin → AI Search: Smart Search health (volume, latency, cost, outcomes, keyword fallbacks). */
const AdminAiSearch: NextPage = () => {
	const [days, setDays] = useState<number>(7);

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery(GET_AI_SEARCH_METRICS, {
		fetchPolicy: 'network-only',
		variables: { days },
	});
	const m: AiSearchMetrics | undefined = data?.getAiSearchMetrics;

	const health = m ? aiSearchHealth(m) : null;
	const fallbackRate = m && m.requests ? m.fallbacks / m.requests : 0;
	const answered = m && m.requests ? 1 - fallbackRate : 1;
	const statusText: Record<string, string> = {
		good: `Healthy · AI answered ${percent(answered, 1)} of searches, p95 ${m ? seconds(m.p95Ms) : ''}`,
		warn: `Needs a look · ${percent(m?.fallbacks ?? 0, m?.requests ?? 0)} fell back to keyword search, p95 ${
			m ? seconds(m.p95Ms) : ''
		}`,
		bad: `Degraded · ${percent(m?.fallbacks ?? 0, m?.requests ?? 0)} of searches fell back to keyword search`,
		idle: 'No Smart Search traffic in this period',
		down: 'AI search service unreachable · guests get keyword search',
	};

	const timeParts = m
		? [
				{ label: 'LLM filters', ms: m.avgLlmMs, className: 'is-llm' },
				{ label: 'Embedding', ms: m.avgEmbedMs, className: 'is-embed' },
				{ label: 'Qdrant', ms: m.avgSearchMs, className: 'is-qdrant' },
				...(m.avgRerankMs ? [{ label: 'Reranker', ms: m.avgRerankMs, className: 'is-rerank' }] : []),
		  ]
		: [];
	const timeTotal = timeParts.reduce((sum, part) => sum + part.ms, 0);

	const cards = m
		? [
				{ icon: <MagnifyingGlass />, label: 'Searches', value: m.searches, note: `${Math.round(m.searches / days)} a day` },
				{
					icon: <Clock />,
					label: 'Latency p50 / p95',
					value: (
						<>
							{seconds(m.p50Ms)} <em>/ {seconds(m.p95Ms)}</em>
						</>
					),
					note: 'NestJS gives up at 8 s',
				},
				{
					icon: <Coins />,
					label: 'LLM cost',
					value: `$${m.costUsd.toFixed(m.costUsd < 1 ? 3 : 2)}`,
					note: `$${m.costPer1kUsd.toFixed(2)} per 1,000 searches`,
				},
				{
					icon: <SmileyBlank />,
					label: 'No results',
					value: percent(m.noResults, m.searches),
					note: `${m.noResults} searches`,
				},
				{
					icon: <FunnelSimple />,
					label: 'Filters relaxed',
					value: percent(m.relaxed, m.searches),
					note: m.relaxedFields.length
						? `most often the ${FIELD_WORDS[m.relaxedFields[0].field] ?? m.relaxedFields[0].field}`
						: 'every search matched exactly',
				},
				{
					icon: <PlugsConnected />,
					label: 'Fallback to keyword',
					value: percent(m.fallbacks, m.requests),
					note: `${m.fallbacks} · AI slow or down`,
					watch: true,
				},
		  ]
		: [];

	return (
		<Box component={'div'} className={'content admin-ai-search'}>
			<div className={'ais-head'}>
				<div>
					<span className={'ais-eyebrow'}>Monitoring</span>
					<h2>AI search</h2>
					<p>Smart Search health on kostay.kr</p>
				</div>
				<div className={'ais-range'} role={'group'} aria-label={'Time range'}>
					{RANGES.map((range) => (
						<button
							type={'button'}
							key={range.days}
							className={days === range.days ? 'on' : ''}
							aria-pressed={days === range.days}
							onClick={() => setDays(range.days)}
						>
							{range.label}
						</button>
					))}
				</div>
			</div>

			{error ? (
				<div className={'ais-status is-bad'} role={'alert'}>
					<Warning weight={'bold'} /> Could not load the metrics.
					<button type={'button'} onClick={() => refetch().catch(() => undefined)}>
						Retry
					</button>
				</div>
			) : !m ? (
				<div className={'ais-status'}>{loading ? 'Loading metrics…' : 'No data'}</div>
			) : (
				<>
					<div className={`ais-status is-${health}`} role={'status'}>
						{health === 'good' ? <CheckCircle weight={'bold'} /> : <Warning weight={'bold'} />}
						{statusText[health ?? 'idle']}
					</div>

					<div className={'ais-cards'}>
						{cards.map((card) => (
							<div
								key={card.label}
								className={`ais-card ${card.watch ? 'is-watch' : ''} ${card.watch && fallbackRate > 0 ? 'is-hot' : ''}`}
							>
								<span>
									{card.icon}
									{card.label}
								</span>
								<strong>{card.value}</strong>
								<small>{card.note}</small>
							</div>
						))}
					</div>

					<div className={'ais-charts'}>
						<div className={'ais-panel'}>
							<div className={'ais-panel-head'}>
								<h3>Searches a day</h3>
								<small>p95 on hover</small>
							</div>
							<DailyChart
								days={m.daily}
								kind={'bar'}
								value={(day) => day.searches}
								format={(n) => String(Math.round(n))}
								title={(day) =>
									`${dayLabel(day.date)}: ${day.searches} searches · p95 ${seconds(day.p95Ms)} · ${day.fallbacks} fallbacks`
								}
							/>
						</div>
						<div className={'ais-panel'}>
							<div className={'ais-panel-head'}>
								<h3>LLM cost a day</h3>
								<small>USD</small>
							</div>
							<DailyChart
								days={m.daily}
								kind={'line'}
								value={(day) => day.costUsd}
								format={(n) => `$${n.toFixed(n === 0 ? 0 : n < 0.01 ? 4 : n < 0.1 ? 3 : 2)}`}
								title={(day) => `${dayLabel(day.date)}: $${day.costUsd.toFixed(4)}`}
							/>
						</div>
					</div>

					<div className={'ais-panel'}>
						<div className={'ais-panel-head'}>
							<h3>Where the time goes</h3>
							<small>average search, {seconds(timeTotal)}</small>
						</div>
						<div className={'ais-split'}>
							{timeParts.map((part) => (
								<span
									key={part.label}
									className={part.className}
									style={{ width: `${timeTotal ? (part.ms / timeTotal) * 100 : 0}%` }}
								/>
							))}
						</div>
						<div className={'ais-legend'}>
							{timeParts.map((part) => (
								<span key={part.label}>
									<i className={part.className} />
									{part.label} {timeTotal ? Math.round((part.ms / timeTotal) * 100) : 0}% · {part.ms} ms
								</span>
							))}
						</div>
						{m.llmFailed > 0 && (
							<p className={'ais-foot'}>The LLM did not answer {m.llmFailed} times; those searches ran without filters.</p>
						)}
					</div>
				</>
			)}
		</Box>
	);
};

export default withAdminLayout(AdminAiSearch);
