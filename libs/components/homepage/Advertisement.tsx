import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

/**
 * Home film: the video is not downloaded on page load (preload="none" + poster).
 * It plays only while the section is on screen and pauses when it leaves.
 * Users with "reduce motion" turned on see only the poster.
 */
const Advertisement = () => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) video.play().catch(() => {});
				else video.pause();
			},
			{ threshold: 0.25 },
		);
		observer.observe(video);
		return () => observer.disconnect();
	}, []);

	return (
		<section className={'home-film'}>
			<div className={'container'}>
				<div className={'film-frame'}>
					<video ref={videoRef} muted loop playsInline preload="none" poster="/video/ads-poster.webp" aria-hidden="true">
						<source src="/video/ads.mp4" type="video/mp4" />
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
