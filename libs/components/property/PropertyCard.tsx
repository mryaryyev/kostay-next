import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatKRW } from '../../utils';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
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
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	/** 'stays' renders the Stitch "Find A Stay" card used on /property. */
	variant?: 'default' | 'stays';
}

const typeIcons: Record<PropertyType, JSX.Element> = {
	[PropertyType.APARTMENT]: <ApartmentIcon />,
	[PropertyType.VILLA]: <VillaOutlinedIcon />,
	[PropertyType.HOUSE]: <HomeOutlinedIcon />,
	[PropertyType.HANOK]: <TempleBuddhistOutlinedIcon />,
};

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited, variant = 'default' } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = property?.propertyImages[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
		: '/img/banner/header1.svg';

	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
	} else if (variant === 'stays') {
		const detailHref = { pathname: '/property/detail', query: { id: property?._id } };
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
					<button
						type="button"
						className={`sx-stay-fav${isFavorite ? ' is-on' : ''}`}
						aria-label={`${isFavorite ? 'Remove' : 'Save'} ${property.propertyTitle} ${isFavorite ? 'from' : 'to'} favorites`}
						aria-pressed={isFavorite}
						onClick={() => likePropertyHandler(user, property?._id)}
					>
						{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</button>
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
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: property?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{property && property?.propertyRank > topPropertyRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>{formatKRW(property?.pricePerNight)} / night</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/property/detail',
									query: { id: property?._id },
								}}
							>
								<Typography>{property.propertyTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{property.propertyAddress}, {property.propertyLocation}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/bed.svg" alt="" /> <Typography>{property.propertyBeds} bed</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/room.svg" alt="" /> <Typography>{property.propertyRooms} room</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/expand.svg" alt="" /> <Typography>{property.propertySquare} m2</Typography>
						</Stack>
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>
								Up to {property.maxGuests} guests
							</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{property?.propertyViews}</Typography>
								<IconButton color={'default'} onClick={() => likePropertyHandler(user, property?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : property?.meLiked && property?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{property?.propertyLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
