import React, { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW } from '../../utils';
import {
	AssistantCitation,
	AssistantHostCard,
	AssistantResult,
	AssistantStayCard,
	AssistantTurn,
} from '../../types/assistant/assistant';

/**
 * One of each kind the assistant handles, in the order the site cares about: a stay request, a booking
 * question, then travel. The travel one has no date in it, so its answer does not go stale.
 */
export const EXAMPLE_QUESTIONS = [
	'Hanok in Jeonju for 4 people',
	'How do I book a stay?',
	'Festivals in Busan this winter',
];

const SOURCE_LABELS: Record<string, string> = {
	kostay_faq: 'Kostay Help',
	kostay_notice: 'Kostay notice',
	kostay_article: 'Community post',
	tourapi: 'Korea Tourism Organization',
};

const MAX_QUESTION = 500;

interface AssistantBoxProps {
	/** The conversation so far, oldest first; the last turn may still be searching or writing. */
	turns: AssistantTurn[];
	onAsk: (question: string) => void;
	onNewChat: () => void;
}

/**
 * The model numbers sources by their place in its prompt ([4], [2], [7]); readers expect 1, 2, 3.
 * Cited sources are renumbered in the order they appear; the link to each source stays the same.
 */
export const displayNumbers = (citations: AssistantCitation[]): Map<number, number> =>
	new Map(citations.map((citation, index) => [citation.number, index + 1]));

/** Same numbering while the answer is still arriving: first [n] seen becomes 1, and so on. */
export const numbersFromText = (text: string): Map<number, number> => {
	const numbers = new Map<number, number>();
	for (const match of text.matchAll(/\[(\d+)\]/g)) {
		const raw = Number(match[1]);
		if (!numbers.has(raw)) numbers.set(raw, numbers.size + 1);
	}
	return numbers;
};

/**
 * Turns the answer text into React nodes: "**bold**" becomes <strong>, "[2]" a link to source 2,
 * line breaks start a new paragraph. No HTML from the answer is ever rendered as HTML.
 */
export const renderAnswer = (
	text: string,
	linkCitations = true,
	numbers: Map<number, number> = new Map(),
	anchor = 'ai-source', // several answers on screen: each links to its own sources
): JSX.Element[] =>
	text
		.split('\n')
		.filter((line) => line.trim())
		.map((line, lineIndex) => (
			<p key={lineIndex}>
				{line.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, index) => {
					const citation = /^\[(\d+)\]$/.exec(part);
					if (citation) {
						const shown = numbers.get(Number(citation[1])) ?? Number(citation[1]);
						return linkCitations ? (
							<a key={index} className="sx-ai-cite" href={`#${anchor}-${shown}`}>
								{shown}
							</a>
						) : (
							<span key={index} className="sx-ai-cite">
								{shown}
							</span>
						);
					}
					if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
						return <strong key={index}>{part.slice(2, -2)}</strong>;
					}
					return <Fragment key={index}>{part}</Fragment>;
				})}
			</p>
		));

/**
 * A help page source links to the exact question or notice ("/help?tab=faq&faq=<id>"), not just the tab:
 * the Help Center opens that item and scrolls to it. The id is the one in the source's doc_id ("faq:<id>").
 */
export const sourceHref = (citation: AssistantCitation): string | null => {
	if (!citation.url) return null;
	const [kind, id] = citation.doc_id.split(':');
	if ((kind === 'faq' || kind === 'notice') && id && citation.url.startsWith('/help')) {
		return `${citation.url}${citation.url.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(id)}`;
	}
	return citation.url;
};

const SourceLink = ({ citation }: { citation: AssistantCitation }) => {
	const href = sourceHref(citation);
	if (!href) return <span className="sx-ai-source-title">{citation.title}</span>;
	if (href.startsWith('/')) {
		return (
			<Link className="sx-ai-source-title" href={href}>
				{citation.title}
			</Link>
		);
	}
	return (
		<a className="sx-ai-source-title" href={href} target="_blank" rel="noopener noreferrer nofollow">
			{citation.title}
			<OpenInNewRoundedIcon aria-hidden="true" />
		</a>
	);
};

