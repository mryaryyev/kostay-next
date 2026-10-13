import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import HistoryIcon from '@mui/icons-material/History';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { scrollToListTop } from '../../utils';

const RecentlyVisited: NextPage = () => {
	const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const {
		loading: getVisitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchVisited,
		},
		onCompleted(data: T) {
			setRecentlyVisited(data.getVisited?.list);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
		scrollToListTop('#my-page .main-config');
	};

	return (
		<div id="my-visited-page" className="sx-saved-section">
			<div className="sx-saved-head">
				<div>
					<h3>Recently Visited</h3>
					<p>Stays you opened recently.</p>
				</div>
				<span>
					{total} {total === 1 ? 'stay' : 'stays'}
				</span>
			</div>
			{recentlyVisited?.length ? (
				<div className="sx-stays-grid">
					{recentlyVisited.map((property: Property) => (
						<PropertyCard key={property._id} property={property} variant={'stays'} />
					))}
				</div>
			) : (
				<div className="sx-saved-empty">
					<HistoryIcon aria-hidden="true" />
					<p>You haven't visited any stays yet.</p>
					<Link href="/stay">Browse stays</Link>
				</div>
			)}
			{total > searchVisited.limit && (
				<Pagination
					className="sx-saved-pagination"
					count={Math.ceil(total / searchVisited.limit)}
					page={searchVisited.page}
					shape="circular"
					onChange={paginationHandler}
				/>
			)}
		</div>
	);
};

export default RecentlyVisited;
