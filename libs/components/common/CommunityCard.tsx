import React from 'react';
import { useRouter } from 'next/router';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
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

export const boardMeta: Record<string, { title: string; description: string; placeholder: string }> = {
	FREE: {
		title: 'FREE BOARD',
		description: 'Talk about anything from your stay — questions, stories and everyday moments across Korea.',
		placeholder: 'Search the free board...',
	},
	RECOMMEND: {
		title: 'RECOMMENDATION',
		description: 'Favourite stays, neighbourhoods, cafés and day trips recommended by fellow travelers.',
		placeholder: 'Search recommendations...',
	},
	NEWS: {
		title: 'NEWS & GUIDES',
		description: 'Seasonal guides, local events and practical news for staying in Korea.',
		placeholder: 'Search news and guides...',
	},
	HUMOR: {
		title: 'HUMOR BOARD',
		description:
			'Express your opinions freely here without content restrictions. Funny travel moments, ondol fails & delightful memes.',
		placeholder: 'Search funny stories...',
	},
};

interface CommunityCardProps {
	boardArticle: BoardArticle;
	likeArticleHandler: any;
	/** Kept for callers; the Stitch board card is the only layout now. */
	variant?: 'board';
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, likeArticleHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/banner/hero/community.jpg';

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
				<span className="sx-post-board">{boardLabels[boardArticle?.articleCategory] ?? boardArticle?.articleCategory}</span>
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
};

export default CommunityCard;
