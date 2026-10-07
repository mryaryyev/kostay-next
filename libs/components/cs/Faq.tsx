import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [category, setCategory] = useState<string>('property');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	
	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const data: any = {
		property: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are the stays listed on Kostay real?',
				content: 'Every stay is listed by a registered host. If a listing looks wrong, please report it to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What types of stays can I find?',
				content: 'Apartments, villas and houses. Use the Stay Type filter to choose.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How do I search for stays?',
				content:
					'Use the filters on the Stays page: location, stay type, rooms, beds, number of guests and a nightly price range in KRW.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'Can I book just one room of a stay?',
				content: 'No. Bookings are for the whole stay; separate rooms are not offered.',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What do the price and guest numbers mean?',
				content:
					'The price is the nightly rate in Korean won (KRW). The guest number is the maximum number of guests the stay allows.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: "Why can't I find a stay I saw before?",
				content: 'Hosts can pause a listing at any time. Paused stays are hidden until the host reactivates them.',
			},
			{
				id: '00f5a45ed8897f8090116a29',
				subject: 'Can a stay be booked on the day another guest checks out?',
				content: "Yes. The check-out day is free for the next guest's check-in.",
			},
			{
				id: '00f5a45ed8897f8090116a28',
				subject: 'Do you have stays in specific areas?',
				content:
					'Yes. Stays are grouped by region, including Seoul, Busan, Incheon, Daegu, Gyeongju, Gwangju, Chonju, Daejon and Jeju.',
			},
			{
				id: '00f5a45ed8897f8090116a27',
				subject: 'Can I list my own place?',
				content: 'Yes. Sign up as a host and add your stay from My Page.',
			},
			{
				id: '00f5a45ed8897f8090116b99',
				subject: 'Can I see which dates a stay is available?',
				content: 'Not yet. An availability calendar is not available on the site yet.',
			},
		],
		payment: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'Can I book or pay for a stay on Kostay now?',
				content: 'Not yet. Booking and payment screens are not available on the site yet.',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Are there service fees?',
				content: 'This has not been decided yet.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'How is the total price of a booking calculated?',
				content:
					'The nightly price in KRW multiplied by the number of nights. Kostay always calculates the amount; it is never entered by hand.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'Which currency are prices shown in?',
				content: 'All prices are shown per night in Korean won (KRW). Kostay does not convert currencies.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I pay online with a card?',
				content: 'Not yet. Payments are currently simulated and no payment provider is connected.',
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: 'When can a booking be paid?',
				content: 'Only after the host has confirmed it.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'Is a paid booking refunded if I cancel?',
				content:
					'Yes. Cancelling a paid booking refunds it in full. Payments are currently simulated, so no real money is charged.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'Are there cancellation deadlines or partial refunds?',
				content: 'This has not been decided yet.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'Do I need an account to book a stay?',
				content: 'Yes. Booking requires a logged-in member.',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Which payment providers will be supported?',
				content: 'This has not been decided yet.',
			},
		],
		buyers: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'What should I check before choosing a stay?',
				content:
					'The location, the maximum number of guests, rooms and beds, the nightly price, and the photos and description.',
			},
			{
				id: '00f5a45ed8897f8090116a85',
				subject: 'How do I find stays within my budget?',
				content: 'Set a minimum and maximum nightly price in the filter, or sort the list by lowest price.',
			},
			{
				id: '00f5a45ed8897f8090116a84',
				subject: 'How many guests can I bring?',
				content: 'Up to the maximum number of guests shown on the stay. A booking cannot exceed it.',
			},
			{
				id: '00f5a45ed8897f8090116a83',
				subject: 'What should I consider when choosing an area?',
				content: 'Transport links, nearby attractions, safety and amenities.',
			},
			{
				id: '00f5a45ed8897f8090116a82',
				subject: 'How can I learn more about a host?',
				content:
					"Open the host's page from the Hosts list to see their profile, their stays and comments from other members.",
			},
			{
				id: '00f5a45ed8897f8090116a81',
				subject: 'What should I watch out for in a listing?',
				content:
					'Be careful with listings that have few photos or a vague description. If something looks suspicious, report it to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a80',
				subject: 'What happens after I request a booking?',
				content:
					'The booking starts as pending, and the host then confirms it. Booking screens are not available on the site yet.',
			},
			{
				id: '00f5a45ed8897f8090116a79',
				subject: 'Which dates can I choose?',
				content:
					'A check-in and a check-out date. Check-in cannot be in the past, and check-out must be after check-in.',
			},
			{
				id: '00f5a45ed8897f8090116a78',
				subject: 'Can I cancel a booking?',
				content: 'Yes, you can cancel your own pending or confirmed booking. A paid booking is refunded in full.',
			},
			{
				id: '00f5a45ed8897f8090116a77',
				subject: 'Can I save stays to look at later?',
				content:
					'Yes. Like a stay to add it to My Favorites. Stays you open also appear under Recently Visited on My Page.',
			},
		],

		agents: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'How do I become a host?',
				content:
					'Choose Host as your account type when you sign up. If you already have an account, read our terms and contact the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a62',
				subject: 'How do I list a stay?',
				content:
					'Go to My Page → Add Stay. Fill in the details, nightly price in KRW, maximum guests and photos, then save.',
			},
			{
				id: '00f5a45ed8897f8090116a63',
				subject: 'Can I edit a listing?',
				content: 'Yes, active listings can be edited from My Stays. To edit a paused listing, reactivate it first.',
			},
			{
				id: '00f5a45ed8897f8090116a64',
				subject: 'How do I pause a listing?',
				content: 'In My Stays, open the status menu and choose Deactivate. Choose Reactivate to show it to guests again.',
			},
			{
				id: '00f5a45ed8897f8090116a65',
				subject: 'How should I set my nightly price?',
				content: 'Enter a whole number in KRW per night. Compare similar stays in your area to choose a fair rate.',
			},
			{
				id: '00f5a45ed8897f8090116a66',
				subject: 'What makes a good listing?',
				content: 'Clear photos, an accurate description, the correct number of guests and an up-to-date price.',
			},
			{
				id: '00f5a45ed8897f8090116a67',
				subject: 'Do I have to approve bookings?',
				content:
					'Yes. Every booking starts as pending, and you confirm it as the host. Booking screens are not available on the site yet.',
			},
			{
				id: '00f5a45ed8897f8090116a68',
				subject: 'Can I book my own stay?',
				content: 'No. Hosts cannot book their own stays.',
			},
			{
				id: '00f5a45ed8897f8090116a69',
				subject: 'What rules apply to hosting in South Korea?',
				content:
					"Hosts are responsible for following local laws and registration rules for short-term stays. If you're unsure, consult a local professional.",
			},
			{
				id: '00f5a45ed8897f8090116a70',
				subject: 'What happens to existing bookings if I pause or delete a listing?',
				content: 'This has not been decided yet.',
			},
		],
		membership: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'Do you have a membership service on your site?',
				content: 'Kostay has member accounts, but there is no separate membership program.',
			},
			{
				id: '00f5a45ed8897f8090116a60',
				subject: 'What are the benefits of becoming a member on your website?',
				content: 'We currently do not offer membership benefits.',
			},
			{
				id: '00f5a45ed8897f8090116a59',
				subject: 'Is there a fee associated with becoming a member?',
				content: 'As membership services are not available, there are no associated fees at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a58',
				subject: 'Will membership provide access to exclusive content or features?',
				content: "We don't currently have membership-exclusive content or features.",
			},
			{
				id: '00f5a45ed8897f8090116a57',
				subject: 'How can I sign up for a membership on your site?',
				content: 'You can create an account from Login/Signup. A separate membership program does not exist.',
			},
			{
				id: '00f5a45ed8897f8090116a56',
				subject: 'Do members receive discounts on stays or services?',
				content: 'Membership discounts are not part of our current offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a55',
				subject: 'Are there plans to introduce a membership program in the future?',
				content: 'This has not been decided yet.',
			},
			{
				id: '00f5a45ed8897f8090116a54',
				subject: 'What kind of content or benefits can members expect if a membership program is introduced?',
				content: 'This has not been decided yet.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you offer a premium membership option on your platform?',
				content: 'Currently, we do not provide a premium membership option.',
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Will membership grant access to exclusive deals or discounts?',
				content: 'Membership perks, including deals or discounts, are not available at this time.',
			},
		],
		community: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'What should I do if there is abusive or criminal behavior in the community section?',
				content: 'If you encounter this situation, please report it immediately or contact the admin!',
			},
			{
				id: '00f5a45ed8897f8090116a44',
				subject: 'How can I participate in the community section of your website?',
				content: 'Create an account and engage in discussions.',
			},
			{
				id: '00f5a45ed8897f8090116a45',
				subject: 'Are there guidelines for posting?',
				content: 'There is no separate guidelines page yet. Please be respectful to other members.',
			},
			{
				id: '00f5a45ed8897f8090116a46',
				subject: 'What should I do if I encounter spam or irrelevant posts?',
				content: 'Report them to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a47',
				subject: 'Can I connect with other members outside of the community section?',
				content: 'Yes. You can follow other members from their page and use the site chat.',
			},
			{
				id: '00f5a45ed8897f8090116a48',
				subject: 'Can I share personal experiences or recommendations?',
				content: 'Yes, if relevant you can share personal experiences and recommendations.',
			},
			{
				id: '00f5a45ed8897f8090116a49',
				subject: 'How can I ensure privacy?',
				content: 'Avoid sharing sensitive information.',
			},
			{
				id: '00f5a45ed8897f8090116a50',
				subject: 'How can I contribute positively?',
				content: 'Respect others and engage constructively.',
			},
			{
				id: '00f5a45ed8897f8090116a51',
				subject: 'What if I notice misinformation?',
				content: 'Provide correct information or report to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a52',
				subject: 'Are there moderators?',
				content: 'Admins can edit and remove posts.',
			},
		],
		other: [
			{
				id: '00f5a45ed8897f8090116a40',
				subject: 'Who should I contact if I want to buy your site?',
				content: 'We have no plans to sell the site at this time!',
			},
			{
				id: '00f5a45ed8897f8090116a39',
				subject: 'Can I advertise my services on your website?',
				content: 'We currently do not offer advertising opportunities on our site.',
			},
			{
				id: '00f5a45ed8897f8090116a38',
				subject: 'Are there sponsorship opportunities available on your platform?',
				content: 'At this time, we do not have sponsorship opportunities.',
			},
			{
				id: '00f5a45ed8897f8090116a36',
				subject: 'Can I contribute guest posts or articles to your website?',
				content: "We're not accepting guest posts or articles at the moment.",
			},
			{
				id: '00f5a45ed8897f8090116a35',
				subject: 'Is there a referral program for recommending your website to others?',
				content: "We don't have a referral program in place currently.",
			},
			{
				id: '00f5a45ed8897f8090116a34',
				subject: 'Do you offer affiliate partnerships for promoting your services?',
				content: 'Affiliate partnerships are not available at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Can I purchase merchandise related to your website?',
				content: "We don't have merchandise available for purchase.",
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Are there any job openings or opportunities to work with your team?',
				content: 'Currently, we do not have any job openings or opportunities available.',
			},
			{
				id: '00f5a45ed8897f8090116a31',
				subject: 'Do you host events or webinars related to travel or hosting?',
				content: "We're not hosting events or webinars at this time.",
			},
			{
				id: '00f5a45ed8897f8090116a30',
				subject: 'Can I request custom features or functionalities for your website?',
				content: "We're not accepting requests for custom features or functionalities.",
			},
		],
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'property' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('property');
						}}
					>
						Stays
					</div>
					<div
						className={category === 'payment' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('payment');
						}}
					>
						Payment
					</div>
					<div
						className={category === 'buyers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('buyers');
						}}
					>
						For Guests
					</div>
					<div
						className={category === 'agents' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('agents');
						}}
					>
						For Hosts
					</div>
					<div
						className={category === 'membership' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('membership');
						}}
					>
						Membership
					</div>
					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
						Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						Other
					</div>
				</Box>
				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
