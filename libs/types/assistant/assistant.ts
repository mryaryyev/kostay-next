/** Shapes of kostay-api's POST /assistant/stream events (the final "done" event). */

export type AssistantSource = 'kostay_faq' | 'kostay_notice' | 'kostay_article' | 'tourapi';

export interface AssistantCitation {
	number: number;
	doc_id: string;
	title: string;
	url: string | null;
	source: AssistantSource | string;
}

export interface AssistantStayCard {
	_id: string;
	propertyTitle: string;
	propertyType: string;
	propertyLocation: string;
	pricePerNight: number;
	maxGuests: number;
	propertyImage: string | null;
}

export interface AssistantResult {
	status: 'answered' | 'no_source' | 'stays' | 'error' | 'limited';
	answer: string;
	citations: AssistantCitation[];
	intent: string;
	stays: string[];
	stayCards?: AssistantStayCard[];
}

/** What the box shows: nothing asked yet, sources being searched, sentences arriving, or the final result. */
export type AssistantState =
	| { kind: 'idle' }
	| { kind: 'searching'; question: string }
	| { kind: 'writing'; question: string; text: string }
	| { kind: 'done'; question: string; result: AssistantResult };
