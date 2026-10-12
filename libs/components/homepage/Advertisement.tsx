import Link from 'next/link';
import React from 'react';
import { Stack } from '@mui/material';

const Advertisement = () => {
	return (
		<section className={'home-film'}>
			<div className={'container'}>
				<div className={'film-frame'}>
					<video autoPlay muted loop playsInline preload="auto" aria-hidden="true">
						<source src="/video/ads.mov" type="video/mp4" />
					</video>
					<div className={'film-copy'}>
						<span className={'home-eyebrow'}>Kostay film</span>
						<h2>Slow mornings, from Seoul to Jeju.</h2>
						<p>Rooms with a view, Hosts who know the neighbourhood, and nights priced clearly in KRW.</p>
						<Link href={'/stay'} className={'home-btn is-glass'}>
							Explore stays
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Advertisement;
