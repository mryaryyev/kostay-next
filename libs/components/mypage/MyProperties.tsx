import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/property/property';
import { AgentPropertiesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { PropertyStatus } from '../../enums/property.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { UPDATE_PROPERTY } from '../../../apollo/user/mutation';
import { GET_AGENT_PROPERTIES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { scrollToListTop } from '../../utils';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<AgentPropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getAgentPropertiesLoading,
		data: getAgentPropertiesData,
		error: getAgentPropertiesError,
		refetch: getAgentPropertiesRefetch,
	} = useQuery(GET_AGENT_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getAgentProperties?.list);
			setTotal(data?.getAgentProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
		scrollToListTop('#my-page .main-config');
	};

	// After "Add Stay" the host lands here with ?status=PENDING to see the stay waiting for review.
	useEffect(() => {
		if (router.isReady && router.query.status === PropertyStatus.PENDING) changeStatusHandler(PropertyStatus.PENDING);
	}, [router.isReady, router.query.status]);

	const changeStatusHandler = (value: PropertyStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { propertyStatus: value } });
	};

	/** After a listing leaves the current tab, step back if the page became empty. **/
	const refetchAfterChange = async () => {
		const result = await getAgentPropertiesRefetch({ input: searchFilter });
		const list = result?.data?.getAgentProperties?.list ?? [];
		if (list.length === 0 && searchFilter.page > 1) {
			setSearchFilter({ ...searchFilter, page: searchFilter.page - 1 });
		}
	};

	const deletePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Delete this listing?')) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: 'DELETE',
						},
					},
				});

				await refetchAfterChange();
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updatePropertyHandler = async (status: PropertyStatus, id: string) => {
		try {
			const message =
				status === PropertyStatus.INACTIVE
					? 'Pause this listing? It will be hidden from guests until you reactivate it.'
					: 'Reactivate this listing? It will be visible to guests again.';
			if (await sweetConfirmAlert(message)) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: status,
						},
					},
				});
				await refetchAfterChange();
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	const tabs = [
		{ status: PropertyStatus.ACTIVE, label: 'Active', empty: 'No active stays yet.' },
		{ status: PropertyStatus.PENDING, label: 'In review', empty: 'No stays waiting for review.' },
		{ status: PropertyStatus.INACTIVE, label: 'Paused', empty: 'No paused stays.' },
	];
	const currentTab = tabs.find((tab) => tab.status === searchFilter.search.propertyStatus) ?? tabs[0];
	const addStayHref = { pathname: '/mypage', query: { category: 'addProperty' } };

	return (
		<div id="my-property-page">
			<div className="sx-stays-head">
				<div>
					<h3>My Stays</h3>
					<p>Manage your listings and their visibility.</p>
				</div>
				<Link href={addStayHref} scroll={false} className="sx-stays-add">
					<AddRoundedIcon aria-hidden="true" />
					Add Stay
				</Link>
			</div>

			<div className="sx-stays-tabs" role="tablist" aria-label="Stay status">
				{tabs.map((tab) => {
					const active = tab.status === currentTab.status;
					return (
						<button
							key={tab.status}
							type="button"
							role="tab"
							aria-selected={active}
							className={active ? 'is-active' : ''}
							onClick={() => changeStatusHandler(tab.status)}
						>
							{tab.label}
							{active && <em>{total}</em>}
						</button>
					);
				})}
			</div>

			{agentProperties?.length === 0 ? (
				<div className="sx-stays-empty">
					<HomeWorkOutlinedIcon aria-hidden="true" />
					<p>{currentTab.empty}</p>
					{currentTab.status === PropertyStatus.ACTIVE && (
						<Link href={addStayHref} scroll={false}>
							Add your first stay
						</Link>
					)}
				</div>
			) : (
				<ul className="sx-stays-list">
					{agentProperties.map((property: Property) => (
						<PropertyCard
							key={property._id}
							property={property}
							deletePropertyHandler={deletePropertyHandler}
							updatePropertyHandler={updatePropertyHandler}
						/>
					))}
				</ul>
			)}

			{total > searchFilter.limit && (
				<Pagination
					className="sx-stays-pagination"
					count={Math.ceil(total / searchFilter.limit)}
					page={searchFilter.page}
					shape="circular"
					onChange={paginationHandler}
				/>
			)}
		</div>
	);
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			propertyStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;
