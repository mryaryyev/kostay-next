import React, { useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory } from '../../enums/notice.enum';
import { Notice as NoticeType } from '../../types/notice/notice';

const PAGE_LIMIT = 10;

/** CS → Notice: written by the admin (Notice Management); event notices are pinned on top. */
const Notice = ({ text }: { text: string }) => {
	const device = useDeviceDetect();
	const [page, setPage] = useState<number>(1);
	const [openId, setOpenId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page, limit: PAGE_LIMIT, search: { noticeCategory: NoticeCategory.NOTICE, ...(text ? { text } : {}) } },
		},
	});
	const notices: NoticeType[] = data?.getNotices?.list ?? [];
	const total: number = data?.getNotices?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		setPage(1);
		setOpenId(null);
	}, [text]);

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<section className="sx-cs-panel">
				<header className="sx-cs-panel-head">
					<h2>Notices</h2>
					<span>{total} {total === 1 ? 'notice' : 'notices'}</span>
				</header>

				{!loading && notices.length === 0 ? (
					<div className="sx-cs-empty">
						<CampaignOutlinedIcon aria-hidden="true" />
						<strong>{text ? 'No notices match your search' : 'No notices yet'}</strong>
					</div>
				) : (
					<ul className="sx-notice-list">
						{notices.map((notice, index) => {
							const open = openId === notice._id;
							return (
								<li key={notice._id} className={`${open ? 'is-open' : ''} ${notice.noticeEvent ? 'is-event' : ''}`}>
									<button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : notice._id)}>
										{notice.noticeEvent ? (
											<em className="sx-notice-badge">Event</em>
										) : (
											<span className="sx-notice-no">{total - ((page - 1) * PAGE_LIMIT + index)}</span>
										)}
										<strong>{notice.noticeTitle}</strong>
										<time>{moment(notice.createdAt).format('MMM D, YYYY')}</time>
										<ExpandMoreRoundedIcon aria-hidden="true" />
									</button>
									{open && <p className="sx-notice-body">{notice.noticeContent}</p>}
								</li>
							);
						})}
					</ul>
				)}

				{total > PAGE_LIMIT && (
					<Pagination
						className="sx-cs-pagination"
						page={page}
						count={Math.ceil(total / PAGE_LIMIT)}
						onChange={(_, value) => {
							setPage(value);
							setOpenId(null);
						}}
						shape="circular"
					/>
				)}
			</section>
		);
	}
};

export default Notice;
