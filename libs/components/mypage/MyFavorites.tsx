import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { scrollToListTop } from '../../utils';

const MyFavorites: NextPage = () => {
	const [myFavorites, setMyFavorites] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFavorites,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMyFavorites(data.getFavorites?.list);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
		scrollToListTop('#my-page .main-config');
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProperty({
				variables: {
					input: id,
				},
			});
			await getFavoritesRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// Every stay here is liked by the viewer, but GET_FAVORITES has no meLiked: mark them so the heart shows filled.
	const favoriteStays = myFavorites?.map((property) => ({ ...property, meLiked: [{ myFavorite: true }] })) as Property[];

	return (
		<div id="my-favorites-page" className="sx-saved-section">
			<div className="sx-saved-head">
				<div>
					<h3>My Favorites</h3>
					<p>Stays you liked.</p>
				</div>
				<span>
					{total} {total === 1 ? 'stay' : 'stays'}
				</span>
			</div>
			{favoriteStays?.length ? (
				<div className="sx-stays-grid">
					{favoriteStays.map((property: Property) => (
						<PropertyCard
							key={property._id}
							property={property}
							likePropertyHandler={likePropertyHandler}
							variant={'stays'}
						/>
					))}
				</div>
			) : (
				<div className="sx-saved-empty">
					<FavoriteBorderIcon aria-hidden="true" />
					<p>No favorite stays yet.</p>
					<Link href="/stay">Browse stays</Link>
				</div>
			)}
			{total > searchFavorites.limit && (
				<Pagination
					className="sx-saved-pagination"
					count={Math.ceil(total / searchFavorites.limit)}
					page={searchFavorites.page}
					shape="circular"
					onChange={paginationHandler}
				/>
			)}
		</div>
	);
};

export default MyFavorites;
