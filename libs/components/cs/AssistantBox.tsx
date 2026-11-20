import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { REACT_APP_API_URL } from '../../config';
import { AssistantIcon } from '../assistant/assistantIcons';
import { formatKRW } from '../../utils';
import { AssistantCitation, AssistantResult, AssistantStayCard, AssistantState } from '../../types/assistant/assistant';

/** One of each kind the assistant handles: a help question, a travel question, a stay request. */
export const EXAMPLE_QUESTIONS = [
	'Can I get a refund if I cancel?',
	'When is the Busan fireworks festival?',
	'Hanok in Jeonju for 4 people',
];

const SOURCE_LABELS: Record<string, string> = {
	kostay_faq: 'Kostay Help',
	kostay_notice: 'Kostay notice',
	kostay_article: 'Community post',
	tourapi: 'Korea Tourism Organization',
};

const MAX_QUESTION = 500;

interface AssistantBoxProps {
	state: AssistantState;
	onAsk: (question: string) => void;
	/** "card" on the Help page; "panel" inside the side panel, which has its own title. */
	variant?: 'card' | 'panel';
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
							<a key={index} className="sx-ai-cite" href={`#ai-source-${shown}`}>
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

const SourceLink = ({ citation }: { citation: AssistantCitation }) => {
	if (!citation.url) return <span className="sx-ai-source-title">{citation.title}</span>;
	if (citation.url.startsWith('/')) {
		return (
			<Link className="sx-ai-source-title" href={citation.url}>
				{citation.title}
			</Link>
		);
	}
	return (
		<a className="sx-ai-source-title" href={citation.url} target="_blank" rel="noopener noreferrer nofollow">
			{citation.title}
			<OpenInNewRoundedIcon aria-hidden="true" />
		</a>
	);
};

const Sources = ({ citations }: { citations: AssistantCitation[] }) => (
	<div className="sx-ai-sources">
		<span className="sx-ai-label">Sources</span>
		<ol>
			{citations.map((citation, index) => (
				<li key={citation.number} id={`ai-source-${index + 1}`}>
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

/** The result of a finished question: an answer with sources, stays, or an honest "can't". */
const Result = ({ result }: { result: AssistantResult }) => {
	if (result.status === 'answered') {
		return (
			<>
				<div className="sx-ai-answer">{renderAnswer(result.answer, true, displayNumbers(result.citations))}</div>
				{result.citations.length > 0 && <Sources citations={result.citations} />}
			</>
		);
	}
	if (result.status === 'stays' && result.stayCards?.length) {
		return (
			<>
				<div className="sx-ai-answer">
					<p>{result.answer}</p>
				</div>
				<StayCards cards={result.stayCards} />
				<Link className="sx-ai-more" href="/stay">
					See all stays
				</Link>
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

/**
 * Help Center assistant: answers from Kostay's help pages and the Korea Tourism Organization's
 * travel data, and suggests stays. The parent owns the request; this box only shows a state.
 */
const AssistantBox = ({ state, onAsk, variant = 'card' }: AssistantBoxProps) => {
	const [question, setQuestion] = useState<string>('');
	const busy = state.kind === 'searching' || state.kind === 'writing';

	const ask = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed || busy) return;
		onAsk(trimmed);
		setQuestion('');
	};

	return (
		<section
			className={variant === 'panel' ? 'sx-ai is-panel' : 'sx-ai'}
			aria-labelledby={variant === 'panel' ? undefined : 'sx-ai-title'}
			aria-label={variant === 'panel' ? 'Ask Kostay Assistant' : undefined}
		>
			{variant === 'card' && (
				<div className="sx-ai-head">
					<span className="sx-ai-badge" aria-hidden="true">
						<AssistantIcon />
					</span>
					<div>
						<h2 id="sx-ai-title">Ask Kostay Assistant</h2>
						<p>Kostay and Korea Tourism Organization travel data</p>
					</div>
				</div>
			)}

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
					placeholder="Ask about refunds, festivals or stays"
					aria-label="Your question"
					disabled={busy}
					onChange={(e) => setQuestion(e.target.value)}
				/>
				<button type="submit" aria-label="Ask" disabled={busy || !question.trim()}>
					<ArrowUpwardRoundedIcon />
				</button>
			</form>

			{state.kind === 'idle' && (
				<div className="sx-ai-examples">
					{EXAMPLE_QUESTIONS.map((example) => (
						<button type="button" key={example} onClick={() => ask(example)}>
							{example}
						</button>
					))}
				</div>
			)}

			{state.kind !== 'idle' && (
				<div className="sx-ai-thread" aria-live="polite">
					<p className="sx-ai-question">{state.question}</p>
					{state.kind === 'searching' && (
						<p className="sx-ai-status">
							<span className="sx-ai-dots" aria-hidden="true">
								<i />
								<i />
								<i />
							</span>
							Searching help pages and travel guides…
						</p>
					)}
					{state.kind === 'writing' && (
						<div className="sx-ai-answer is-writing">{renderAnswer(state.text, false, numbersFromText(state.text))}</div>
					)}
					{state.kind === 'done' && <Result result={state.result} />}
				</div>
			)}
		</section>
	);
};

export default AssistantBox;
