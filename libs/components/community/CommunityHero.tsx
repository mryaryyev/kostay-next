import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/** Desktop hero for /community (Stitch: Kostay - Community). */
const CommunityHero = ({ detail = false }: { detail?: boolean }) => {
	return (
		<section className="sx-community-hero">
			<span className="sx-community-hero-bg" aria-hidden="true" />
			<div className="container">
				{detail && (
					<nav className="sx-community-crumbs" aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<ChevronRightIcon aria-hidden="true" />
						<Link href="/community">Community</Link>
						<ChevronRightIcon aria-hidden="true" />
						<span aria-current="page">Article</span>
					</nav>
				)}
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
