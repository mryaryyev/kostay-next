import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

const items = [
	{
		icon: <VerifiedIcon />,
		tone: 'is-accent',
		title: 'Verified Hosts',
		text: 'Every Host and residence is visited and approved before their first listing.',
	},
	{
		icon: <PaymentsOutlinedIcon />,
		tone: 'is-navy',
		title: 'Clear Nightly Prices',
		text: 'Prices are shown in KRW per night, with nothing unexpected added at checkout.',
	},
	{
		icon: <EventRepeatIcon />,
		tone: 'is-neutral',
		title: 'Flexible Dates',
		text: 'Pick your dates and explore hosts with lenient cancellation terms across South Korea.',
	},
];

const HomeTrustStrip = () => {
	return (
		<section className="home-trust-strip">
			<div className="container">
				{items.map((item) => (
					<div className="trust-item" key={item.title}>
						<span className={`trust-icon ${item.tone}`} aria-hidden="true">
							{item.icon}
						</span>
						<div>
							<strong>{item.title}</strong>
							<p>{item.text}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default HomeTrustStrip;
