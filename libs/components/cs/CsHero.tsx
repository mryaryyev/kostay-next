import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/** Desktop hero for /cs; same height and breadcrumb as the other Kostay heroes. */
const CsHero = () => {
	return (
		<section className="sx-cs-hero">
			<span className="sx-cs-hero-bg" aria-hidden="true" />
			<div className="container">
				<nav className="sx-cs-crumbs" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<ChevronRightIcon aria-hidden="true" />
					<span aria-current="page">Help Center</span>
				</nav>
				<h1>Help Center</h1>
				<p>News from the Kostay team and answers to the questions guests and hosts ask most.</p>
			</div>
		</section>
	);
};

export default CsHero;
