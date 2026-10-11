import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

type MenuItem = {
	label: string;
	icon: React.ReactNode;
	category?: string; // existing tab; items without one are UI-only for now
	badge?: React.ReactNode;
	badgeClass?: string;
};

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);
	const isHost = user.memberType === 'AGENT';

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const groups: { title: string; items: MenuItem[] }[] = [
		...(isHost
			? [
					{
						title: 'Hosting',
						items: [
							{
								label: 'My Stays',
								icon: <HomeWorkOutlinedIcon />,
								category: 'myProperties',
								badge: user.memberProperties || undefined,
							},
							// TODO: backend — bookings guests made on this host's stays
							{ label: 'Reservations', icon: <EventAvailableOutlinedIcon />, badge: 'Soon', badgeClass: 'is-warm' },
							{ label: 'Add Stay', icon: <AddHomeOutlinedIcon />, category: 'addProperty' },
						],
					},
			  ]
			: []),
		{
			title: 'Stays',
			items: [
				// Guests book stays; hosts see incoming bookings under Hosting → Reservations instead.
				...(isHost
					? []
					: [
							// TODO: backend — bookings tab and active count
							{ label: 'My Bookings', icon: <LuggageOutlinedIcon />, badge: 'Soon', badgeClass: 'is-warm' },
					  ]),
				{ label: 'My Favorites', icon: <FavoriteBorderIcon />, category: 'myFavorites' },
				{ label: 'Recently Viewed', icon: <HistoryIcon />, category: 'recentlyVisited' },
			],
		},
		{
			title: 'Community',
			items: [
				{
					label: 'My Articles',
					icon: <ArticleOutlinedIcon />,
					category: 'myArticles',
					badge: user.memberArticles || undefined,
				},
				{ label: 'Write Article', icon: <EditOutlinedIcon />, category: 'writeArticle' },
				{ label: 'Followers', icon: <PersonAddAltOutlinedIcon />, category: 'followers' },
				{ label: 'Followings', icon: <PeopleOutlineIcon />, category: 'followings' },
			],
		},
		{
			title: 'Account',
			items: [
				{ label: 'My Profile', icon: <BadgeOutlinedIcon />, category: 'myProfile' },
				// TODO: backend — wallet and password/security pages
				{ label: 'Payments & Wallet', icon: <AccountBalanceWalletOutlinedIcon /> },
				{ label: 'Security', icon: <ShieldOutlinedIcon /> },
			],
		},
	];

	const renderItem = (item: MenuItem) => {
		const active = !!item.category && category === item.category;
		const content = (
			<>
				{item.icon}
				<span>{item.label}</span>
				{active ? (
					<i className="sx-menu-dot" aria-hidden="true" />
				) : item.badge ? (
					<em className={item.badgeClass}>{item.badge}</em>
				) : null}
			</>
		);
		return (
			<li key={item.label}>
				{item.category ? (
					<Link
						href={{ pathname: '/mypage', query: { category: item.category } }}
						scroll={false}
						className={`sx-menu-item ${active ? 'active' : ''}`}
						aria-current={active ? 'page' : undefined}
					>
						{content}
					</Link>
				) : (
					<button type="button" className="sx-menu-item">
						{content}
					</button>
				)}
			</li>
		);
	};

	if (device === 'mobile') {
		return <div>MY MENU</div>;
	} else {
		return (
			<nav className="sx-menu" aria-label="Account navigation">
				<div className="sx-menu-head">
					<h5>Account</h5>
					{user?.memberType === 'ADMIN' ? (
						<a href="/_admin/users" target={'_blank'} className="sx-menu-hub">
							Admin
						</a>
					) : (
						<span className="sx-menu-hub">{isHost ? 'Host' : 'Guest'}</span>
					)}
				</div>
				{groups.map((group) => (
					<div key={group.title} className="sx-menu-group">
						<h6>{group.title}</h6>
						<ul>{group.items.map(renderItem)}</ul>
					</div>
				))}
				<ul>
					<li className="sx-menu-logout">
						<button type="button" className="sx-menu-item logout" onClick={logoutHandler}>
							<LogoutIcon />
							<span>Log Out</span>
						</button>
					</li>
				</ul>
			</nav>
		);
	}
};

export default MyMenu;
