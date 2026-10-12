import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
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
	};

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
					? 'Deactivate this listing? It will be hidden from guests until you reactivate it.'
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

	return (
		<div id="my-property-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Stays</Typography>
					<Typography className="sub-title">We are glad to see you again!</Typography>
				</Stack>
			</Stack>
			<Stack className="property-list-box">
				<Stack className="tab-name-box">
					<Typography
						onClick={() => changeStatusHandler(PropertyStatus.ACTIVE)}
						className={searchFilter.search.propertyStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
					>
						Active
					</Typography>
					<Typography
						onClick={() => changeStatusHandler(PropertyStatus.INACTIVE)}
						className={searchFilter.search.propertyStatus === 'INACTIVE' ? 'active-tab-name' : 'tab-name'}
					>
						Inactive
					</Typography>
				</Stack>
				<Stack className="list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">Listing title</Typography>
						<Typography className="title-text">Date Published</Typography>
						<Typography className="title-text">Status</Typography>
						<Typography className="title-text">View</Typography>
						{searchFilter.search.propertyStatus === 'ACTIVE' && <Typography className="title-text">Action</Typography>}
					</Stack>

					{agentProperties?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No stays found!</p>
						</div>
					) : (
						agentProperties.map((property: Property) => {
							return (
								<PropertyCard
									key={property._id}
									property={property}
									deletePropertyHandler={deletePropertyHandler}
									updatePropertyHandler={updatePropertyHandler}
								/>
							);
						})
					)}

					{agentProperties.length !== 0 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(total / searchFilter.limit)}
									page={searchFilter.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									{total} stay{total === 1 ? '' : 's'} available
								</Typography>
							</Stack>
						</Stack>
					)}
				</Stack>
			</Stack>
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
