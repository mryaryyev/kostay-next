import React, { ChangeEvent, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Button, Menu, MenuItem } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { buildPropertyQuery, parsePropertyQuery } from '../../libs/utils';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import moment from 'moment';
import { scrollToListTop } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const searchFilter = useMemo(() => parsePropertyQuery(router.query, initialInput), [router.query, initialInput]);
	const currentPage = searchFilter.page;
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
		skip: !router.isReady,
	});
	// Keep the last list on screen while a filter change loads, so the page does not jump.
	const getPropertiesData = currentPropertiesData ?? previousPropertiesData;
	const isUpdating = getPropertiesLoading && Boolean(getPropertiesData);
	const properties: Property[] = getPropertiesData?.getProperties?.list ?? [];
	const total: number = getPropertiesData?.getProperties?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await setSearchFilter({ ...searchFilter, page: value });
		scrollToListTop('.sx-results');
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// execute likeTargetProperty Mutation
			await likeTargetProperty({
				variables: { input: id },
			});

			// execute getPropertiesRefetch
			await getPropertiesRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err);
			sweetMixinErrorAlert(err.message).then();
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

	const showResults = !getPropertiesLoading && !getPropertiesError && properties.length !== 0;

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
					<div className="sx-results-head">
						<button type="button" className="sx-filters-btn" onClick={() => setFiltersOpen(true)}>
							<TuneRoundedIcon aria-hidden="true" />
							Filters{activeFilters ? ` (${activeFilters})` : ''}
						</button>
						<div className="sx-results-title">
							<h2>Available Stays</h2>
						</div>
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
					</div>

					{stayDates && (
						<p className={'stay-dates-note'}>
							Available for <strong>{stayDates}</strong>
						</p>
					)}

					{!router.isReady || (getPropertiesLoading && !getPropertiesData) ? (
						<div className="no-data" role="status">
							Loading stays…
						</div>
					) : getPropertiesError ? (
						<div className="no-data" role="alert">
							<p>Could not load stays. Please try again.</p>
							<Button onClick={() => getPropertiesRefetch().catch(() => undefined)}>Retry</Button>
						</div>
					) : properties.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No stays found!</p>
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
