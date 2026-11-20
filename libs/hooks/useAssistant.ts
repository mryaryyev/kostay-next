import { useCallback, useEffect, useRef, useState } from 'react';
import { REACT_APP_API_URL } from '../config';
import { SseParser } from '../sse';
import { AssistantResult, AssistantTurn } from '../types/assistant/assistant';

const failure = (status: AssistantResult['status'], answer: string): AssistantResult => ({
	status,
	answer,
	citations: [],
	intent: 'unknown',
	stays: [],
});

// same words as kostay-api uses when the assistant cannot answer
export const UNAVAILABLE = failure('error', 'The assistant is not available right now. Please try again in a moment.');
const INVALID = failure('error', 'Please write a question of up to 500 characters.');

/** Earlier questions sent with a new one; kostay-api accepts at most this many. */
export const MAX_HISTORY = 3;
/** Turns kept on screen; older ones drop off the top. */
export const MAX_TURNS = 20;

// a question that was understood is worth remembering, whatever came of it; a failed call is not
const UNDERSTOOD: AssistantResult['status'][] = ['answered', 'stays', 'no_source'];

/** The conversation with its last turn replaced. */
const withLast = (turns: AssistantTurn[], last: AssistantTurn): AssistantTurn[] => [...turns.slice(0, -1), last];

/**
 * A conversation with the assistant over kostay-api's POST /assistant/stream. Each question becomes a
 * turn: searching -> writing (each checked sentence as it arrives) -> done (the final answer).
 *
 * Follow-ups: every answer comes back with the question as the assistant understood it ("in Incheon" ->
 * "cheapest stays in Incheon"). Those, not the visitor's own words, are sent as `history` with the next
 * question, so each entry can be read on its own and the last three are enough.
 *
 * One question at a time. Starting a new chat, or leaving, cancels the one in flight, which also stops
 * the answer upstream so nobody pays for it. Nothing is stored: a reload starts a new conversation.
 */
export const useAssistant = () => {
	const [turns, setTurns] = useState<AssistantTurn[]>([]);
	const history = useRef<string[]>([]);
	const inFlight = useRef<AbortController | null>(null);

	useEffect(() => () => inFlight.current?.abort(), []);

	const ask = useCallback(async (question: string) => {
		if (inFlight.current) return; // the box is disabled meanwhile; this guards a double submit
		const controller = new AbortController();
		inFlight.current = controller;
		setTurns((earlier) => [...earlier, { kind: 'searching' as const, question }].slice(-MAX_TURNS));

		let result: AssistantResult | null = null;
		try {
			// fetch, not EventSource: EventSource can only GET, the question goes in a POST body
			const response = await fetch(`${REACT_APP_API_URL}/assistant/stream`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
				body: JSON.stringify({ question, history: history.current.slice(-MAX_HISTORY) }),
				signal: controller.signal,
			});
			if (response.status === 400) {
				result = INVALID;
			} else if (response.body) {
				// a 429 also arrives here: its body is a "done" event with the limit message
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				const parser = new SseParser();
				let text = '';
				for (;;) {
					const { value, done } = await reader.read();
					if (done) break;
					for (const event of parser.push(decoder.decode(value, { stream: true }))) {
						if (event.event === 'delta') {
							text += (JSON.parse(event.data) as { text: string }).text;
							const writing = { kind: 'writing' as const, question, text };
							if (!controller.signal.aborted) setTurns((now) => withLast(now, writing));
						} else if (event.event === 'done') {
							result = JSON.parse(event.data) as AssistantResult;
						}
					}
				}
			}
		} catch {
			// network error or our own abort; an abort is handled below
		}
		if (controller.signal.aborted) return; // a new chat (or leaving the page) took over
		inFlight.current = null;
		// "done" is the checked final answer; without it the answer did not finish
		const final = result ?? UNAVAILABLE;
		if (UNDERSTOOD.includes(final.status)) history.current.push(final.question || question);
		setTurns((now) => withLast(now, { kind: 'done', question, result: final }));
	}, []);

	/** Forget the conversation: the next question is read on its own. */
	const newChat = useCallback(() => {
		inFlight.current?.abort();
		inFlight.current = null;
		history.current = [];
		setTurns([]);
	}, []);

	return { turns, ask, newChat };
};
