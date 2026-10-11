import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/** Desktop hero for /mypage; same height and breadcrumb as the Hosts/Community heroes. */
const MyPageHero = () => {
	return (
		<section className="sx-mypage-hero">
			<span className="sx-mypage-hero-bg" aria-hidden="true" />
			<div className="container">
				<nav className="sx-mypage-crumbs" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<ChevronRightIcon aria-hidden="true" />
					<span aria-current="page">My Page</span>
				</nav>
				<h1>My Page</h1>
				<p>Manage your Kostay traveler account, saved stays, bookings and community activity.</p>
			</div>
		</section>
	);
};

export default MyPageHero;
