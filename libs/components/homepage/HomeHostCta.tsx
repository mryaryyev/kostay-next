import React from 'react';
import Link from 'next/link';

const HomeHostCta = () => {
	return (
		<section className="home-host-cta">
			<div className="container">
				<div className="cta-panel">
					<div>
						<h2>Have a room, a hanok or a villa to share?</h2>
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
