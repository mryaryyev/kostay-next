import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';

/** Desktop hero for /property (Stitch: Kostay - Find A Stay). */
const StaysHero = () => {
	// Live count of ACTIVE stays (getProperties only returns ACTIVE); independent of the page's filters.
	const { data } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: {} } },
	});
	const total: number | undefined = data ? data.getProperties?.metaCounter?.[0]?.total ?? 0 : undefined;

	const metrics = [
		{
			icon: <VerifiedIcon />,
			label: total === undefined ? 'Verified Stays' : `${total} Verified ${total === 1 ? 'Stay' : 'Stays'}`,
		},
		{ icon: <ShieldOutlinedIcon />, label: 'Zero Guest Booking Fee' },
	];

	return (
		<section className="sx-stays-hero">
			<span className="sx-stays-hero-bg" aria-hidden="true" />
			<span className="sx-stays-hero-glow" aria-hidden="true" />
			<div className="container">
				<h1>Find A Stay</h1>
				<p>
					City apartments, family houses, seaside villas and traditional hanoks across Korea. Pick your dates and book in a
					few steps.
				</p>
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
