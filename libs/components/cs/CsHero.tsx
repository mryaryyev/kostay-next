import React from 'react';

/** Desktop hero for /cs; same height and breadcrumb as the other Kostay heroes. */
const CsHero = () => {
	return (
		<section className="sx-cs-hero">
			<span className="sx-cs-hero-bg" aria-hidden="true" />
			<div className="container">
				<h1>Help Center</h1>
				<p>News from the Kostay team and answers to the questions guests and hosts ask most.</p>
			</div>
		</section>
	);
};

export default CsHero;
