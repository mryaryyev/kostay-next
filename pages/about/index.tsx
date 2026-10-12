import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PropertyLocation, PropertyType } from '../../libs/enums/property.enum';

const stats = [
	{ value: String(Object.values(PropertyLocation).length), label: 'Destinations' },
	{ value: String(Object.values(PropertyType).length), label: 'Stay types' },
	{ value: 'KRW', label: 'Nightly prices' },
	{ value: '24/7', label: 'Customer care' },
];

const guestSteps = [
	{
		icon: <SearchOutlinedIcon />,
		title: 'Find a stay',
		text: 'Filter by destination, stay type, guests, rooms, beds and nightly price.',
	},
	{
		icon: <EventAvailableOutlinedIcon />,
		title: 'Pick your dates',
		text: 'Choose check-in and check-out; booked nights are blocked, so dates never overlap.',
	},
	{
		icon: <PaymentsOutlinedIcon />,
		title: 'Book and pay',
		text: 'See the total in KRW before you confirm, then find the booking in My Page.',
	},
];

const hostSteps = [
	{
		icon: <AddHomeOutlinedIcon />,
		title: 'List your stay',
		text: 'Add photos, a description, a nightly price in KRW and the maximum number of guests.',
	},
	{
		icon: <EditCalendarOutlinedIcon />,
		title: 'Manage reservations',
		text: 'Edit listings, follow incoming bookings and track your earnings from My Page.',
	},
	{
		icon: <PauseCircleOutlineIcon />,
		title: 'Pause any time',
		text: "Deactivate a listing to hide it from guests and reactivate it when you're ready.",
	},
];

const formatCity = (location: string) => location.charAt(0) + location.slice(1).toLowerCase();

const About: NextPage = () => {
	return (
		<div className={'about-page'}>
			<div className={'container'}>
				{/* Intro */}
				<section className={'about-intro'}>
					<div className={'about-intro-text'}>
						<span className={'about-eyebrow'}>Our mission</span>
						<h2>Finding a stay in Korea should be simple.</h2>
						<p>
							Kostay brings together apartments, villas, houses and traditional hanoks across South Korea, from Seoul to
							Jeju. Every listing shows its nightly price in Korean won and how many guests it fits, so you know what you
							are booking before you book it.
						</p>
					</div>
					<ul className={'about-stats'}>
						{stats.map((stat) => (
							<li key={stat.label}>
								<strong>{stat.value}</strong>
								<span>{stat.label}</span>
							</li>
						))}
					</ul>
				</section>

				{/* How it works */}
				<section className={'about-how'} id="how-it-works">
					<div className={'about-section-head'}>
						<span className={'about-eyebrow'}>How it works</span>
						<h2>One platform for guests and Hosts</h2>
					</div>
					<div className={'about-how-grid'}>
						{[
							{ title: 'For guests', steps: guestSteps, cta: { label: 'Browse stays', href: '/stay' } },
							{ title: 'For Hosts', steps: hostSteps, cta: { label: 'Meet our Hosts', href: '/agent' } },
						].map((group) => (
							<article className={'about-how-card'} key={group.title}>
								<h3>{group.title}</h3>
								<ol>
									{group.steps.map((step) => (
										<li key={step.title}>
											<span className={'about-step-icon'}>{step.icon}</span>
											<div>
												<strong>{step.title}</strong>
												<p>{step.text}</p>
											</div>
										</li>
									))}
								</ol>
								<Link href={group.cta.href} className={'about-link'}>
									{group.cta.label}
									<ArrowForwardIcon />
								</Link>
							</article>
						))}
					</div>
				</section>

				{/* Destinations */}
				<section className={'about-destinations'}>
					<div className={'about-section-head'}>
						<span className={'about-eyebrow'}>Destinations</span>
						<h2>Eight cities, one search</h2>
					</div>
					<div className={'about-city-grid'}>
						{Object.values(PropertyLocation).map((location) => (
							<Link href={`/stay?location=${location}`} className={'about-city'} key={location}>
								<img src={`/img/banner/cities/${location}.webp`} alt="" loading={'lazy'} />
								<span>{formatCity(location)}</span>
							</Link>
						))}
					</div>
				</section>

				{/* Help */}
				<section className={'about-help'}>
					<div>
						<h2>Need help? Talk to our team.</h2>
						<p>Read the FAQ, send a 1:1 inquiry or call customer care any time.</p>
					</div>
					<div className={'about-help-actions'}>
						<Link href={'/help'} className={'about-btn is-primary'}>
							Help Center
							<ArrowForwardIcon />
						</Link>
						<a href={'tel:+821097988269'} className={'about-btn'}>
							+82 10 9798 8269
						</a>
					</div>
				</section>
			</div>
		</div>
	);
};

export default withLayoutBasic(About);
