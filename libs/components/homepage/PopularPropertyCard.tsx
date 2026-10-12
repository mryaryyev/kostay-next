import { formatKRW } from '../../utils';
import HomeStayCard from './HomeStayCard';
import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Property } from '../../types/property/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface PopularPropertyCardProps {
	property: Property;
	likePropertyHandler?: any;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const pushDetailHandler = async (propertyId: string) => {
		console.log('ID:', propertyId);
		await router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	return <HomeStayCard property={property} likePropertyHandler={likePropertyHandler} variant={'popular'} />;
};

export default PopularPropertyCard;
