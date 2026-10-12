import React, { useState } from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Link from 'next/link';
import EastIcon from '@mui/icons-material/East';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const articleImage = article?.articleImage ? `${process.env.REACT_APP_API_URL}/${article?.articleImage}` : '';

	const category = article?.articleCategory ?? '';
	const categoryLabel = category ? `${category.charAt(0)}${category.slice(1).toLowerCase()} Board` : 'Board';
	const views = `${(article?.articleViews ?? 0).toLocaleString('en-US')} views`;
	const href = `/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;
	const thumb =
		articleImage && failedImage !== articleImage ? (
			<img src={articleImage} alt="" loading="lazy" decoding="async" onError={() => setFailedImage(articleImage)} />
		) : (
			<span className={'article-placeholder'}>
				<ArticleOutlinedIcon aria-hidden="true" />
			</span>
		);

	if (vertical) {
		const preview = (article?.articleContent ?? '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/&nbsp;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		return (
			<Link href={href} className={'sx-article-featured'}>
				<span className={'sx-article-media'}>
					{thumb}
					<b className={'sx-article-rank'}>#{index + 1} Featured</b>
				</span>
				<span className={'sx-article-body'}>
					<span className={'sx-article-meta'}>
						{categoryLabel} · <Moment format="YYYY-MM-DD">{article?.createdAt}</Moment>
					</span>
					<strong>{article?.articleTitle}</strong>
					{preview && (
						<span className={'sx-article-preview'}>{preview.length > 140 ? `${preview.slice(0, 140)}…` : preview}</span>
					)}
					<span className={'sx-article-foot'}>
						<span className={'sx-article-views'}>
							<VisibilityOutlinedIcon aria-hidden="true" />
							{views}
						</span>
						<span className={'sx-article-read'}>
							Read article
							<EastIcon aria-hidden="true" />
						</span>
					</span>
				</span>
			</Link>
		);
	}

	return (
		<Link href={href} className={'sx-article-row'}>
			<span className={'sx-article-thumb'}>{thumb}</span>
			<span className={'sx-article-body'}>
				<span className={'sx-article-category'}>{category}</span>
				<strong>{article?.articleTitle}</strong>
				<span className={'sx-article-sub'}>
					<Moment format="YYYY-MM-DD">{article?.createdAt}</Moment> · {views}
				</span>
			</span>
		</Link>
	);
};

export default CommunityCard;
