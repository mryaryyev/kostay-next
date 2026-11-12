import React, { FormEvent, useEffect, useState } from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface AiSearchBarProps {
	query: string;
	onSearch: (query: string) => void;
	onClear: () => void;
}

const EXAMPLES = ['Quiet hanok in Seoul this weekend', 'Villa in Jeju for 6 under ₩300,000', '부산 바다 근처 숙소'];

/** Describe the stay in your own words; kostay-ai-search turns it into filters and ranks stays by meaning. */
const AiSearchBar = ({ query, onSearch, onClear }: AiSearchBarProps) => {
	const [text, setText] = useState<string>(query);

	// keep the box in sync when the URL changes (back button, clear)
	useEffect(() => setText(query), [query]);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const trimmed = text.trim();
		if (trimmed) onSearch(trimmed);
	};

	return (
		<form className="sx-ai-search" onSubmit={submit} role="search">
			<AutoAwesomeRoundedIcon className="sx-ai-search-icon" aria-hidden="true" />
			<input
				type="search"
				value={text}
				maxLength={300}
				placeholder={`Describe your stay, e.g. "${EXAMPLES[0]}"`}
				aria-label="Describe the stay you are looking for"
				onChange={(event) => setText(event.target.value)}
			/>
			{query && (
				<button type="button" className="sx-ai-search-clear" aria-label="Clear AI search" onClick={onClear}>
					<CloseRoundedIcon />
				</button>
			)}
			<button type="submit" className="sx-ai-search-submit" disabled={!text.trim()}>
				Search
			</button>
			{!query && (
				<div className="sx-ai-search-examples">
					<span>Try:</span>
					{EXAMPLES.map((example) => (
						<button type="button" key={example} onClick={() => onSearch(example)}>
							{example}
						</button>
					))}
				</div>
			)}
		</form>
	);
};

export default AiSearchBar;
