import React, { useRef, ChangeEvent, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Button, Menu, MenuItem } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import AiSearchBar from '../../libs/components/property/AiSearchBar';
import { useRouter } from 'next/router';
import { buildPropertyQuery, parsePropertyQuery } from '../../libs/utils';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { AI_SEARCH_PROPERTIES, GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import moment from 'moment';
import { scrollToListTop } from '../../libs/utils';

// AI search filters, in words, for the "no exact match" note
const RELAXED_WORDS: Record<string, string> = {
	typeList: 'stay type',
	guestsCount: 'number of guests',
	pricesRange: 'budget',
	locationList: 'city',
};

/** "No exact match, so the stay type and budget were left out." ('' when nothing was dropped) */
const describeRelaxed = (fields?: string[] | null): string => {
	const words = (fields ?? []).map((field) => RELAXED_WORDS[field]).filter(Boolean);
	if (!words.length) return '';
	const list = words.length === 1 ? words[0] : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
	return `No exact match, so the ${list} ${words.length === 1 ? 'was' : 'were'} left out.`;
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const searchFilter = useMemo(() => parsePropertyQuery(router.query, initialInput), [router.query, initialInput]);
	const currentPage = searchFilter.page;
	// ?ai=... switches the page to natural-language search (shareable URL, back button works)
	const aiQuery = typeof router.query.ai === 'string' ? router.query.ai.trim() : '';
	// Availability dates live in search (home search or the Dates filter); getProperties hides booked stays.
	const { checkIn, checkOut } = searchFilter.search;
	const stayDates =
		checkIn && checkOut
			? `${moment(checkIn, 'YYYY-MM-DD').format('MMM D')} – ${moment(checkOut, 'YYYY-MM-DD').format('MMM D, YYYY')}`
			: null;
	const sortKey =
		searchFilter.sort === 'pricePerNight'
			? searchFilter.direction === Direction.ASC
				? 'lowest'
				: 'highest'
			: searchFilter.sort === 'createdAt'
			? 'new'
			: 'custom';

	const setSearchFilter = async (input: PropertiesInquiry): Promise<void> => {
		try {
			await router.push(
				{
					pathname: '/stay',
					query: buildPropertyQuery(input, initialInput),
				},
				undefined,
				{ scroll: false },
			);
		} catch (err: any) {
			if (!err.cancelled) sweetMixinErrorAlert('Could not update filters. Please try again.').then();
		}
	};

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY, {});

	const {
		loading: getPropertiesLoading,
		data: currentPropertiesData,
		previousData: previousPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		skip: !router.isReady || Boolean(aiQuery),
	});

	const {
		loading: aiSearchLoading,
		data: aiSearchData,
		error: aiSearchError,
		refetch: aiSearchRefetch,
	} = useQuery(AI_SEARCH_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: { query: aiQuery, limit: 12 } },
		notifyOnNetworkStatusChange: true,
		skip: !router.isReady || !aiQuery,
	});

	// Keep the last list on screen while a filter change loads, so the page does not jump.
	const getPropertiesData = currentPropertiesData ?? previousPropertiesData;
	const isAiMode = Boolean(aiQuery);
	const listLoading = isAiMode ? aiSearchLoading : getPropertiesLoading;
	const listError = isAiMode ? aiSearchError : getPropertiesError;
	const listData = isAiMode ? aiSearchData?.aiSearchProperties : getPropertiesData?.getProperties;
	const isUpdating = listLoading && Boolean(listData);
	const properties: Property[] = listData?.list ?? [];
	const total: number = listData?.metaCounter?.[0]?.total ?? 0;
	const relaxedNote = isAiMode ? describeRelaxed(aiSearchData?.aiSearchProperties?.aiRelaxedFields) : '';
	const allBooked = isAiMode && Boolean(aiSearchData?.aiSearchProperties?.aiAllBooked);
	const refetchList = () => (isAiMode ? aiSearchRefetch() : getPropertiesRefetch({ input: searchFilter }));

	const aiSearchHandler = async (query: string): Promise<void> => {
		await router.push({ pathname: '/stay', query: { ai: query } }, undefined, { scroll: false });
	};
	const clearAiSearch = async (): Promise<void> => {
		await router.push({ pathname: '/stay', query: buildPropertyQuery(searchFilter, initialInput) }, undefined, {
			scroll: false,
		});
	};

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await setSearchFilter({ ...searchFilter, page: value });
		scrollToListTop('.sx-results');
	};

	const likePending = useRef(false);
	const likePropertyHandler = async (user: T, id: string) => {
		if (likePending.current) return;
		likePending.current = true;
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// execute likeTargetProperty Mutation
			await likeTargetProperty({
				variables: { input: id },
			});

			// refresh the list that is on screen (AI or regular search)
			await refetchList();
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			likePending.current = false;
		}
	};

	const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
	const sortOptions = [
		{ value: 'new', label: 'Newest First' },
		{ value: 'lowest', label: 'Price: Low to High' },
		{ value: 'highest', label: 'Price: High to Low' },
	];

	const sortChangeHandler = (value: string) => {
		switch (value) {
			case 'new':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'createdAt', direction: Direction.DESC });
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'pricePerNight', direction: Direction.ASC });
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'pricePerNight', direction: Direction.DESC });
		}
	};

	const pageCount = Math.ceil(total / searchFilter.limit);
	// Phones: the filter is a bottom sheet opened from the results head (CSS hides the button on desktop).
	const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
	const activeFilters = Object.values(searchFilter.search).filter((value) =>
		Array.isArray(value) ? value.length > 0 : Boolean(value),
	).length;

	const showResults = !isAiMode && !listLoading && !listError && properties.length !== 0;

	return (
		<div id="property-list-page">
			<div className="container sx-stays-layout">
				<div className={`sx-filter-wrap ${filtersOpen ? 'is-open' : ''}`}>
					<button
						type="button"
						className="sx-filter-backdrop"
						aria-label="Close filters"
						onClick={() => setFiltersOpen(false)}
					/>
					<div className="sx-filter-sheet">
						<button
							type="button"
							className="sx-filter-close"
							aria-label="Close filters"
							onClick={() => setFiltersOpen(false)}
						>
							<CloseRoundedIcon />
						</button>
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						<button type="button" className="sx-filter-done" onClick={() => setFiltersOpen(false)}>
							Show {total} {total === 1 ? 'stay' : 'stays'}
						</button>
					</div>
				</div>

				<section className="sx-results">
					<div className="sx-ai-search-head">
						<strong>Smart Search</strong>
						<span className="sx-ai-search-hint">Describe your stay in your own words: city, dates, guests, budget.</span>
					</div>
					<AiSearchBar query={aiQuery} onSearch={aiSearchHandler} onClear={clearAiSearch} />

					<div className="sx-results-head">
						<button type="button" className="sx-filters-btn" onClick={() => setFiltersOpen(true)}>
							<TuneRoundedIcon aria-hidden="true" />
							Filters{activeFilters ? ` (${activeFilters})` : ''}
						</button>
						<div className="sx-results-title">
							<h2>{isAiMode ? 'Smart Search Results' : 'Available Stays'}</h2>
						</div>
						{!isAiMode && (
							<div className="sx-sort">
								<span id="sx-sort-label">Sort by</span>
								<span className="sx-sort-select">
									<button
										type="button"
										aria-haspopup="listbox"
										aria-expanded={Boolean(sortAnchor)}
										aria-labelledby="sx-sort-label"
										onClick={(e) => setSortAnchor(e.currentTarget)}
									>
										{sortOptions.find((option) => option.value === sortKey)?.label ?? 'Custom'}
									</button>
									<ExpandMoreIcon aria-hidden="true" />
								</span>
								<Menu
									anchorEl={sortAnchor}
									open={Boolean(sortAnchor)}
									onClose={() => setSortAnchor(null)}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
									PaperProps={{ className: 'sx-sort-menu' }}
									disableScrollLock
								>
									{sortOptions.map((option) => (
										<MenuItem
											key={option.value}
											selected={option.value === sortKey}
											onClick={() => {
												setSortAnchor(null);
												sortChangeHandler(option.value);
											}}
										>
											{option.label}
										</MenuItem>
									))}
								</Menu>
							</div>
						)}
					</div>

					{isAiMode && !listLoading && !listError && (
						<p className={'sx-ai-note'}>
							{total} {total === 1 ? 'stay' : 'stays'} for <strong>“{aiQuery}”</strong>. Changing a filter switches back to the
							regular search.
							{relaxedNote && <span className={'sx-ai-relaxed'}>{relaxedNote}</span>}
						</p>
					)}

					{!isAiMode && stayDates && (
						<p className={'stay-dates-note'}>
							Available for <strong>{stayDates}</strong>
						</p>
					)}

					{!router.isReady || (listLoading && !listData) ? (
						<div className="no-data" role="status">
							{isAiMode ? 'Finding stays that match your request…' : 'Loading stays…'}
						</div>
					) : listError ? (
						<div className="no-data" role="alert">
							<p>Could not load stays. Please try again.</p>
							<Button onClick={() => refetchList().catch(() => undefined)}>Retry</Button>
						</div>
					) : properties.length === 0 ? (
						<div className={'no-data'}>
							<SearchOffOutlinedIcon aria-hidden="true" />
							<strong>
								{allBooked
									? 'Fully booked on these dates'
									: isAiMode
									? 'No stays match your request'
									: 'No stays match your filters'}
							</strong>
							<p>
								{allBooked
									? 'Try other dates.'
									: isAiMode
									? 'Try describing it differently, or other dates.'
									: 'Try another region, dates or price range.'}
							</p>
						</div>
					) : (
						<div className={`sx-stays-grid ${isUpdating ? 'is-updating' : ''}`} aria-busy={isUpdating}>
							{properties.map((property: Property) => (
								<PropertyCard
									property={property}
									likePropertyHandler={likePropertyHandler}
									variant={'stays'}
									stayDates={{ checkIn, checkOut }}
									key={property?._id}
								/>
							))}
						</div>
					)}

					{showResults && (
						<div className="sx-pagination">
							<nav aria-label="Pagination">
								<button
									type="button"
									aria-label="Previous page"
									disabled={currentPage <= 1}
									onClick={() => handlePaginationChange(null as any, currentPage - 1)}
								>
									<ChevronLeftIcon />
								</button>
								{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
									<button
										type="button"
										key={page}
										className={page === currentPage ? 'is-active' : ''}
										aria-current={page === currentPage ? 'page' : undefined}
										onClick={() => page !== currentPage && handlePaginationChange(null as any, page)}
									>
										{page}
									</button>
								))}
								<button
									type="button"
									aria-label="Next page"
									disabled={currentPage >= pageCount}
									onClick={() => handlePaginationChange(null as any, currentPage + 1)}
								>
									<ChevronRightIcon />
								</button>
							</nav>
							<p>
								Total{' '}
								<strong>
									{total} stay{total > 1 ? 's' : ''}
								</strong>{' '}
								found
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(PropertyList);
