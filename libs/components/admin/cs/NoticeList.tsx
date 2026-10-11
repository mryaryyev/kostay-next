import React from 'react';
import {
	IconButton,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Moment from 'react-moment';
import { Notice } from '../../../types/notice/notice';
import { faqGroupLabels, NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { REACT_APP_API_URL } from '../../../config';

interface NoticeListProps {
	category: NoticeCategory;
	notices: Notice[];
	editHandler: (notice: Notice) => void;
	statusChangeHandler: (notice: Notice, status: NoticeStatus) => void;
	removeHandler: (notice: Notice) => void;
}

/** Table for the Notice and FAQ admin pages. */
export const NoticeList = ({ category, notices, editHandler, statusChangeHandler, removeHandler }: NoticeListProps) => {
	const isFaq = category === NoticeCategory.FAQ;
	const columns = isFaq
		? ['GROUP', 'QUESTION', 'WRITER', 'DATE', 'STATUS', 'ACTION']
		: ['TITLE', 'WRITER', 'DATE', 'VIEWS', 'STATUS', 'ACTION'];

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={column} align={column === 'ACTION' ? 'right' : 'left'}>
									{column}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{notices.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={columns.length}>
									<span className={'no-data'}>No {isFaq ? 'questions' : 'notices'} yet. Use + ADD to write one.</span>
								</TableCell>
							</TableRow>
						)}

						{notices.map((notice) => (
							<TableRow hover key={notice._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								{isFaq && <TableCell align="left">{notice.faqGroup ? faqGroupLabels[notice.faqGroup] : '—'}</TableCell>}
								<TableCell align="left" sx={{ maxWidth: 420 }}>
									<Typography variant={'body2'} sx={{ fontWeight: 600 }}>
										{!isFaq && notice.noticeEvent && (
											<span style={{ color: '#aa3614', marginRight: 6, fontWeight: 800 }}>[EVENT]</span>
										)}
										{notice.noticeTitle}
									</Typography>
									<Typography variant={'caption'} color={'text.secondary'} noWrap component={'p'}>
										{notice.noticeContent}
									</Typography>
								</TableCell>
								<TableCell align="left">
									<Stack direction={'row'} alignItems={'center'} gap={1}>
										<Avatar
											alt={notice.memberData?.memberNick}
											src={notice.memberData?.memberImage ? `${REACT_APP_API_URL}/${notice.memberData.memberImage}` : '/img/profile/defaultUser.svg'}
											sx={{ width: 28, height: 28 }}
										/>
										{notice.memberData?.memberNick ?? '—'}
									</Stack>
								</TableCell>
								<TableCell align="left">
									<Moment format={'YYYY.MM.DD'}>{notice.createdAt}</Moment>
								</TableCell>
								{!isFaq && <TableCell align="left">{notice.noticeViews}</TableCell>}
								<TableCell align="left">
									<Select
										size={'small'}
										value={notice.noticeStatus}
										onChange={(e) => statusChangeHandler(notice, e.target.value as NoticeStatus)}
									>
										{Object.values(NoticeStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{status}
											</MenuItem>
										))}
									</Select>
								</TableCell>
								<TableCell align="right">
									<Tooltip title={'Edit'}>
										<IconButton onClick={() => editHandler(notice)}>
											<EditOutlinedIcon />
										</IconButton>
									</Tooltip>
									{notice.noticeStatus === NoticeStatus.DELETE && (
										<Tooltip title={'Remove permanently'}>
											<IconButton onClick={() => removeHandler(notice)}>
												<DeleteIcon />
											</IconButton>
										</Tooltip>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
