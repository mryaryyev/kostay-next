import { formatKRW } from '../../utils';
import React, { useState } from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceIcon from '@mui/icons-material/Place';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';

interface HomeStayCardProps {
	property: Property;
	likePropertyHandler?: any;
	/** 'popular' follows the Stitch Popular Stays card: no guest line, views only. */
	variant?: 'default' | 'popular';
}

const toTitleCase = (value: string) => (value ? `${value.charAt(0)}${value.slice(1).toLowerCase()}` : '');

const plural = (count: number, word: string) => `${count} ${count === 1 ? word : `${word}s`}`;

/** Desktop stay card shared by the homepage sections (Stitch: Homepage Desktop). */
const HomeStayCard = (props: HomeStayCardProps) => {
	const { property, likePropertyHandler, variant = 'default' } = props;
	const user = useReactiveVar(userVar);
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const imagePath = property.propertyImages?.[0];
	const imageSrc = imagePath ? `${REACT_APP_API_URL}/${imagePath}` : '';
	const isFavorite = Boolean(property.meLiked?.[0]?.myFavorite);
	const isPopular = variant === 'popular';
	const detailHref = { pathname: '/stay/detail', query: { id: property._id } };

	return (
		<article className={`sx-stay-card${isPopular ? ' is-popular' : ''}`}>
			<div className="sx-stay-media">
				<Link href={detailHref} className="sx-stay-image" aria-label={`View ${property.propertyTitle}`}>
					{imageSrc && failedImage !== imageSrc ? (
						<img
							src={imageSrc}
							alt={property.propertyTitle}
							loading="lazy"
							decoding="async"
							onError={() => setFailedImage(imageSrc)}
						/>
					) : (
						<span className="sx-stay-fallback">
							<HomeOutlinedIcon aria-hidden="true" />
						</span>
					)}
				</Link>
				<span className="sx-stay-badge">{property.propertyType}</span>
				{likePropertyHandler && (
					<IconButton
						className="sx-stay-heart"
						aria-label={`${isFavorite ? 'Remove' : 'Save'} ${property.propertyTitle} ${isFavorite ? 'from' : 'to'} favorites`}
						aria-pressed={isFavorite}
						onClick={() => likePropertyHandler(user, property._id)}
					>
						{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>
				)}
				<span className="sx-stay-location">
					<PlaceIcon aria-hidden="true" />
					{toTitleCase(property.propertyLocation)}
				</span>
			</div>
			<div className="sx-stay-body">
				{!isPopular && <span className="sx-stay-guests">Up to {plural(property.maxGuests, 'guest')}</span>}
				<h3 className="sx-stay-title">
					<Link href={detailHref} title={property.propertyTitle}>
						{property.propertyTitle}
					</Link>
				</h3>
				<p className="sx-stay-specs">
					{plural(property.propertyBeds, 'bed')} · {plural(property.propertyRooms, 'room')} · {property.propertySquare} m²
				</p>
				<div className="sx-stay-foot">
					<div className="sx-stay-price">
						<strong>{formatKRW(property.pricePerNight)}</strong>
						<span>/ night</span>
					</div>
					<div className="sx-stay-stats">
						<span aria-label={`${property.propertyViews} views`}>
							<VisibilityOutlinedIcon aria-hidden="true" />
							{isPopular ? plural(property.propertyViews, 'view') : property.propertyViews}
						</span>
						{!isPopular && (
							<span aria-label={`${property.propertyLikes} likes`}>
								<FavoriteBorderIcon aria-hidden="true" />
								{property.propertyLikes}
							</span>
						)}
					</div>
				</div>
			</div>
		</article>
	);
};

export default HomeStayCard;
