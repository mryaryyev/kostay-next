import React from 'react';
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
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	} else {
		return (
			<Link
				href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
				className={`home-article${vertical ? ' is-ranked' : ''}`}
			>
				<span className={'article-thumb'} style={{ backgroundImage: `url(${articleImage})` }}>
					{vertical && <b>{index + 1}</b>}
				</span>
				<span className={'article-body'}>
					<strong>{article?.articleTitle}</strong>
					<span>
						<Moment format="YYYY-MM-DD">{article?.createdAt}</Moment> · {article?.articleViews ?? 0} views
					</span>
				</span>
			</Link>
		);
	}
};

export default CommunityCard;
