import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { scrollToListTop } from '../../utils';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({ ...initialInput });
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentProperties(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getPropertiesRefetch().then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
		scrollToListTop('.main-config');
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="member-properties-page" className="sx-member-section">
			<div className="sx-member-section-head">
				<h3>Stays</h3>
				<span>
					{total} {total === 1 ? 'stay' : 'stays'}
				</span>
			</div>
			{agentProperties?.length === 0 ? (
				<div className={'no-data'}>
					<p>This Host has no stays yet.</p>
				</div>
			) : (
				<div className="sx-stays-grid">
					{agentProperties.map((property: Property) => (
						<PropertyCard
							key={property._id}
							property={property}
							likePropertyHandler={likePropertyHandler}
							variant={'stays'}
						/>
					))}
				</div>
			)}
			{total > searchFilter.limit && (
				<Pagination
					className="sx-member-pagination"
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
		limit: 6,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyProperties;
