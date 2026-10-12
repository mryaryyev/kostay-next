import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';

const About: NextPage = () => {
	return (
		<Stack className={'about-page'}>
			<Stack className={'intro'}>
				<Stack className={'container'}>
					<Stack className={'left'}>
						<strong>We're on a Mission to Make Finding a Stay in Korea Simple.</strong>
					</Stack>
					<Stack className={'right'}>
						<p>
							Kostay brings together stays across South Korea, from city apartments in Seoul to houses on Jeju. Every listing
							shows its nightly price in Korean won and how many guests it fits.
							<br />
							<br />
							Hosts list and manage their own stays, and guests can search by location, stay type, rooms, beds, number of
							guests and nightly price.
						</p>
						<Stack className={'boxes'}>
							<div className={'box'}>
								<div>
									<img src="/img/icons/garden.svg" alt="" />
								</div>
								<span>Stays across Korea</span>
								<p>Apartments, villas and houses in nine regions.</p>
							</div>
							<div className={'box'}>
								<div>
									<img src="/img/icons/securePayment.svg" alt="" />
								</div>
								<span>Clear Nightly Prices</span>
								<p>Every price is shown per night in KRW.</p>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'statistics'}>
				<Stack className={'container'}>
					<Stack className={'banner'}>
						<img src="/img/banner/header1.svg" alt="" />
					</Stack>
					<Stack className={'info'}>
						<Box component={'div'}>
							<strong>9</strong>
							<p>Regions</p>
						</Box>
						<Box component={'div'}>
							<strong>3</strong>
							<p>Stay types</p>
						</Box>
						<Box component={'div'}>
							<strong>KRW</strong>
							<p>Nightly prices</p>
						</Box>
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'agents'}>
				<Stack className={'container'}>
					<span className={'title'}>Our Hosts</span>
					<p className={'desc'}>Meet the hosts who list stays on Kostay.</p>
					<Stack className={'wrap'}>
						{/*{[1, 2, 3, 4, 5].map(() => {*/}
						{/*	return <AgentCard />;*/}
						{/*})}*/}
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'options'}>
				<img src="/img/banner/aboutBanner.svg" alt="" className={'about-banner'} />
				<Stack className={'container'}>
					<strong>Hosting on Kostay</strong>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/security.svg" alt="" />
						</div>
						<div className={'text-box'}>
							<span>List your stay</span>
							<p>Add photos, a description, a nightly price in KRW and the maximum number of guests.</p>
						</div>
					</Stack>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/keywording.svg" alt="" />
						</div>
						<div className={'text_-box'}>
							<span>Keep it up to date</span>
							<p>Edit your active listings at any time from My Stays.</p>
						</div>
					</Stack>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/investment.svg" alt="" />
						</div>
						<div className={'text-box'}>
							<span>Pause when you need to</span>
							<p>Deactivate a listing to hide it from guests, and reactivate it when you're ready.</p>
						</div>
					</Stack>
					<Stack className={'btn'}>
						Learn More
						<img src="/img/icons/rightup.svg" alt="" />
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'help'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'left'}>
						<strong>Need help? Talk to our team.</strong>
						<p>Contact our team or browse more stays.</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'white'}>
							Contact Us
							<img src="/img/icons/rightup.svg" alt="" />
						</div>
						<div className={'black'}>
							<img src="/img/icons/call.svg" alt="" />
							920 851 9087
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(About);
