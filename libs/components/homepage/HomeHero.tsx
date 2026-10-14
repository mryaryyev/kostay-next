import React from 'react';
import Link from 'next/link';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

/** Trust points under the hero copy (moved here from the old trust strip). */
const trustPoints = [
	{ icon: <VerifiedIcon />, label: 'Verified Hosts' },
	{ icon: <PaymentsOutlinedIcon />, label: 'Clear Nightly Prices' },
	{ icon: <EventRepeatIcon />, label: 'Flexible Dates' },
];

const collage = [
	{ city: 'Seoul', location: 'SEOUL', src: '/img/banner/cities/SEOUL.webp' },
	{ city: 'Busan', location: 'BUSAN', src: '/img/banner/cities/BUSAN.webp' },
	{ city: 'Jeju', location: 'JEJU', src: '/img/banner/cities/JEJU.webp' },
];

/** Desktop hero copy and city collage. The search bar is rendered below it by the layout. */
const HomeHero = () => {
	return (
		<div className="home-hero-grid">
			<div className="home-hero-copy">
				<span className="home-eyebrow">Stays across Korea</span>
				<h1>
					Find a stay that feels <em>like home</em>
				</h1>
				<p>
					City apartments, family houses and seaside villas from Seoul to Jeju, plus a traditional hanok when you want one.
					Book directly with verified Hosts.
				</p>
				<ul className="home-hero-trust">
					{trustPoints.map((point) => (
						<li key={point.label}>
							<span aria-hidden="true">{point.icon}</span>
							{point.label}
						</li>
					))}
				</ul>
			</div>
			<div className="home-hero-collage">
				{collage.map((item) => (
					<figure key={item.city}>
						{/* Whole card opens /stay filtered to this city (?location= is read by parsePropertyQuery). */}
						<Link
							href={{ pathname: '/stay', query: { location: item.location } }}
							className="home-hero-city-link"
							aria-label={`See stays in ${item.city}`}
						/>
						<img src={item.src} alt="" decoding="async" />
						<figcaption>
							<PlaceIcon />
							{item.city}
						</figcaption>
					</figure>
				))}
			</div>
		</div>
	);
};

export default HomeHero;
