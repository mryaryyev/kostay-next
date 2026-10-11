import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import SearchIcon from '@mui/icons-material/Search';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const tabs = [
	{ key: 'notice', label: 'Notice', icon: <CampaignOutlinedIcon /> },
	{ key: 'faq', label: 'FAQ', icon: <HelpOutlineRoundedIcon /> },
	{ key: 'inquiry', label: 'Inquiry', icon: <SupportAgentOutlinedIcon /> },
];

/** Help Center: Notice and FAQ content is written by the admin (CS management) and read with getNotices. */
const CS: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const tab = router.query.tab === 'faq' || router.query.tab === 'inquiry' ? router.query.tab : 'notice';
	const [searchInput, setSearchInput] = useState<string>('');
	const [text, setText] = useState<string>('');

	/** LIFECYCLES **/
	useEffect(() => {
		// A new tab starts with an empty search.
		setSearchInput('');
		setText('');
	}, [tab]);

	/** HANDLERS **/
	const changeTabHandler = (value: string) => {
		router.push({ pathname: '/cs', query: { tab: value } }, undefined, { scroll: false });
	};

	if (device === 'mobile') {
		return <h1>CS PAGE MOBILE</h1>;
	} else {
		return (
			<div id="cs-page">
				<div className="container">
					<div className="sx-cs-layout">
						<main className="sx-cs-main">
							<div className="sx-cs-toolbar">
								<div className="sx-cs-tabs" role="tablist" aria-label="Help Center sections">
									{tabs.map((item) => (
										<button
											type="button"
											role="tab"
											key={item.key}
											aria-selected={tab === item.key}
											className={tab === item.key ? 'active' : ''}
											onClick={() => changeTabHandler(item.key)}
										>
											{item.icon}
											{item.label}
										</button>
									))}
								</div>
								{tab !== 'inquiry' && (
									<label className="sx-cs-search">
										<SearchIcon aria-hidden="true" />
										<input
											type="text"
											value={searchInput}
											placeholder={tab === 'faq' ? 'Search questions' : 'Search notices'}
											aria-label={tab === 'faq' ? 'Search questions' : 'Search notices'}
											onChange={(e) => setSearchInput(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && setText(searchInput.trim())}
										/>
										{searchInput && (
											<button
												type="button"
												aria-label="Clear search"
												onClick={() => {
													setSearchInput('');
													setText('');
												}}
											>
												<CancelRoundedIcon />
											</button>
										)}
									</label>
								)}
							</div>

							{tab === 'notice' && <Notice text={text} />}
							{tab === 'faq' && <Faq text={text} />}
							{tab === 'inquiry' && <Inquiry />}
						</main>

						<aside className="sx-cs-aside">
							<div className="sx-cs-help">
								<h3>Still need help?</h3>
								<p>Most answers about your trip live in your account.</p>
								<Link href={{ pathname: '/mypage', query: { category: 'myBookings' } }}>
									<LuggageOutlinedIcon aria-hidden="true" />
									<span>
										<strong>My Bookings</strong>
										<small>Dates, payments and cancellations</small>
									</span>
								</Link>
								<Link href="/property">
									<HomeWorkOutlinedIcon aria-hidden="true" />
									<span>
										<strong>Message a host</strong>
										<small>Use the contact box on any stay page</small>
									</span>
								</Link>
								<Link href="/community">
									<ForumOutlinedIcon aria-hidden="true" />
									<span>
										<strong>Community</strong>
										<small>Ask other travelers and hosts</small>
									</span>
								</Link>
							</div>
							<div className="sx-cs-times">
								<span>House times</span>
								<p>
									Check-in from <strong>13:00</strong>
									<br />
									Check-out by <strong>11:00</strong>
								</p>
							</div>
						</aside>
					</div>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(CS);
