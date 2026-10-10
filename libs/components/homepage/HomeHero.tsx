import React from 'react';
import PlaceIcon from '@mui/icons-material/Place';

const collage = [
	{ city: 'Seoul', src: '/img/banner/cities/SEOUL.webp' },
	{ city: 'Busan', src: '/img/banner/cities/BUSAN.webp' },
	{ city: 'Jeju', src: '/img/banner/cities/JEJU.webp' },
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
					Hanok rooms, sea-view apartments and quiet villas from Seoul to Jeju. Book directly with verified Hosts.
				</p>
			</div>
			<div className="home-hero-collage" aria-hidden="true">
				{collage.map((item) => (
					<figure key={item.city}>
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
