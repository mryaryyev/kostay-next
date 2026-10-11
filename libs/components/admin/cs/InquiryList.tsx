import React from 'react';
import {
	Button,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Moment from 'react-moment';
import { Inquiry } from '../../../types/inquiry/inquiry';
import { InquiryStatus, inquiryStatusLabels, inquiryTopicLabels } from '../../../enums/inquiry.enum';
import { REACT_APP_API_URL } from '../../../config';

interface InquiryListProps {
	inquiries: Inquiry[];
	answerHandler: (inquiry: Inquiry) => void;
	statusChangeHandler: (inquiry: Inquiry, status: InquiryStatus) => void;
}

const columns = ['TOPIC', 'QUESTION', 'MEMBER', 'ASKED', 'STATUS', 'ACTION'];

/** Table for the 1:1 Inquiry admin page. */
export const InquiryList = ({ inquiries, answerHandler, statusChangeHandler }: InquiryListProps) => {
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
						{inquiries.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={columns.length}>
									<span className={'no-data'}>No inquiries here.</span>
								</TableCell>
							</TableRow>
						)}

						{inquiries.map((inquiry) => (
							<TableRow hover key={inquiry._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell align="left">{inquiryTopicLabels[inquiry.inquiryTopic]}</TableCell>
								<TableCell align="left" sx={{ maxWidth: 380 }}>
									<Typography variant={'body2'} sx={{ fontWeight: 600 }}>
										{inquiry.inquiryTitle}
									</Typography>
									<Typography variant={'caption'} color={'text.secondary'} noWrap component={'p'}>
										{inquiry.inquiryContent}
									</Typography>
								</TableCell>
								<TableCell align="left">
									<Stack direction={'row'} alignItems={'center'} gap={1}>
										<Avatar
											alt={inquiry.memberData?.memberNick}
											src={
												inquiry.memberData?.memberImage
													? `${REACT_APP_API_URL}/${inquiry.memberData.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
											sx={{ width: 28, height: 28 }}
										/>
										<span>
											{inquiry.memberData?.memberNick ?? '—'}
											<Typography variant={'caption'} color={'text.secondary'} component={'p'}>
												{inquiry.memberData?.memberType}
											</Typography>
										</span>
									</Stack>
								</TableCell>
								<TableCell align="left">
									<Moment format={'YYYY.MM.DD HH:mm'}>{inquiry.createdAt}</Moment>
								</TableCell>
								<TableCell align="left">
									<Select
										size={'small'}
										value={inquiry.inquiryStatus}
										onChange={(e) => statusChangeHandler(inquiry, e.target.value as InquiryStatus)}
									>
										{Object.values(InquiryStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{inquiryStatusLabels[status]}
											</MenuItem>
										))}
									</Select>
								</TableCell>
								<TableCell align="right">
									<Button
										size={'small'}
										variant={inquiry.inquiryStatus === InquiryStatus.WAITING ? 'contained' : 'outlined'}
										disabled={inquiry.inquiryStatus === InquiryStatus.CLOSED}
										onClick={() => answerHandler(inquiry)}
									>
										{inquiry.answerContent ? 'Edit answer' : 'Answer'}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
