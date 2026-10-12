import React from 'react';

/** Desktop hero for /mypage; same height and breadcrumb as the Hosts/Community heroes. */
const MyPageHero = () => {
	return (
		<section className="sx-mypage-hero">
			<span className="sx-mypage-hero-bg" aria-hidden="true" />
			<div className="container">
				<h1>My Page</h1>
				<p>Manage your Kostay account, saved stays, bookings and community activity.</p>
			</div>
		</section>
	);
};

export default MyPageHero;
