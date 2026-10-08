import React from 'react';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

const items = [
	{
		icon: <VerifiedUserOutlinedIcon />,
		title: 'Verified Hosts',
		text: 'Every Host is reviewed before their first listing.',
	},
	{
		icon: <PaymentsOutlinedIcon />,
		title: 'Clear nightly prices',
		text: 'Prices are shown in KRW per night, with nothing added at checkout.',
	},
	{
		icon: <EventAvailableOutlinedIcon />,
		title: 'Flexible dates',
		text: 'Pick your check-in and check-out days and see who can host you.',
	},
];

const HomeTrustStrip = () => {
	return (
		<section className="home-trust-strip">
			<div className="container">
				{items.map((item) => (
					<div className="trust-item" key={item.title}>
						<span className="trust-icon" aria-hidden="true">
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
