import React, { ChangeEvent, useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { scrollToListTop } from '../../utils';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberFollowersLoading,
		data: getMemberFollowersData,
		error: getMemberFollowersError,
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	useEffect(() => {
		if (!followInquiry?.search?.followingId) return;
		getMemberFollowersRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
		scrollToListTop('.main-config');
	};

	return (
		<div id="member-follows-page">
			<div className="sx-follows-head">
				<h3>Followers</h3>
				<span>{total ?? 0} {(total ?? 0) === 1 ? 'person' : 'people'}</span>
			</div>
			{memberFollowers?.length === 0 ? (
				<div className="sx-follows-empty">
					<GroupOutlinedIcon aria-hidden="true" />
					<p>No followers yet.</p>
				</div>
			) : (
				<ul className="sx-follows-list">
					{memberFollowers.map((follow: Follower) => {
						const person = follow?.followerData;
						const isMe = user?._id === follow?.followerId;
						const isLiked = Boolean(follow?.meLiked?.[0]?.myFavorite);
						const isFollowing = Boolean(follow?.meFollowed?.[0]?.myFollowing);
						return (
							<li className="sx-follow-row" key={follow._id}>
								<button
									type="button"
									className="sx-follow-person"
									onClick={() => redirectToMemberPageHandler(person?._id)}
								>
									<span className="sx-follow-avatar">
										{person?.memberImage ? (
											<img src={`${REACT_APP_API_URL}/${person.memberImage}`} alt="" />
										) : (
											<PersonIcon aria-hidden="true" />
										)}
									</span>
									<span className="sx-follow-name">
										<strong>{person?.memberNick}</strong>
										<small>{person?.memberType === 'AGENT' ? 'Host' : 'Guest'}</small>
									</span>
								</button>
								<div className="sx-follow-stats">
									<span>
										<b>{person?.memberFollowers ?? 0}</b> {person?.memberFollowers === 1 ? 'follower' : 'followers'}
									</span>
									<span>
										<b>{person?.memberFollowings ?? 0}</b> following
									</span>
									<button
										type="button"
										className={`sx-follow-like${isLiked ? ' is-on' : ''}`}
										aria-pressed={isLiked}
										aria-label={isLiked ? 'Unlike' : 'Like'}
										onClick={() => likeMemberHandler(person?._id, getMemberFollowersRefetch, followInquiry)}
									>
										{isLiked ? <FavoriteIcon aria-hidden="true" /> : <FavoriteBorderIcon aria-hidden="true" />}
										<b>{person?.memberLikes ?? 0}</b>
									</button>
								</div>
								<div className="sx-follow-action">
									{isMe ? (
										<span className="sx-follow-you">You</span>
									) : isFollowing ? (
										<button
											type="button"
											className="sx-follow-btn is-following"
											onClick={() => unsubscribeHandler(person?._id, getMemberFollowersRefetch, followInquiry)}
										>
											<span className="sx-follow-label">Following</span>
											<span className="sx-follow-hover">Unfollow</span>
										</button>
									) : (
										<button
											type="button"
											className="sx-follow-btn"
											onClick={() => subscribeHandler(person?._id, getMemberFollowersRefetch, followInquiry)}
										>
											Follow
										</button>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}
			{total > followInquiry.limit && (
				<Pagination
					className="sx-follows-pagination"
					page={followInquiry.page}
					count={Math.ceil(total / followInquiry.limit)}
					onChange={paginationHandler}
					shape="circular"
				/>
			)}
		</div>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
