import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

// Stitch sample metrics — replace with real figures (or remove) before launch.
const metrics = [
	{ icon: <VerifiedIcon />, label: '1,420+ Verified Stays' },
	{ icon: <ShieldOutlinedIcon />, label: 'Zero Guest Booking Fee' },
];

/** Desktop hero for /property (Stitch: Kostay - Find A Stay). */
const StaysHero = () => {
	return (
		<section className="sx-stays-hero">
			<span className="sx-stays-hero-bg" aria-hidden="true" />
			<span className="sx-stays-hero-glow" aria-hidden="true" />
			<div className="container">
				<h1>Find A Stay</h1>
				<p>We are glad to see you again! Explore tranquil retreats, heritage hanoks, and contemporary cityscapes.</p>
				<ul className="sx-stays-hero-metrics">
					{metrics.map((metric) => (
						<li key={metric.label}>
							{metric.icon}
							{metric.label}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default StaysHero;
