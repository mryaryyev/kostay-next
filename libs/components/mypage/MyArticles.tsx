import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CommunityCard from '../common/CommunityCard';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { scrollToListTop } from '../../utils';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
		scrollToListTop('#my-page .main-config');
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticlesRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('Success!', 750);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="my-articles-page">
			<div className="sx-articles-head">
				<div>
					<h3>My Articles</h3>
					<p>Posts you shared with the Kostay community.</p>
				</div>
				<span>
					{totalCount ?? 0} {totalCount === 1 ? 'article' : 'articles'}
				</span>
			</div>
			{boardArticles?.length > 0 ? (
				<div className="sx-post-grid">
					{boardArticles.map((boardArticle: BoardArticle) => (
						<CommunityCard
							boardArticle={boardArticle}
							key={boardArticle?._id}
							likeArticleHandler={likeArticleHandler}
							variant={'board'}
						/>
					))}
				</div>
			) : (
				<div className="sx-articles-empty">
					<ArticleOutlinedIcon aria-hidden="true" />
					<p>You haven't written any articles yet.</p>
					<Link href={{ pathname: '/mypage', query: { category: 'writeArticle' } }} scroll={false}>
						Write your first article
					</Link>
				</div>
			)}
			{totalCount > searchCommunity.limit && (
				<Pagination
					className="sx-articles-pagination"
					count={Math.ceil(totalCount / searchCommunity.limit)}
					page={searchCommunity.page}
					shape="circular"
					onChange={paginationHandler}
				/>
			)}
		</div>
	);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
