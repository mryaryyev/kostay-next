import React from 'react';
import Link from 'next/link';

const HomeHostCta = () => {
	return (
		<section className="home-host-cta">
			<div className="container">
				<div className="cta-panel">
					<span className="cta-glow" aria-hidden="true" />
					<div className="cta-copy">
						<h2>Have an apartment, a house or a villa to share?</h2>
						<p>Become a Host and welcome guests from all over the world.</p>
					</div>
					<Link href="/account/join" className="home-btn is-accent">
						Become a Host
					</Link>
				</div>
			</div>
		</section>
	);
};

export default HomeHostCta;
