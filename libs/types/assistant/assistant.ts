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
	/** The question that was answered: a follow-up ("in Incheon") comes back written out in full. */
	question?: string;
}

/**
 * One question of the conversation and where its answer stands: sources being searched, sentences
 * arriving, or the final result. Only the last turn can be unfinished.
 */
export type AssistantTurn =
	| { kind: 'searching'; question: string }
	| { kind: 'writing'; question: string; text: string }
	| { kind: 'done'; question: string; result: AssistantResult };
