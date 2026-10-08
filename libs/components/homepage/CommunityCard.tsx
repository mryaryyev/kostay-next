import React, { useState } from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const device = useDeviceDetect();
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const articleImage = article?.articleImage ? `${process.env.REACT_APP_API_URL}/${article?.articleImage}` : '';

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	} else {
		const categoryLabel = article?.articleCategory
			? `${article.articleCategory.charAt(0)}${article.articleCategory.slice(1).toLowerCase()} Board`
			: 'Board';

		return (
			<Link
				href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
				className={`home-article ${vertical ? 'is-vertical' : 'is-horizontal'}`}
			>
				<span className={'article-thumb'}>
					{vertical && <b className={'article-rank'}>{index + 1}</b>}
					{articleImage && failedImage !== articleImage ? (
						<img src={articleImage} alt="" loading="lazy" decoding="async" onError={() => setFailedImage(articleImage)} />
					) : (
						<span className={'article-placeholder'}>
							<ArticleOutlinedIcon aria-hidden="true" />
						</span>
					)}
				</span>
				<span className={'article-body'}>
					<strong>{article?.articleTitle}</strong>
					<span>
						{vertical ? categoryLabel : <Moment format="YYYY-MM-DD">{article?.createdAt}</Moment>} ·{' '}
						{article?.articleViews ?? 0} views
					</span>
				</span>
			</Link>
		);
	}
};

export default CommunityCard;
