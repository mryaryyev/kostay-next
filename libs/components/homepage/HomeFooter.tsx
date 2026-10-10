import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LanguageIcon from '@mui/icons-material/Language';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import KostayLogo from '../common/KostayLogo';

interface FooterLink {
	label: string;
	href?: string;
}

const columns: { title: string; links: FooterLink[] }[] = [
	{
		title: 'Popular Search',
		links: [
			{ label: 'Browse stays', href: '/property' },
			{ label: 'All stays', href: '/property' },
			{ label: 'Hanok escapes' },
			{ label: 'Ocean villas' },
		],
	},
	{
		title: 'Quick Links',
		links: [
			{ label: 'Terms of Use' },
			{ label: 'Privacy Policy' },
			{ label: 'Pricing Plans' },
			{ label: 'Our Services' },
			{ label: 'Contact Support', href: '/cs' },
			{ label: 'FAQs', href: '/cs' },
		],
	},
	{
		title: 'Destinations',
		links: [{ label: 'Seoul' }, { label: 'Gyeonggido' }, { label: 'Busan' }, { label: 'Jeju' }, { label: 'Gangwon' }],
	},
];

/** Desktop footer for the homepage only (Stitch: Homepage Desktop). Other pages keep Footer.tsx. */
const HomeFooter = () => {
	return (
		<footer className={'home-footer'}>
			<div className={'home-footer-inner'}>
				<div className={'home-footer-grid'}>
					<div className={'home-footer-brand'}>
						<Link href={'/'} aria-label={'Kostay home'}>
							<KostayLogo className={'logo'} />
						</Link>
						<p>
							Discover authentic Korean hanoks, seaside escapes, and urban modern sanctuaries engineered with serene
							hospitalities.
						</p>
						<div className={'home-footer-care'}>
							<span>24/7 Customer Care</span>
							<a href={'tel:+821048672909'}>+82 10 4867 2909</a>
						</div>
						<div className={'home-footer-chips'}>
							<Link href={'/cs'} aria-label={'Chat with support'}>
								<ChatBubbleOutlineIcon />
							</Link>
							<Link href={'/'} aria-label={'Website'}>
								<LanguageIcon />
							</Link>
							<a href={'mailto:care@kostay.kr'} aria-label={'Email'}>
								<MailOutlineIcon />
							</a>
						</div>
					</div>

					{columns.map((column) => (
						<div className={'home-footer-col'} key={column.title}>
							<h4>{column.title}</h4>
							<ul>
								{column.links.map((link) => (
									<li key={link.label}>
										{link.href ? <Link href={link.href}>{link.label}</Link> : <span>{link.label}</span>}
									</li>
								))}
							</ul>
						</div>
					))}

					<div className={'home-footer-news'}>
						<h4>Keep Yourself Up To Date</h4>
						<p>Receive curated seasonal recommendations and boutique stay releases across Korea.</p>
						<form onSubmit={(event) => event.preventDefault()}>
							<div className={'home-footer-input'}>
								<input type={'email'} placeholder={'Your email address'} aria-label={'Your email address'} />
								<button type={'submit'}>Subscribe</button>
							</div>
							<span>Instant unsubscribe anytime</span>
						</form>
					</div>
				</div>

				<div className={'home-footer-bottom'}>
					<p>© Kostay - All rights reserved. Kostay {moment().year()}</p>
					<div>
						<span>Privacy</span>
						<span>Terms</span>
						<span>Sitemap</span>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default HomeFooter;
