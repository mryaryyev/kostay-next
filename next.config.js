/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Docker: build a minimal server with only the files needed at runtime
	output: 'standalone',
	// Old Nestar-style URLs keep working after the rename to /stay.
	async redirects() {
		return [
			{ source: '/property', destination: '/stay', permanent: false },
			{ source: '/property/detail', destination: '/stay/detail', permanent: false },
			{ source: '/stays', destination: '/stay', permanent: false },
			{ source: '/stays/detail', destination: '/stay/detail', permanent: false },
			{ source: '/_admin/properties', destination: '/_admin/stays', permanent: false },
			{ source: '/agent', destination: '/host', permanent: false },
			{ source: '/agent/detail', destination: '/host/detail', permanent: false },
		];
	},
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
