import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import CommunityCard, { boardLabels } from '../../libs/components/common/CommunityCard';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
	});
	// Read straight from the query result: onCompleted does not fire reliably when variables change.
	const boardArticles: BoardArticle[] = boardArticlesData?.getBoardArticles?.list ?? [];
	const totalCount: number = boardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	// Per-board totals for the sidebar counters (limit 1: only metaCounter is read).
	const countQuery = (articleCategory: BoardArticleCategory) => ({
		fetchPolicy: 'cache-and-network' as const,
		variables: { input: { page: 1, limit: 1, search: { articleCategory } } },
	});
	const { data: freeCountData } = useQuery(GET_BOARD_ARTICLES, countQuery(BoardArticleCategory.FREE));
	const { data: recommendCountData } = useQuery(GET_BOARD_ARTICLES, countQuery(BoardArticleCategory.RECOMMEND));
	const { data: newsCountData } = useQuery(GET_BOARD_ARTICLES, countQuery(BoardArticleCategory.NEWS));
	const { data: humorCountData } = useQuery(GET_BOARD_ARTICLES, countQuery(BoardArticleCategory.HUMOR));
	const boardCounts: Record<string, number> = {
		FREE: freeCountData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0,
		RECOMMEND: recommendCountData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0,
		NEWS: newsCountData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0,
		HUMOR: humorCountData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0,
	};

	/** LIFECYCLES **/
	useEffect(() => {
		// Wait for hydration: before isReady the query is always empty, which used to force FREE on every deep link.
		if (!router.isReady) return;
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, [router.isReady]);

	// The URL category is only known after hydration; sync it into the inquiry so deep links open the right board.
	useEffect(() => {
		const category = query?.articleCategory as BoardArticleCategory | undefined;
		if (
			category &&
			Object.values(BoardArticleCategory).includes(category) &&
			category !== searchCommunity.search.articleCategory
		) {
			setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: category } });
		}
	}, [query?.articleCategory]);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		setSearchText('');
		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const activeBoard = searchCommunity.search.articleCategory;
	const activeMeta = boardMeta[activeBoard] ?? boardMeta.FREE;
	const pageCount = Math.ceil(totalCount / searchCommunity.limit);
	const goWrite = async () => {
		// Writing needs an account; tell logged-out visitors why instead of a silent bounce from /mypage.
		if (!user?._id) {
			await sweetMixinErrorAlert(Messages.error2, 2000);
			await router.push('/');
			return;
		}
		await router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	return (
		<div id="community-list-page">
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
									onClick={() => tabChangeHandler({}, category)}
								>
									<span>{boardLabels[category]}</span>
									<em>{boardCounts[category] ?? 0}</em>
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
							<h2>{activeMeta.title}</h2>
							<p>{activeMeta.description}</p>
						</div>
						<div className="sx-board-actions">
							<label className="sx-board-search">
								<SearchIcon aria-hidden="true" />
								<input
									type="text"
									placeholder={activeMeta.placeholder}
									aria-label={'Search articles'}
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											setSearchCommunity({
												...searchCommunity,
												page: 1,
												search: { ...searchCommunity.search, text: searchText },
											});
										}
									}}
								/>
							</label>
							<button type="button" className="sx-write" onClick={goWrite}>
								<EditNoteIcon aria-hidden="true" />
								Write
							</button>
						</div>
					</div>

					{boardArticlesLoading && boardArticles.length === 0 ? (
						<div className={'no-data'} role="status">
							Loading articles…
						</div>
					) : totalCount ? (
						<div className="sx-post-grid">
							{boardArticles?.map((boardArticle: BoardArticle) => (
								<CommunityCard
									boardArticle={boardArticle}
									key={boardArticle?._id}
									likeArticleHandler={likeArticleHandler}
									variant={'board'}
								/>
							))}
						</div>
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Article found!</p>
						</div>
					)}

					{totalCount > 0 && (
						<div className="sx-community-pagination">
							{pageCount > 1 && (
								<nav aria-label="Pagination">
									<button
										type="button"
										aria-label="Previous page"
										disabled={searchCommunity.page <= 1}
										onClick={() => paginationHandler({}, searchCommunity.page - 1)}
									>
										<ChevronLeftIcon />
									</button>
									{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
										<button
											type="button"
											key={page}
											className={page === searchCommunity.page ? 'is-active' : ''}
											aria-current={page === searchCommunity.page ? 'page' : undefined}
											onClick={() => paginationHandler({}, page)}
										>
											{page}
										</button>
									))}
									<button
										type="button"
										aria-label="Next page"
										disabled={searchCommunity.page >= pageCount}
										onClick={() => paginationHandler({}, searchCommunity.page + 1)}
									>
										<ChevronRightIcon />
									</button>
								</nav>
							)}
							<p>
								Total {totalCount} article{totalCount > 1 ? 's' : ''} available
							</p>
						</div>
					)}

					<div className="sx-share">
						<div className="sx-share-copy">
							<span aria-hidden="true">
								<RateReviewOutlinedIcon />
							</span>
							<div>
								<h3>Have a memorable moment from your Korean stay?</h3>
								<p>Whether an unexpected Hanok discovery or a subway turnstile mystery, fellow travelers want to hear it.</p>
							</div>
						</div>
						<button type="button" onClick={goWrite}>
							Share Your Experience
						</button>
					</div>
				</section>
			</div>
		</div>
	);
};

const boardMeta: Record<string, { title: string; description: string; placeholder: string }> = {
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

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
