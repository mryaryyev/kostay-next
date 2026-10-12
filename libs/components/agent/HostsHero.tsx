import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../../apollo/user/query';

/** Desktop hero for /agent (Stitch: Kostay - Hosts Directory). */
const HostsHero = () => {
	// Live count of active hosts (same query the Hosts list uses), independent of the page's search.
	const { data } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: {} } },
	});
	const total: number | undefined = data ? data.getAgents?.metaCounter?.[0]?.total ?? 0 : undefined;

	return (
		<section className="sx-hosts-hero">
			<span className="sx-hosts-hero-bg" aria-hidden="true" />
			<div className="container">
				<div className="sx-hosts-hero-row">
					<div>
						<h1>Hosts</h1>
						<p>
							Meet verified local hosts sharing city apartments, family homes, seaside villas and traditional hanoks across
							South Korea.
						</p>
						<ul className="sx-hosts-hero-metrics">
							<li>
								<VerifiedIcon aria-hidden="true" />
								{total === undefined ? 'Verified Hosts' : `${total} Verified ${total === 1 ? 'Host' : 'Hosts'}`}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HostsHero;
