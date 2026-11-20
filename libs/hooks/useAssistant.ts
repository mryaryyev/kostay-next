import { useCallback, useEffect, useRef, useState } from 'react';
import { REACT_APP_API_URL } from '../config';
import { SseParser } from '../sse';
import { AssistantResult, AssistantState } from '../types/assistant/assistant';

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

/**
 * Asks kostay-api's POST /assistant/stream and turns its events into the box's state:
 * searching -> writing (each checked sentence as it arrives) -> done (the final answer).
 * One question at a time: a new question, or leaving the page, cancels the one in flight,
 * which also stops the answer upstream so nobody pays for it.
 */
export const useAssistant = () => {
	const [state, setState] = useState<AssistantState>({ kind: 'idle' });
	const inFlight = useRef<AbortController | null>(null);

	useEffect(() => () => inFlight.current?.abort(), []);

	const ask = useCallback(async (question: string) => {
		inFlight.current?.abort();
		const controller = new AbortController();
		inFlight.current = controller;
		setState({ kind: 'searching', question });

		let result: AssistantResult | null = null;
		try {
			// fetch, not EventSource: EventSource can only GET, the question goes in a POST body
			const response = await fetch(`${REACT_APP_API_URL}/assistant/stream`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
				body: JSON.stringify({ question }),
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
							setState({ kind: 'writing', question, text });
						} else if (event.event === 'done') {
							result = JSON.parse(event.data) as AssistantResult;
						}
					}
				}
			}
		} catch {
			// network error or our own abort; an abort is handled below
		}
		if (controller.signal.aborted) return; // a newer question (or leaving the page) took over
		inFlight.current = null;
		// "done" is the checked final answer; without it the answer did not finish
		setState({ kind: 'done', question, result: result ?? UNAVAILABLE });
	}, []);

	return { state, ask };
};
