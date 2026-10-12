import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CircularProgress, Pagination } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import moment from 'moment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EastIcon from '@mui/icons-material/East';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyCard from '../../libs/components/property/PropertyCard';
import { Property } from '../../libs/types/property/property';
import { Member } from '../../libs/types/member/member';
import { userVar } from '../../apollo/store';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
	CREATE_COMMENT,
	LIKE_TARGET_MEMBER,
	LIKE_TARGET_PROPERTY,
	SUBSCRIBE,
	UNSUBSCRIBE,
} from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PROPERTIES } from '../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import {
	sweetErrorHandling,
	sweetLoginConfirmAlert,
	sweetMixinErrorAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const avatar = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg');

/** Host profile: their stays and reviews. Same queries as before (GET_MEMBER, GET_PROPERTIES, GET_COMMENTS), Kostay design. */
const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const { loading: getMemberLoading } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		onCompleted: (data: T) => {
			setAgent(data?.getMember);
			setSearchFilter({ ...searchFilter, search: { memberId: data?.getMember?._id } });
			setCommentInquiry({ ...commentInquiry, search: { commentRefId: data?.getMember?._id } });
			setInsertCommentData({ ...insertCommentData, commentRefId: data?.getMember?._id });
		},
	});

	const { refetch: getPropertiesRefetch } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getProperties?.list);
			setPropertyTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) getPropertiesRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) getCommentsRefetch({ input: commentInquiry }).then();
	}, [commentInquiry]);

	/** HANDLERS **/
	const isMe = Boolean(user?._id) && user?._id === agent?._id;
	// As in Nestar: the host's name opens their member profile (or My Page for yourself).
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry({ ...commentInquiry, page: value });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a review for yourself');
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!agent) {
		return (
			<div id="host-detail-page" className="is-loading">
				{getMemberLoading || !agentId ? <CircularProgress /> : <p>Host not found.</p>}
			</div>
		);
	}

	const name = agent.memberFullName || agent.memberNick;

	return (
		<div id="host-detail-page">
			<section className="sx-host-hero">
				<span className="sx-host-hero-bg" aria-hidden="true" />
				<div className="container">
					<nav className="sx-host-crumbs" aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<ChevronRightIcon aria-hidden="true" />
						<Link href="/agent">Hosts</Link>
						<ChevronRightIcon aria-hidden="true" />
						<span aria-current="page">{name}</span>
					</nav>
					<div className="sx-host-head">
						<button
							type="button"
							className="sx-host-avatar"
							aria-label={`Open ${name}'s profile`}
							onClick={() => redirectToMemberPageHandler(agent._id)}
						>
							<img src={avatar(agent.memberImage)} alt="" />
						</button>
						<div className="sx-host-title">
							<span className="sx-host-kicker">Host</span>
							<h1>{name}</h1>
							<p>
								Hosting since {moment(agent.createdAt).format('YYYY')} · {agent.memberProperties ?? 0}{' '}
								{agent.memberProperties === 1 ? 'stay' : 'stays'}
							</p>
						</div>
						{/* Contact, bio and follow live on the member profile, as in Nestar. */}
						<button type="button" className="sx-host-profile-btn" onClick={() => redirectToMemberPageHandler(agent._id)}>
							{isMe ? 'Go to My Page' : 'View profile'}
							<EastIcon aria-hidden="true" />
						</button>
					</div>
				</div>
			</section>

			<div className="container">
				<div className="sx-host-layout">
					<main className="sx-host-main">
						<section className="sx-host-section">
							<header>
								<h2>Stays by {agent.memberNick}</h2>
								<span>
									{propertyTotal} {propertyTotal === 1 ? 'stay' : 'stays'}
								</span>
							</header>
							{propertyTotal ? (
								<>
									<div className="sx-stays-grid">
										{agentProperties.map((property: Property) => (
											<PropertyCard
												key={property._id}
												property={property}
												likePropertyHandler={likePropertyHandler}
												variant={'stays'}
											/>
										))}
									</div>
									{propertyTotal > searchFilter.limit && (
										<Pagination
											className="sx-host-pagination"
											page={searchFilter.page}
											count={Math.ceil(propertyTotal / searchFilter.limit)}
											onChange={propertyPaginationChangeHandler}
											shape="circular"
										/>
									)}
								</>
							) : (
								<div className="sx-host-empty">
									<HomeWorkOutlinedIcon aria-hidden="true" />
									<strong>No stays listed yet</strong>
								</div>
							)}
						</section>

						<section className="sx-host-section">
							<header>
								<h2>
									<StarRoundedIcon aria-hidden="true" />
									Reviews
								</h2>
								<span>
									{commentTotal} {commentTotal === 1 ? 'review' : 'reviews'}
								</span>
							</header>
							{commentTotal === 0 ? (
								<p className="sx-host-muted">No reviews yet. Stayed with {agent.memberNick}? Share how it went.</p>
							) : (
								<ul className="sx-host-reviews">
									{agentComments.map((comment) => (
										<li key={comment._id}>
											<img src={avatar(comment.memberData?.memberImage)} alt="" />
											<div>
												<div className="sx-host-review-head">
													<strong>{comment.memberData?.memberNick}</strong>
													<time>{moment(comment.createdAt).format('MMM D, YYYY')}</time>
												</div>
												<p>{comment.commentContent}</p>
											</div>
										</li>
									))}
								</ul>
							)}
							{commentTotal > commentInquiry.limit && (
								<Pagination
									className="sx-host-pagination"
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit)}
									onChange={commentPaginationChangeHandler}
									shape="circular"
								/>
							)}

							{!isMe && (
								<div className="sx-host-review-form">
									<label htmlFor="host-review">Write a review</label>
									<textarea
										id="host-review"
										rows={4}
										placeholder={user?._id ? `How was your stay with ${agent.memberNick}?` : 'Log in to write a review'}
										value={insertCommentData.commentContent}
										onChange={(e) => setInsertCommentData({ ...insertCommentData, commentContent: e.target.value })}
									/>
									<button
										type="button"
										disabled={!insertCommentData.commentContent.trim() || !user?._id}
										onClick={createCommentHandler}
									>
										<SendOutlinedIcon aria-hidden="true" />
										Submit review
									</button>
								</div>
							)}
						</section>
					</main>
				</div>
			</div>
		</div>
	);
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