const Sources = ({ citations, anchor }: { citations: AssistantCitation[]; anchor: string }) => (
	<div className="sx-ai-sources">
		<span className="sx-ai-label">Sources</span>
		<ol>
			{citations.map((citation, index) => (
				<li key={citation.number} id={`${anchor}-${index + 1}`}>
					<span className="sx-ai-source-num">{index + 1}</span>
					<span className="sx-ai-source-body">
						<SourceLink citation={citation} />
						<small className={`sx-ai-source-kind is-${citation.source}`}>
							{SOURCE_LABELS[citation.source] ?? citation.source}
						</small>
					</span>
				</li>
			))}
		</ol>
	</div>
);

const StayCards = ({ cards }: { cards: AssistantStayCard[] }) => (
	<ul className="sx-ai-stays">
		{cards.map((card) => (
			<li key={card._id}>
				<Link href={{ pathname: '/stay/detail', query: { id: card._id } }}>
					<img
						src={card.propertyImage ? `${REACT_APP_API_URL}/${card.propertyImage}` : '/img/banner/header1.webp'}
						alt={card.propertyTitle}
						loading="lazy"
					/>
					<span className="sx-ai-stay-body">
						<strong>{card.propertyTitle}</strong>
						<small>
							{card.propertyType.charAt(0) + card.propertyType.slice(1).toLowerCase()} ·{' '}
							{card.propertyLocation.charAt(0) + card.propertyLocation.slice(1).toLowerCase()}
						</small>
						<span className="sx-ai-stay-meta">
							<span>
								<b>{formatKRW(card.pricePerNight)}</b> / night
							</span>
							<span>
								<GroupOutlinedIcon aria-hidden="true" />
								{card.maxGuests}
							</span>
						</span>
					</span>
				</Link>
			</li>
		))}
	</ul>
);

const titleCase = (word: string) => word.charAt(0) + word.slice(1).toLowerCase();

const HostCards = ({ cards, city }: { cards: AssistantHostCard[]; city: string }) => (
	<ul className="sx-ai-stays is-hosts">
		{cards.map((card) => (
			<li key={card._id}>
				<Link href={{ pathname: '/host/detail', query: { hostId: card._id } }}>
					<img
						src={card.memberImage ? `${REACT_APP_API_URL}/${card.memberImage}` : '/img/profile/defaultUser.svg'}
						alt=""
						loading="lazy"
					/>
					<span className="sx-ai-stay-body">
						<strong>{card.memberNick}</strong>
						<small>Host · {titleCase(city)}</small>
						<span className="sx-ai-stay-meta">
							<span>
								<b>{card.stays}</b> {card.stays === 1 ? 'stay' : 'stays'} here
							</span>
						</span>
					</span>
				</Link>
			</li>
		))}
	</ul>
);

/** Stays and hosts that come with an answer, or stand in for one. */
const Suggestions = ({ result }: { result: AssistantResult }) => (
	<>
		{!!result.stayCards?.length && (
			<>
				<StayCards cards={result.stayCards} />
				<Link className="sx-ai-more" href="/stay">
					See all stays
				</Link>
			</>
		)}
		{!!result.hostCards?.length && <HostCards cards={result.hostCards} city={result.hosts_city ?? ''} />}
	</>
);

/** The result of a finished question: an answer with sources (and stays or hosts if asked), or an honest "can't". */
const Result = ({ result, anchor }: { result: AssistantResult; anchor: string }) => {
	if (result.status === 'answered') {
		return (
			<>
				<div className="sx-ai-answer">{renderAnswer(result.answer, true, displayNumbers(result.citations), anchor)}</div>
				{result.citations.length > 0 && <Sources citations={result.citations} anchor={anchor} />}
				<Suggestions result={result} />
			</>
		);
	}
	if (result.status === 'stays' && (result.stayCards?.length || result.hostCards?.length)) {
		return (
			<>
				<div className="sx-ai-answer">
					<p>{result.answer}</p>
				</div>
				<Suggestions result={result} />
			</>
		);
	}
	const notice =
		result.status === 'limited'
			? { icon: <HourglassEmptyRoundedIcon />, tone: 'is-wait' }
			: result.status === 'error'
			? { icon: <ErrorOutlineRoundedIcon />, tone: 'is-error' }
			: { icon: <SearchOffRoundedIcon />, tone: 'is-none' };
	return (
		<div className={`sx-ai-notice ${notice.tone}`}>
			{notice.icon}
			<div>
				<p>{result.answer}</p>
				{result.status === 'no_source' && (
					<p className="sx-ai-notice-links">
						Try the <Link href={{ pathname: '/help', query: { tab: 'faq' } }}>FAQ</Link> or{' '}
						<Link href={{ pathname: '/help', query: { tab: 'inquiry' } }}>ask us directly</Link>.
					</p>
				)}
			</div>
		</div>
	);
};

