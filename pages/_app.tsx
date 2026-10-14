import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pages/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	const shareTitle = 'Kostay - Stays in Korea';
	const shareDescription = 'Find apartments, villas and hanoks across Korea. Explore Stays and book your next trip with Kostay.';
	const shareImage = 'https://www.kostay.kr/img/social/kostay-share-v1.png';
	const localePath = router.locale && router.locale !== router.defaultLocale ? `/${router.locale}` : '';
	const shareUrl = `https://www.kostay.kr${localePath}${router.asPath.split('#')[0]}`;
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<Head>
				<meta property="og:type" content="website" key="og:type" />
				<meta property="og:site_name" content="Kostay" key="og:site_name" />
				<meta property="og:title" content={shareTitle} key="og:title" />
				<meta property="og:description" content={shareDescription} key="og:description" />
				<meta property="og:url" content={shareUrl} key="og:url" />
				<meta property="og:image" content={shareImage} key="og:image" />
				<meta property="og:image:type" content="image/png" key="og:image:type" />
				<meta property="og:image:width" content="1200" key="og:image:width" />
				<meta property="og:image:height" content="630" key="og:image:height" />
				<meta property="og:image:alt" content="Kostay - Stays in Korea" key="og:image:alt" />
				<meta name="twitter:card" content="summary_large_image" key="twitter:card" />
				<meta name="twitter:title" content={shareTitle} key="twitter:title" />
				<meta name="twitter:description" content={shareDescription} key="twitter:description" />
				<meta name="twitter:image" content={shareImage} key="twitter:image" />
				<meta name="twitter:image:alt" content="Kostay - Stays in Korea" key="twitter:image:alt" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
