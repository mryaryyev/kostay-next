import React, { ChangeEvent, MouseEvent, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { normalizePropertySearch } from '../../libs/utils';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const searchFilter = useMemo(
		() => normalizePropertySearch(router.query.input, initialInput),
		[router.query.input, initialInput],
	);
	const currentPage = searchFilter.page;
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const filterSortName =
		searchFilter.sort === 'pricePerNight'
			? searchFilter.direction === Direction.ASC
				? 'Lowest Price'
				: 'Highest Price'
			: searchFilter.sort === 'createdAt'
			? 'New'
			: 'Custom';

	const setSearchFilter = async (input: PropertiesInquiry): Promise<void> => {
		try {
			await router.push(
				{
					pathname: '/property',
					query: { ...router.query, input: JSON.stringify(normalizePropertySearch(input, initialInput)) },
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
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		skip: !router.isReady,
	});
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

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'createdAt', direction: Direction.DESC });
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'pricePerNight', direction: Direction.ASC });
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, page: 1, sort: 'pricePerNight', direction: Direction.DESC });
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
				<div className="container">
					<Box component={'div'} className={'right'}>
						<span>Sort by</span>
						<div>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{filterSortName}
							</Button>
							<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
								<MenuItem
									onClick={sortingHandler}
									id={'new'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									New
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'lowest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Lowest Price
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'highest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Highest Price
								</MenuItem>
							</Menu>
						</div>
					</Box>
					<Stack className={'property-page'}>
						<Stack className={'filter-config'}>
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{!router.isReady || getPropertiesLoading ? (
									<div className="no-data" role="status">Loading stays…</div>
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
									properties.map((property: Property) => {
										return (
											<PropertyCard property={property} likePropertyHandler={likePropertyHandler} key={property?._id} />
										);
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{!getPropertiesLoading && !getPropertiesError && properties.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{!getPropertiesLoading && !getPropertiesError && properties.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} stay{total > 1 ? 's' : ''} found
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
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
