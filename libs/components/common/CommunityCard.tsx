import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EastIcon from '@mui/icons-material/East';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { MemberType } from '../../enums/member.enum';

export const boardLabels: Record<string, string> = {
	FREE: 'Free Board',
	RECOMMEND: 'Recommendation',
	NEWS: 'News & Guides',
	HUMOR: 'Humor Board',
};

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
	/** 'board' renders the Stitch Community card used on /community. */
	variant?: 'default' | 'board';
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler, variant = 'default' } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else if (variant === 'board') {
		const isLiked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);
		const author = boardArticle?.memberData;
		const authorName = author?.memberNick ?? 'Member';
		const preview = (boardArticle?.articleContent ?? '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/&nbsp;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		return (
			<article
				className="sx-post"
				role="link"
				tabIndex={0}
				onClick={(e) => chooseArticleHandler(e, boardArticle)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') chooseArticleHandler(e, boardArticle);
				}}
			>
				<div className="sx-post-media">
					{boardArticle?.articleImage ? (
						<img src={imagePath} alt="" loading="lazy" />
					) : (
						<span className="sx-post-fallback" aria-hidden="true">
							<ArticleOutlinedIcon />
						</span>
					)}
					<span className="sx-post-board">
						{boardLabels[boardArticle?.articleCategory] ?? boardArticle?.articleCategory}
					</span>
					<span className="sx-post-date">
						<Moment format={'MMMM'}>{boardArticle?.createdAt}</Moment>
						<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
					</span>
				</div>
				<div className="sx-post-body">
					<div className="sx-post-main">
						<button
							type="button"
							className="sx-post-author"
							onClick={(e) => {
								e.stopPropagation();
								if (author?._id) goMemberPage(author._id);
							}}
						>
							<span className="sx-post-initial" aria-hidden="true">
								{authorName.charAt(0).toUpperCase()}
							</span>
							<strong>{authorName}</strong>
							<em>· {author?.memberType === MemberType.AGENT ? 'Host' : 'Guest'}</em>
						</button>
						<h3>{boardArticle?.articleTitle}</h3>
						{preview && <p>{preview}</p>}
					</div>
					<div className="sx-post-foot">
						<div className="sx-post-stats">
							<span aria-label={`${boardArticle?.articleViews ?? 0} views`}>
								<VisibilityOutlinedIcon aria-hidden="true" />
								{boardArticle?.articleViews ?? 0}
							</span>
							<button
								type="button"
								className={isLiked ? 'is-on' : ''}
								aria-pressed={isLiked}
								aria-label={`${isLiked ? 'Unlike' : 'Like'} ${boardArticle?.articleTitle}`}
								onClick={(e) => likeArticleHandler(e, user, boardArticle?._id)}
							>
								{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								{boardArticle?.articleLikes ?? 0}
							</button>
							<span aria-label={`${boardArticle?.articleComments ?? 0} comments`}>
								<ChatBubbleOutlineIcon aria-hidden="true" />
								{boardArticle?.articleComments ?? 0}
							</span>
						</div>
						<EastIcon className="sx-post-arrow" aria-hidden="true" />
					</div>
				</div>
			</article>
		);
	} else {
		return (
			<Stack
				sx={{ width: size === 'small' ? '285px' : '317px' }}
				className="community-general-card-config"
				onClick={(e) => chooseArticleHandler(e, boardArticle)}
			>
				<Stack className="image-box">
					<img src={imagePath} alt="" className="card-img" />
				</Stack>
				<Stack className="desc-box" sx={{ marginTop: '-20px' }}>
					<Stack>
						<Typography
							className="desc"
							onClick={(e) => {
								e.stopPropagation();
								goMemberPage(boardArticle?.memberData?._id as string);
							}}
						>
							{boardArticle?.memberData?.memberNick}
						</Typography>
						<Typography className="title">{boardArticle?.articleTitle}</Typography>
					</Stack>
					<Stack className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleViews}</Typography>
						<IconButton color={'default'} onClick={(e: any) => likeArticleHandler(e, user, boardArticle?._id)}>
							{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleLikes}</Typography>
					</Stack>
				</Stack>
				<Stack className="date-box">
					<Moment className="month" format={'MMMM'}>
						{boardArticle?.createdAt}
					</Moment>
					<Typography className="day">
						<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
					</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityCard;