/** One question and its answer, or the answer on its way. */
const Turn = ({ turn, index }: { turn: AssistantTurn; index: number }) => (
	<div className="sx-ai-turn">
		<p className="sx-ai-question">{turn.question}</p>
		{turn.kind === 'searching' && (
			<p className="sx-ai-status">
				<span className="sx-ai-dots" aria-hidden="true">
					<i />
					<i />
					<i />
				</span>
				Searching help pages and travel guides…
			</p>
		)}
		{turn.kind === 'writing' && (
			<div className="sx-ai-answer is-writing">{renderAnswer(turn.text, false, numbersFromText(turn.text))}</div>
		)}
		{turn.kind === 'done' && <Result result={turn.result} anchor={`ai-source-${index}`} />}
	</div>
);

/**
 * The assistant in the "Ask Kostay" window: a conversation. Answers come from Kostay's help pages and the
 * Korea Tourism Organization's travel data, or are stays to book. The parent owns the requests; this box
 * only shows the turns. The question box stays at the bottom, the conversation scrolls above it.
 */
const AssistantBox = ({ turns, onAsk, onNewChat }: AssistantBoxProps) => {
	const [question, setQuestion] = useState<string>('');
	const scroller = useRef<HTMLDivElement>(null);
	const last = turns[turns.length - 1];
	const busy = last?.kind === 'searching' || last?.kind === 'writing';

	// keep the newest question and the arriving answer in view
	const progress = last?.kind === 'writing' ? last.text.length : last?.kind;
	useEffect(() => {
		const box = scroller.current;
		if (box) box.scrollTop = box.scrollHeight;
	}, [turns.length, progress]);

	const ask = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed || busy) return;
		onAsk(trimmed);
		setQuestion('');
	};

	return (
		<section className="sx-ai" aria-label="Ask Kostay Assistant">
			{turns.length > 0 && (
				<div className="sx-ai-top">
					<button type="button" onClick={onNewChat} disabled={busy}>
						<AddCommentOutlinedIcon aria-hidden="true" />
						New chat
					</button>
				</div>
			)}

			<div className="sx-ai-scroll" ref={scroller}>
				{turns.length === 0 ? (
					<div className="sx-ai-empty">
						<p>Ask about places to stay, how booking works, or festivals and things to do in Korea.</p>
						<div className="sx-ai-examples">
							{EXAMPLE_QUESTIONS.map((example) => (
								<button type="button" key={example} onClick={() => ask(example)}>
									{example}
								</button>
							))}
						</div>
					</div>
				) : (
					<div className="sx-ai-thread" aria-live="polite">
						{turns.map((turn, index) => (
							<Turn key={index} turn={turn} index={index} />
						))}
					</div>
				)}
			</div>

			<form
				className="sx-ai-form"
				onSubmit={(e) => {
					e.preventDefault();
					ask(question);
				}}
			>
				<input
					type="text"
					value={question}
					maxLength={MAX_QUESTION}
					placeholder={turns.length ? 'Ask another question' : 'Ask about stays, booking or festivals'}
					aria-label="Your question"
					disabled={busy}
					onChange={(e) => setQuestion(e.target.value)}
				/>
				<button type="submit" aria-label="Ask" disabled={busy || !question.trim()}>
					<ArrowUpwardRoundedIcon />
				</button>
			</form>
		</section>
	);
};

export default AssistantBox;
