import React from 'react';

/** Desktop hero for /about; same height and breadcrumb as the other Kostay heroes. */
const AboutHero = () => {
	return (
		<section className="sx-about-hero">
			<span className="sx-about-hero-bg" aria-hidden="true" />
			<div className="container">
				<h1>About Kostay</h1>
				<p>Stays across South Korea, booked by the night and listed by the Hosts who run them.</p>
			</div>
		</section>
	);
};

export default AboutHero;
