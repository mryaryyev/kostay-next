import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Dialog, IconButton } from '@mui/material';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { boardLabels, boardMeta } from '../../libs/components/common/CommunityCard';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Messages } from '../../libs/config';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import {
	sweetConfirmAlert,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import {
	CREATE_COMMENT,
	LIKE_TARGET_BOARD_ARTICLE,
	UPDATE_BOARD_ARTICLE,
	UPDATE_COMMENT,
} from '../../apollo/user/mutation';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { scrollToListTop } from '../../libs/utils';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/profile/defaultUser.svg');
	const [anchorEl, setAnchorEl] = useState<any | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const {
		loading: boardArticleLoading,
		data: boardArticleData,
		error: getBoardArticleError,
		refetch: boardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: {
			input: articleId,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setComments(data.getComments.list);
			setTotal(data.getComments?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	const likeBoArticleHandler = async (user: any, id: any) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			setLikeLoading(true);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticleRefetch({ input: articleId });
			await sweetTopSmallSuccessAlert('Success!', 800);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const creteCommentHandler = async () => {
		if (!comment) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({
				variables: {
					input: commentInput,
				},
			});
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
			setComment('');
			await sweetMixinSuccessAlert('Successfully commented!');
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update your comment!');

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});
					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});
				await sweetMixinSuccessAlert('Successfully updated!');
			}
			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const goWrite = async () => {
		// Writing needs an account (same rule as the board list).
		if (!user?._id) {
			await sweetMixinErrorAlert(Messages.error2, 2000);
			await router.push('/account/join');
			return;
		}
		await router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	const editArticleHandler = () => {
		router.push({ pathname: '/mypage', query: { category: 'writeArticle', articleId } });
	};

	const deleteArticleHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!(await sweetConfirmAlert('Do you want to delete this article?'))) return;
			await updateBoardArticle({
				variables: { input: { _id: articleId, articleStatus: BoardArticleStatus.DELETE } },
			});
			await sweetTopSmallSuccessAlert('Article deleted', 800);
			// The author's own list shows the result (article gone, count down by one).
			await router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/profile/defaultUser.svg';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
		scrollToListTop('.sx-comments');
	};

	const activeBoard = boardArticle?.articleCategory ?? articleCategory ?? 'FREE';
	const activeMeta = boardMeta[activeBoard] ?? boardMeta.FREE;
	const isOwner = Boolean(user?._id && boardArticle?.memberId === user._id);
	const meLiked = Boolean(boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite);
	const commentPageCount = Math.ceil(total / searchFilter.limit) || 1;

	return (
		<div id="community-detail-page">
			<div className="container sx-community-layout">
				<aside className="sx-community-side">
					<div className="sx-board-menu">
						<div className="sx-board-brand">
							<span aria-hidden="true">
								<HomeOutlinedIcon />
							</span>
							<div>
								<strong>Kostay</strong>
								<small>Community Lounge</small>
							</div>
						</div>
						<nav aria-label="Boards">
							{Object.values(BoardArticleCategory).map((category) => (
								<button
									type="button"
									key={category}
									className={category === activeBoard ? 'is-active' : ''}
									aria-current={category === activeBoard ? 'page' : undefined}
									onClick={(e) => tabChangeHandler(e, category)}
								>
									<span>{boardLabels[category]}</span>
								</button>
							))}
						</nav>
					</div>

					<div className="sx-etiquette">
						<h3>
							<HandshakeIcon aria-hidden="true" />
							Community Etiquette
						</h3>
						<p>
							Korean hospitality thrives on mutual respect (<em>Jeong</em>). Please share truthful accounts, respect fellow
							hosts and travelers, and avoid commercial spam.
						</p>
					</div>
				</aside>

				<section className="sx-community-main">
					<div className="sx-board-head">
						<div>
							<button type="button" className="sx-back" onClick={(e) => tabChangeHandler(e, activeBoard)}>
								<ArrowBackRoundedIcon aria-hidden="true" />
								Back to {boardLabels[activeBoard] ?? 'board'}
							</button>
							<h2>{activeMeta.title}</h2>
							<p>{activeMeta.description}</p>
						</div>
						<div className="sx-board-actions">
							<button
								type="button"
								className="sx-write"
								onClick={goWrite}
							>
								<EditNoteIcon aria-hidden="true" />
								Write
							</button>
						</div>
					</div>

					<article className="sx-article">
						{boardArticle?.articleImage && (
							<div className="sx-article-cover">
								<img src={`${REACT_APP_API_URL}/${boardArticle.articleImage}`} alt="" />
							</div>
						)}
						<header className="sx-article-head">
							<div className="sx-article-top">
								<span className="sx-article-board">{boardLabels[activeBoard] ?? activeBoard}</span>
								{isOwner && (
									<div className="sx-article-owner">
										<button type="button" onClick={editArticleHandler}>
											<EditOutlinedIcon aria-hidden="true" />
											Edit
										</button>
										<button type="button" className="is-danger" onClick={deleteArticleHandler}>
											<DeleteOutlineRoundedIcon aria-hidden="true" />
											Delete
										</button>
									</div>
								)}
							</div>
							<h1>{boardArticle?.articleTitle}</h1>
							<div className="sx-article-meta">
								<button
									type="button"
									className="sx-article-author"
									onClick={() => goMemberPage(boardArticle?.memberData?._id)}
								>
									<img src={memberImage} alt="" />
									<span>
										<strong>{boardArticle?.memberData?.memberNick}</strong>
										<Moment format={'MMM D, YYYY · HH:mm'}>{boardArticle?.createdAt}</Moment>
									</span>
								</button>
								<ul className="sx-article-stats">
									<li aria-label="Likes">
										{meLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
										{boardArticle?.articleLikes ?? 0}
									</li>
									<li aria-label="Views">
										<VisibilityOutlinedIcon />
										{boardArticle?.articleViews ?? 0}
									</li>
									<li aria-label="Comments">
										<ChatBubbleOutlineRoundedIcon />
										{total}
									</li>
								</ul>
							</div>
						</header>

						<div className="sx-article-body">
							<ToastViewerComponent markdown={boardArticle?.articleContent} className={'ytb_play'} />
						</div>

						<footer className="sx-article-foot">
							<button
								type="button"
								className={`sx-like ${meLiked ? 'is-liked' : ''}`}
								aria-pressed={meLiked}
								disabled={likeLoading}
								onClick={() => likeBoArticleHandler(user, boardArticle?._id)}
							>
								{meLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
								{meLiked ? 'Liked' : 'Like'} · {boardArticle?.articleLikes ?? 0}
							</button>
						</footer>
					</article>

					<section className="sx-comments" aria-label="Comments">
						<h3>
							Comments <em>{total}</em>
						</h3>
						<div className="sx-comment-form">
							<textarea
								rows={3}
								placeholder={user?._id ? 'Share your thoughts…' : 'Log in to leave a comment'}
								value={comment}
								onChange={(e) => {
									if (e.target.value.length > 100) return;
									setWordsCnt(e.target.value.length);
									setComment(e.target.value);
								}}
							/>
							<div className="sx-comment-form-foot">
								<span>{wordsCnt}/100</span>
								<button type="button" disabled={!comment.trim()} onClick={creteCommentHandler}>
									Post comment
								</button>
							</div>
						</div>

						{total > 0 ? (
							<ul className="sx-comment-list">
								{comments?.map((commentData) => (
									<li className="sx-comment" key={commentData?._id}>
										<button
											type="button"
											className="sx-comment-avatar"
											onClick={() => goMemberPage(commentData?.memberData?._id as string)}
										>
											<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" />
										</button>
										<div className="sx-comment-main">
											<div className="sx-comment-top">
												<button
													type="button"
													className="sx-comment-name"
													onClick={() => goMemberPage(commentData?.memberData?._id as string)}
												>
													{commentData?.memberData?.memberNick}
												</button>
												<Moment className="sx-comment-date" format={'MMM D, YYYY · HH:mm'}>
													{commentData?.createdAt}
												</Moment>
												{commentData?.memberId === user?._id && (
													<div className="sx-comment-actions">
														<IconButton
															size="small"
															aria-label="Edit comment"
															onClick={() => {
																setUpdatedComment(commentData?.commentContent);
																setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																setUpdatedCommentId(commentData?._id);
																setOpenBackdrop(true);
															}}
														>
															<EditOutlinedIcon />
														</IconButton>
														<IconButton
															size="small"
															aria-label="Delete comment"
															onClick={() => {
																setUpdatedCommentId(commentData?._id);
																updateButtonHandler(commentData?._id, CommentStatus.DELETE);
															}}
														>
															<DeleteOutlineRoundedIcon />
														</IconButton>
													</div>
												)}
											</div>
											<p>{commentData?.commentContent}</p>
										</div>
									</li>
								))}
							</ul>
						) : (
							<p className="sx-comment-empty">No comments yet. Be the first to share your thoughts.</p>
						)}

						{commentPageCount > 1 && (
							<div className="sx-community-pagination">
								<nav aria-label="Comment pages">
									<button
										type="button"
										aria-label="Previous page"
										disabled={searchFilter.page <= 1}
										onClick={() => paginationHandler({}, searchFilter.page - 1)}
									>
										<ChevronLeftIcon />
									</button>
									{Array.from({ length: commentPageCount }, (_, index) => index + 1).map((page) => (
										<button
											type="button"
											key={page}
											className={page === searchFilter.page ? 'is-active' : ''}
											aria-current={page === searchFilter.page ? 'page' : undefined}
											onClick={() => paginationHandler({}, page)}
										>
											{page}
										</button>
									))}
									<button
										type="button"
										aria-label="Next page"
										disabled={searchFilter.page >= commentPageCount}
										onClick={() => paginationHandler({}, searchFilter.page + 1)}
									>
										<ChevronRightIcon />
									</button>
								</nav>
							</div>
						)}
					</section>
				</section>
			</div>

			<Dialog
				open={openBackdrop}
				onClose={cancelButtonHandler}
				fullWidth
				maxWidth="sm"
				PaperProps={{ className: 'sx-comment-dialog' }}
			>
				<h3>Edit comment</h3>
				<textarea
					autoFocus
					rows={4}
					value={updatedComment}
					onChange={(e) => updateCommentInputHandler(e.target.value)}
				/>
				<div className="sx-comment-dialog-foot">
					<span>{updatedCommentWordsCnt}/100</span>
					<div>
						<button type="button" className="is-ghost" onClick={cancelButtonHandler}>
							Cancel
						</button>
						<button type="button" onClick={() => updateButtonHandler(updatedCommentId, undefined)}>
							Save
						</button>
					</div>
				</div>
			</Dialog>
		</div>
	);
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
