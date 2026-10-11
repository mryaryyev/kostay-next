import React, { useState } from 'react';
import { Stack, Box, Pagination } from '@mui/material';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory } from '../../enums/notice.enum';
import { Notice as NoticeType } from '../../types/notice/notice';

const PAGE_LIMIT = 10;

/** CS → Notice: written by the admin (Notice Management); event notices are pinned on top. */
const Notice = () => {
	const device = useDeviceDetect();
	const [page, setPage] = useState<number>(1);
	const [openId, setOpenId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: PAGE_LIMIT, search: { noticeCategory: NoticeCategory.NOTICE } } },
	});
	const notices: NoticeType[] = data?.getNotices?.list ?? [];
	const total: number = data?.getNotices?.metaCounter?.[0]?.total ?? 0;

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<span className={'title'}>Notice</span>
				<Stack className={'main'}>
					<Box component={'div'} className={'top'}>
						<span>number</span>
						<span>title</span>
						<span>date</span>
					</Box>
					<Stack className={'bottom'}>
						{!loading && notices.length === 0 && <p className={'notice-empty'}>No notices yet.</p>}
						{notices.map((notice, index) => {
							const open = openId === notice._id;
							return (
								<div className={'notice-item'} key={notice._id}>
									<button
										type={'button'}
										className={`notice-card ${notice.noticeEvent ? 'event' : ''}`}
										aria-expanded={open}
										onClick={() => setOpenId(open ? null : notice._id)}
									>
										{notice.noticeEvent ? (
											<div>event</div>
										) : (
											<span className={'notice-number'}>{total - ((page - 1) * PAGE_LIMIT + index)}</span>
										)}
										<span className={'notice-title'}>{notice.noticeTitle}</span>
										<span className={'notice-date'}>{moment(notice.createdAt).format('YYYY.MM.DD')}</span>
									</button>
									{open && <p className={'notice-body'}>{notice.noticeContent}</p>}
								</div>
							);
						})}
					</Stack>
				</Stack>
				{total > PAGE_LIMIT && (
					<Pagination
						className={'notice-pagination'}
						page={page}
						count={Math.ceil(total / PAGE_LIMIT)}
						onChange={(_, value) => {
							setPage(value);
							setOpenId(null);
						}}
						shape="circular"
					/>
				)}
			</Stack>
		);
	}
};

export default Notice;
