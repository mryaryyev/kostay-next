import React, { useEffect } from 'react';
import Head from 'next/head';
import Top from '../Top';
import HomeFooter from '../homepage/HomeFooter';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import HomeHero from '../homepage/HomeHero';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		return (
			<>
				<Head>
					<title>Kostay</title>
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name={'title'} content={`Kostay`} />
				</Head>
				<Stack id="site-wrap" className={'is-home'}>
					<Stack id={'top'}>
						<Top />
					</Stack>

					<Stack className={'header-main home-hero'}>
						<Stack className={'container'}>
							<HomeHero />
							<HeaderFilter />
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<Chat />

					<Stack id={'footer'}>
						<HomeFooter />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;
