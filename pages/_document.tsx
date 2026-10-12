import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'kostay, stays, accommodation, korea, nightly rental'} />
				<meta
					name={'description'}
					content={
						'Find stays across South Korea with nightly prices in KRW on Kostay. | ' +
						'Находите жильё по всей Южной Корее с ценами за ночь в вонах на Kostay. | ' +
						'Kostay에서 대한민국 전역의 숙소를 1박 원화 요금으로 찾아보세요.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
