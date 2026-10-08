import { formatKRW } from '../../utils';
import React, { useState } from 'react';
import Link from 'next/link';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath = property.propertyImages?.[0];
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const imageSrc = imagePath ? `${REACT_APP_API_URL}/${imagePath}` : '';
	const isFavorite = Boolean(property.meLiked?.[0]?.myFavorite);
	const detailHref = { pathname: '/property/detail', query: { id: property._id } };

	/** HANDLERS **/
	const pushDetailHandler = async (propertyId: string) => {
		console.log('ID:', propertyId);
		await router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={property._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages[0]})` }}
					onClick={() => pushDetailHandler(property._id)}
				>
					<div>{formatKRW(property.pricePerNight)} / night</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(property._id)}>
						{property.propertyTitle}
					</strong>
					<p className={'desc'}>{property.propertyDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{property.propertyBeds} bed</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{property.propertyRooms} rooms</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{property.propertySquare} m2</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>Up to {property.maxGuests} guests</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.propertyViews}</Typography>
							<IconButton color={'default'} onClick={() => likePropertyHandler(user, property?._id)}>
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.propertyLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<article className="boutique-stay-card">
				<div className="stay-media">
					<Link href={detailHref} className="stay-image-link" aria-label={`View ${property.propertyTitle}`}>
						{imageSrc && failedImage !== imageSrc ? (
							<img src={imageSrc} alt={property.propertyTitle} loading="lazy" decoding="async" onError={() => setFailedImage(imageSrc)} />
						) : (
							<div className="stay-image-fallback"><HomeOutlinedIcon aria-hidden="true" /><span>Photo unavailable</span></div>
						)}
					</Link>
					<span className="stay-type">{property.propertyType.toLowerCase()}</span>
					<IconButton className="stay-favorite" aria-label={`${isFavorite ? 'Remove' : 'Save'} ${property.propertyTitle} ${isFavorite ? 'from' : 'to'} favorites`}
						aria-pressed={isFavorite} onClick={() => likePropertyHandler(user, property._id)}>
						{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>
				</div>
				<div className="stay-content">
					<p className="stay-location"><PlaceOutlinedIcon aria-hidden="true" />{property.propertyLocation.toLowerCase()}</p>
					<h3 className="stay-title"><Link href={detailHref} title={property.propertyTitle}>{property.propertyTitle}</Link></h3>
					{property.propertyDesc?.trim() && <p className="stay-description" title={property.propertyDesc}>{property.propertyDesc}</p>}
					<div className="stay-amenities">
						<span><img src="/img/icons/bed.svg" alt="" />{property.propertyBeds} {property.propertyBeds === 1 ? 'bed' : 'beds'}</span>
						<span><img src="/img/icons/room.svg" alt="" />{property.propertyRooms} {property.propertyRooms === 1 ? 'room' : 'rooms'}</span>
						<span><img src="/img/icons/expand.svg" alt="" />{property.propertySquare} m²</span>
					</div>
					<div className="stay-footer">
						<div className="stay-price"><strong>{formatKRW(property.pricePerNight)}</strong><span>/ night</span></div>
						<span className="stay-capacity">Up to {property.maxGuests} {property.maxGuests === 1 ? 'guest' : 'guests'}</span>
					</div>
					<div className="stay-stats">
						<span><RemoveRedEyeIcon aria-hidden="true" />{property.propertyViews} views</span>
						<span><FavoriteBorderIcon aria-hidden="true" />{property.propertyLikes} likes</span>
					</div>
				</div>
			</article>
		);
	}
};

export default TrendPropertyCard;
