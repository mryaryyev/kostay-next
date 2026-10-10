import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedIcon from '@mui/icons-material/Verified';

/** Desktop hero for /agent (Stitch: Kostay - Hosts Directory). */
const HostsHero = () => {
	return (
		<section className="sx-hosts-hero">
			<span className="sx-hosts-hero-bg" aria-hidden="true" />
			<div className="container">
				<nav className="sx-hosts-crumbs" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<ChevronRightIcon aria-hidden="true" />
					<span aria-current="page">Hosts</span>
				</nav>
				<div className="sx-hosts-hero-row">
					<div>
						<h1>Hosts</h1>
						<p>
							Meet our verified local hosts sharing authentic architectural sanctuaries, preserved hanoks, and coastal escapes
							across South Korea.
						</p>
					</div>
					<div className="sx-hosts-hero-badge">
						<VerifiedIcon aria-hidden="true" />
						<div>
							<small>Host Community</small>
							<strong>100% Identity Verified</strong>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HostsHero;
