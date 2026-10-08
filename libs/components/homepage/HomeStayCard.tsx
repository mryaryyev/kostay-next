import { formatKRW } from '../../utils';
import React, { useState } from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';

interface HomeStayCardProps {
	property: Property;
	likePropertyHandler?: any;
	featured?: boolean;
	compact?: boolean;
}

/** Desktop stay card shared by the homepage sections. */
const HomeStayCard = (props: HomeStayCardProps) => {
	const { property, likePropertyHandler, featured = false, compact = false } = props;
	const user = useReactiveVar(userVar);
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const imagePath = property.propertyImages?.[0];
	const imageSrc = imagePath ? `${REACT_APP_API_URL}/${imagePath}` : '';
	const isFavorite = Boolean(property.meLiked?.[0]?.myFavorite);
	const isTop = property.propertyRank >= topPropertyRank;
	const detailHref = { pathname: '/property/detail', query: { id: property._id } };
	const className = ['boutique-stay-card', featured && 'is-featured', compact && 'is-compact'].filter(Boolean).join(' ');

	return (
		<article className={className}>
			<div className="stay-media">
				<Link href={detailHref} className="stay-image-link" aria-label={`View ${property.propertyTitle}`}>
					{imageSrc && failedImage !== imageSrc ? (
						<img
							src={imageSrc}
							alt={property.propertyTitle}
							loading="lazy"
							decoding="async"
							onError={() => setFailedImage(imageSrc)}
						/>
					) : (
						<div className="stay-image-fallback">
							<HomeOutlinedIcon aria-hidden="true" />
							<span>Photo unavailable</span>
						</div>
					)}
				</Link>
				<span className="stay-type">{isTop ? 'Top stay' : property.propertyType.toLowerCase()}</span>
				{likePropertyHandler && (
					<IconButton
						className="stay-favorite"
						aria-label={`${isFavorite ? 'Remove' : 'Save'} ${property.propertyTitle} ${isFavorite ? 'from' : 'to'} favorites`}
						aria-pressed={isFavorite}
						onClick={() => likePropertyHandler(user, property._id)}
					>
						{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>
				)}
			</div>
			<div className="stay-content">
				<p className="stay-location">
					<PlaceOutlinedIcon aria-hidden="true" />
					{property.propertyLocation.toLowerCase()}
				</p>
				<h3 className="stay-title">
					<Link href={detailHref} title={property.propertyTitle}>
						{property.propertyTitle}
					</Link>
				</h3>
				{!compact && (
					<div className="stay-amenities">
						<span>
							<img src="/img/icons/bed.svg" alt="" />
							{property.propertyBeds} {property.propertyBeds === 1 ? 'bed' : 'beds'}
						</span>
						<span>
							<img src="/img/icons/room.svg" alt="" />
							{property.propertyRooms} {property.propertyRooms === 1 ? 'room' : 'rooms'}
						</span>
						<span>
							<img src="/img/icons/expand.svg" alt="" />
							{property.propertySquare} m²
						</span>
					</div>
				)}
				<div className="stay-footer">
					<div className="stay-price">
						<strong>{formatKRW(property.pricePerNight)}</strong>
						<span>/ night</span>
					</div>
					<span className="stay-capacity">
						Up to {property.maxGuests} {property.maxGuests === 1 ? 'guest' : 'guests'}
					</span>
				</div>
				{!compact && (
					<div className="stay-stats">
						<span>
							<RemoveRedEyeIcon aria-hidden="true" />
							{property.propertyViews} views
						</span>
						<span>
							<FavoriteBorderIcon aria-hidden="true" />
							{property.propertyLikes} likes
						</span>
					</div>
				)}
			</div>
		</article>
	);
};

export default HomeStayCard;
