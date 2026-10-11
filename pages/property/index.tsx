import React, { ChangeEvent, useMemo } from 'react';
import { NextPage } from 'next';
import { Button } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { buildPropertyQuery, parsePropertyQuery } from '../../libs/utils';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import moment from 'moment';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const searchFilter = useMemo(
		() => parsePropertyQuery(router.query, initialInput),
		[router.query, initialInput],
	);
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
					pathname: '/property',
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

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		const pageCount = Math.ceil(total / searchFilter.limit);
		const showResults = !getPropertiesLoading && !getPropertiesError && properties.length !== 0;

		return (
			<div id="property-list-page">
				<div className="container sx-stays-layout">
					<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />

					<section className="sx-results">
						<div className="sx-results-head">
							<div className="sx-results-title">
								<h2>Available Stays</h2>
								<span>
									{total} verified {total === 1 ? 'home' : 'homes'}
								</span>
							</div>
							<label className="sx-sort">
								<span>Sort by</span>
								<span className="sx-sort-select">
									<select value={sortKey} onChange={(e) => sortChangeHandler(e.target.value)}>
										{sortKey === 'custom' && <option value="custom">Custom</option>}
										<option value="new">Newest First</option>
										<option value="lowest">Price: Low to High</option>
										<option value="highest">Price: High to Low</option>
									</select>
									<ExpandMoreIcon aria-hidden="true" />
								</span>
							</label>
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

						<div className="sx-map-callout">
							<div className="sx-map-copy">
								<span className="sx-map-icon" aria-hidden="true">
									<MapOutlinedIcon />
								</span>
								<div>
									<h4>Looking for Seoul subway proximity?</h4>
									<p>Switch to interactive map mode to find hanoks within walking distance of lines 1-9.</p>
								</div>
							</div>
							<button type="button" disabled title="Map view is coming soon">
								<ExploreOutlinedIcon aria-hidden="true" />
								View on Map
							</button>
						</div>

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
									found in Korea
								</p>
							</div>
						)}
					</section>
				</div>
			</div>
		);
	}
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
		},
	},
};

export default withLayoutBasic(PropertyList);
