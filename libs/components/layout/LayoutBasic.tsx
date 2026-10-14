import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Top from '../Top';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import StaysHero from '../property/StaysHero';
import HostsHero from '../agent/HostsHero';
import CommunityHero from '../community/CommunityHero';
import MyPageHero from '../mypage/MyPageHero';
import CsHero from '../cs/CsHero';
import AboutHero from '../about/AboutHero';
import HomeFooter from '../homepage/HomeFooter';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			// Pages with their own hero (or none) skip the old banner below, so only the auth case is left.
			switch (router.pathname) {
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

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
				<Stack id="site-wrap">
					<Stack id={'top'}>
						<Top />
					</Stack>

					{router.pathname === '/community' || router.pathname === '/community/detail' ? (
						<CommunityHero detail={router.pathname === '/community/detail'} />
					) : router.pathname === '/agent' ? (
						<HostsHero />
					) : router.pathname === '/stay' ? (
						<StaysHero />
					) : router.pathname === '/mypage' ? (
						<MyPageHero />
					) : router.pathname === '/help' ? (
						<CsHero />
					) : router.pathname === '/about' ? (
						<AboutHero />
					) : router.pathname === '/account/join' ||
					  router.pathname === '/agent/detail' ||
					  router.pathname === '/member' ? null : (
						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								backgroundImage: `url(${memoizedValues.bgImage})`,
								backgroundSize: 'cover',
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
							</Stack>
						</Stack>
					)}

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

export default withLayoutBasic;
