import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/** Desktop hero for /community (Stitch: Kostay - Community). */
const CommunityHero = () => {
	return (
		<section className="sx-community-hero">
			<span className="sx-community-hero-bg" aria-hidden="true" />
			<div className="container">
				<nav className="sx-community-crumbs" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<ChevronRightIcon aria-hidden="true" />
					<span aria-current="page">Community</span>
				</nav>
				<div className="sx-community-hero-row">
					<div>
						<h1>Community</h1>
						<p>
							Connect with fellow travelers and verified local hosts sharing candid travel moments, cultural insights, local
							tips, and humor across South Korea.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CommunityHero;
