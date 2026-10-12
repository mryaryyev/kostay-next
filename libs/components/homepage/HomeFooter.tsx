import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KostayLogo from '../common/KostayLogo';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';

interface FooterLink {
	label: string;
	href: string;
}

const columns: { title: string; links: FooterLink[] }[] = [
	{
		title: 'Stay types',
		links: [
			{ label: 'Apartments', href: `/stay?type=${PropertyType.APARTMENT}` },
			{ label: 'Villas', href: `/stay?type=${PropertyType.VILLA}` },
			{ label: 'Houses', href: `/stay?type=${PropertyType.HOUSE}` },
			{ label: 'Hanoks', href: `/stay?type=${PropertyType.HANOK}` },
		],
	},
	{
		title: 'Destinations',
		// All eight backend locations, shown in two columns of four.
		links: Object.values(PropertyLocation).map((location) => ({
			label: location.charAt(0) + location.slice(1).toLowerCase(),
			href: `/stay?location=${location}`,
		})),
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', href: '/about' },
			{ label: 'Hosts', href: '/agent' },
			{ label: 'Community', href: '/community' },
			{ label: 'Help Center', href: '/help' },
		],
	},
];

/** Site-wide footer, rendered by LayoutHome, LayoutBasic and LayoutFull. */
const HomeFooter = () => {
	return (
		<footer className={'home-footer'}>
			<div className={'home-footer-inner'}>
				<div className={'home-footer-grid'}>
					<div className={'home-footer-brand'}>
						<Link href={'/'} aria-label={'Kostay home'}>
							<KostayLogo className={'logo'} />
						</Link>
						<div className={'home-footer-care'}>
							<span>24/7 Customer Care</span>
							<a href={'tel:+821097988269'}>+82 10 9798 8269</a>
						</div>
						<div className={'home-footer-chips'}>
							<Link href={'/help?tab=inquiry'} aria-label={'Send an inquiry'} title={'Send an inquiry'}>
								<SupportAgentOutlinedIcon />
							</Link>
							<Link href={'/help'} aria-label={'Help Center'} title={'Help Center'}>
								<HelpOutlineIcon />
							</Link>
						</div>
					</div>

					{columns.map((column) => (
						<div className={`home-footer-col${column.links.length > 5 ? ' is-split' : ''}`} key={column.title}>
							<h4>{column.title}</h4>
							<ul>
								{column.links.map((link) => (
									<li key={link.label}>
										<Link href={link.href}>{link.label}</Link>
									</li>
								))}
							</ul>
						</div>
					))}

					<div className={'home-footer-news'}>
						<h4>Join Kostay</h4>
						<p>Create an account to save stays and join the community.</p>
						<Link className={'home-footer-register'} href={'/account/join?mode=signup'}>
							Register
						</Link>
					</div>
				</div>

				<div className={'home-footer-bottom'}>
					<p>© Kostay - All rights reserved. Kostay {moment().year()}</p>
					<div>
						<Link href={'/help'}>Privacy</Link>
						<Link href={'/help'}>Terms</Link>
						<Link href={'/stay'}>Sitemap</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default HomeFooter;
