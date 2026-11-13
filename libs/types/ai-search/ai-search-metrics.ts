export interface AiSearchDailyMetrics {
	date: string;
	searches: number;
	p95Ms: number;
	costUsd: number;
	requests: number;
	fallbacks: number;
}

export interface AiSearchMetrics {
	days: number;
	available: boolean;
	searches: number;
	p50Ms: number;
	p95Ms: number;
	avgLlmMs: number;
	avgEmbedMs: number;
	avgSearchMs: number;
	avgRerankMs: number;
	costUsd: number;
	costPer1kUsd: number;
	noResults: number;
	relaxed: number;
	relaxedFields: { field: string; count: number }[];
	llmFailed: number;
	requests: number;
	fallbacks: number;
	daily: AiSearchDailyMetrics[];
}

/** Thresholds for the health line and the dashboard card. */
export const AI_SEARCH_LIMITS = {
	p95WarnMs: 4000, // NestJS gives up at 8 s; warn well before that
	fallbackWarnRate: 0.05,
	fallbackBadRate: 0.2,
};

export const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)} s`;

export const percent = (part: number, whole: number): string =>
	whole ? `${((part / whole) * 100).toFixed(1)}%` : '0%';

export type AiSearchHealth = 'good' | 'warn' | 'bad' | 'idle' | 'down';

/** One word for the whole system, used by the status line and the dashboard card. */
export const aiSearchHealth = (m: AiSearchMetrics): AiSearchHealth => {
	if (!m.available) return 'down';
	if (!m.requests && !m.searches) return 'idle';
	const fallbackRate = m.requests ? m.fallbacks / m.requests : 0;
	if (fallbackRate >= AI_SEARCH_LIMITS.fallbackBadRate) return 'bad';
	if (fallbackRate >= AI_SEARCH_LIMITS.fallbackWarnRate || m.p95Ms >= AI_SEARCH_LIMITS.p95WarnMs) return 'warn';
	return 'good';
};
