import React from 'react';
import { useRouter } from 'next/router';
import AiSearchBar from '../property/AiSearchBar';

/** Home hero: Smart Search (natural language) first, the classic filters below it. */
const HomeAiSearch = () => {
	const router = useRouter();

	const searchHandler = async (query: string): Promise<void> => {
		await router.push({ pathname: '/stay', query: { ai: query } });
	};

	return (
		<div className="home-ai-search">
			<div className="sx-ai-search-head">
				<strong>Smart Search</strong>
				<span className="sx-ai-search-hint">Describe your stay in your own words: city, dates, guests, budget.</span>
			</div>
			<AiSearchBar query="" onSearch={searchHandler} onClear={() => undefined} />
			<p className="home-ai-search-or">or filter by details</p>
		</div>
	);
};

export default HomeAiSearch;
