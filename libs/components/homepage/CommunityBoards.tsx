import SectionHeader from './SectionHeader';
import EastIcon from '@mui/icons-material/East';
import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getNewsArticlesLoading,
		data: getNewsArticlesData,
		error: getNewsArticlesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.NEWS } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewsArticles(data?.getBoardArticles?.list);
		},
	});

	const {
		loading: getFreeArticlesLoading,
		data: getFreeArticlesData,
		error: getFreeArticlesError,
		refetch: getFreeArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 3, search: { articleCategory: BoardArticleCategory.FREE } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list);
		},
	});

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<section className={'community-board'}>
				<div className={'container'}>
					<SectionHeader
						eyebrow={'From guests'}
						title={'Community'}
						subtitle={'Travel notes and news from the Kostay community'}
						action={
							<Link href={'/community'} className={'home-link'}>
								All articles
								<EastIcon aria-hidden="true" />
							</Link>
						}
					/>
					<div className={'community-columns'}>
						<div className={'community-column'}>
							<Link href={'/community?articleCategory=NEWS'} className={'column-title'}>
								News
							</Link>
							<div className={'article-list is-two-col'}>
								{newsArticles.length === 0 ? (
									<p className={'empty-list'}>No news yet</p>
								) : (
									newsArticles.map((article, index) => (
										<CommunityCard vertical={true} article={article} index={index} key={article?._id} />
									))
								)}
							</div>
						</div>
						<div className={'community-column'}>
							<Link href={'/community?articleCategory=FREE'} className={'column-title'}>
								Free board
							</Link>
							<div className={'article-list'}>
								{freeArticles.length === 0 ? (
									<p className={'empty-list'}>No posts yet</p>
								) : (
									freeArticles.map((article, index) => (
										<CommunityCard vertical={false} article={article} index={index} key={article?._id} />
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
};

export default CommunityBoards;
