import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
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
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Kostay</title>
						<meta name={'title'} content={`Kostay`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Kostay</title>
						<meta name={'title'} content={`Kostay`} />
					</Head>
					<Stack id="pc-wrap" className={'is-home'}>
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
		}
	};
};

export default withLayoutMain;
