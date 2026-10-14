import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatKRW } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import VillaOutlinedIcon from '@mui/icons-material/VillaOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TempleBuddhistOutlinedIcon from '@mui/icons-material/TempleBuddhistOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { PropertyType } from '../../enums/property.enum';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	/** Kept for callers; the Stitch stay card is the only layout now. */
	variant?: 'stays';
	/** Dates picked on Stays; passed on so the stay page opens with them filled in. */
	stayDates?: { checkIn?: string; checkOut?: string };
}

const typeIcons: Record<PropertyType, JSX.Element> = {
	[PropertyType.APARTMENT]: <ApartmentIcon />,
	[PropertyType.VILLA]: <VillaOutlinedIcon />,
	[PropertyType.HOUSE]: <HomeOutlinedIcon />,
	[PropertyType.HANOK]: <TempleBuddhistOutlinedIcon />,
};

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, stayDates } = props;
	const user = useReactiveVar(userVar);
	const imagePath: string = property?.propertyImages[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
		: '/img/banner/header1.svg';

	const detailHref = {
		pathname: '/stay/detail',
		query: {
			id: property?._id,
			...(stayDates?.checkIn && stayDates?.checkOut ? { checkIn: stayDates.checkIn, checkOut: stayDates.checkOut } : {}),
		},
	};
	const isFavorite = Boolean(property?.meLiked?.[0]?.myFavorite);

	return (
		<article className="sx-stay">
			<div className="sx-stay-photo">
				<Link href={detailHref} aria-label={`View ${property.propertyTitle}`}>
					<img src={imagePath} alt={property.propertyTitle} loading="lazy" />
				</Link>
				<span className="sx-stay-type">
					{typeIcons[property.propertyType]}
					{property.propertyType}
				</span>
				{/* No handler (e.g. Recently Visited, whose query has no meLiked): no heart. */}
				{likePropertyHandler && (
					<button
						type="button"
						className={`sx-stay-fav${isFavorite ? ' is-on' : ''}`}
						aria-label={`${isFavorite ? 'Remove' : 'Save'} ${property.propertyTitle} ${isFavorite ? 'from' : 'to'} favorites`}
						aria-pressed={isFavorite}
						onClick={() => likePropertyHandler(user, property?._id)}
					>
						{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</button>
				)}
				<span className="sx-stay-price">
					<strong>{formatKRW(property?.pricePerNight)}</strong>
					<small> / night</small>
				</span>
			</div>
			<div className="sx-stay-content">
				<div>
					<span className="sx-stay-address">
						{property.propertyAddress}, {property.propertyLocation}
					</span>
					<h3>
						<Link href={detailHref}>{property.propertyTitle}</Link>
					</h3>
					<div className="sx-stay-specs">
						<span>
							<BedOutlinedIcon aria-hidden="true" />
							{property.propertyBeds} bed
						</span>
						<span>
							<MeetingRoomOutlinedIcon aria-hidden="true" />
							{property.propertyRooms} room
						</span>
						<span>
							<SquareFootIcon aria-hidden="true" />
							{property.propertySquare} m²
						</span>
					</div>
				</div>
				<div className="sx-stay-foot">
					<span className="sx-stay-guests">
						<GroupOutlinedIcon aria-hidden="true" />
						Up to {property.maxGuests} guests
					</span>
					<span className="sx-stay-stats">
						<span aria-label={`${property?.propertyViews} views`}>
							<VisibilityOutlinedIcon aria-hidden="true" />
							{property?.propertyViews}
						</span>
						<span aria-label={`${property?.propertyLikes} likes`}>
							<FavoriteBorderIcon aria-hidden="true" />
							{property?.propertyLikes}
						</span>
					</span>
				</div>
			</div>
		</article>
	);
};

export default PropertyCard;
