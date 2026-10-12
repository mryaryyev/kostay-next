import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import PersonIcon from '@mui/icons-material/Person';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Member } from '../../types/member/member';
import { MemberType } from '../../enums/member.enum';
import { REACT_APP_API_URL } from '../../config';

interface MemberIdentityProps {
	member: Member | null;
	isMe: boolean;
	onFollow: () => void;
	onUnfollow: () => void;
}

/** Public profile header on /member (same look as the My Page identity card). */
export const MemberIdentity = (props: MemberIdentityProps) => {
	const { member, isMe, onFollow, onUnfollow } = props;
	const isFollowing = Boolean(member?.meFollowed?.[0]?.myFollowing);
	const isHost = member?.memberType === MemberType.AGENT;

	return (
		<section className="sx-identity">
			<span className="sx-identity-avatar">
				{member?.memberImage ? (
					<img src={`${REACT_APP_API_URL}/${member.memberImage}`} alt="" />
				) : (
					<PersonIcon aria-hidden="true" />
				)}
			</span>
			<div className="sx-identity-copy">
				<span className="sx-identity-role">{isHost ? 'Host' : 'Guest'}</span>
				<h2>{member?.memberFullName || member?.memberNick}</h2>
				{member?.memberDesc && <p>{member.memberDesc}</p>}
				<div className="sx-identity-meta">
					{member?.memberAddress && (
						<span>
							<PlaceOutlinedIcon aria-hidden="true" />
							{member.memberAddress}
						</span>
					)}
					{isHost && member?.memberPhone && (
						<span>
							<PhoneIphoneOutlinedIcon aria-hidden="true" />
							{member.memberPhone}
						</span>
					)}
					{member?.createdAt && (
						<span>
							<CalendarMonthOutlinedIcon aria-hidden="true" />
							Joined <Moment format="MMMM YYYY">{member.createdAt}</Moment>
						</span>
					)}
				</div>
			</div>
			{member && !isMe && (
				<button
					type="button"
					className={`sx-identity-edit${isFollowing ? ' is-following' : ''}`}
					aria-pressed={isFollowing}
					onClick={isFollowing ? onUnfollow : onFollow}
				>
					{isFollowing ? <HowToRegOutlinedIcon aria-hidden="true" /> : <PersonAddAlt1OutlinedIcon aria-hidden="true" />}
					<span className="sx-follow-label">{isFollowing ? 'Following' : 'Follow'}</span>
					{isFollowing && <span className="sx-follow-hover">Unfollow</span>}
				</button>
			)}
		</section>
	);
};

interface MemberMenuProps {
	member: Member | null;
}

/** Sidebar on /member: switches the visible list via ?category=. */
const MemberMenu = (props: MemberMenuProps) => {
	const { member } = props;
	const router = useRouter();
	const category: any = router.query?.category;
	const isHost = member?.memberType === MemberType.AGENT;

	const groups = [
		{
			title: 'Details',
			items: [
				...(isHost
					? [{ category: 'properties', label: 'Stays', icon: <HomeWorkOutlinedIcon />, count: member?.memberProperties }]
					: []),
				{ category: 'followers', label: 'Followers', icon: <GroupOutlinedIcon />, count: member?.memberFollowers },
				{ category: 'followings', label: 'Followings', icon: <GroupAddOutlinedIcon />, count: member?.memberFollowings },
			],
		},
		{
			title: 'Community',
			items: [{ category: 'articles', label: 'Articles', icon: <ArticleOutlinedIcon />, count: member?.memberArticles }],
		},
	];

	return (
		<nav className="sx-menu" aria-label="Profile sections">
			<div className="sx-menu-head">
				<h5>Profile</h5>
				<span className="sx-menu-hub">{isHost ? 'Host' : 'Guest'}</span>
			</div>
			{groups.map((group) => (
				<div key={group.title} className="sx-menu-group">
					<h6>{group.title}</h6>
					<ul>
						{group.items.map((item) => {
							const active = category === item.category;
							return (
								<li key={item.category}>
									<Link
										href={{ pathname: '/member', query: { ...router.query, category: item.category } }}
										scroll={false}
										className={`sx-menu-item ${active ? 'active' : ''}`}
										aria-current={active ? 'page' : undefined}
									>
										{item.icon}
										<span>{item.label}</span>
										<em>{item.count ?? 0}</em>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
};

export default MemberMenu;
