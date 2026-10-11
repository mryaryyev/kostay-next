import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Box, Divider, InputAdornment, List, ListItem, MenuItem, OutlinedInput, Select, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { TabContext } from '@mui/lab';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { InquiryList } from '../../../libs/components/admin/cs/InquiryList';
import InquiryAnswerDialog from '../../../libs/components/admin/cs/InquiryAnswerDialog';
import { GET_ALL_INQUIRIES_BY_ADMIN } from '../../../apollo/admin/query';
import { ANSWER_INQUIRY, UPDATE_INQUIRY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { InquiryStatus, inquiryStatusLabels, InquiryTopic, inquiryTopicLabels } from '../../../libs/enums/inquiry.enum';
import { Inquiries, Inquiry } from '../../../libs/types/inquiry/inquiry';
import { AllInquiriesInquiry } from '../../../libs/types/inquiry/inquiry.input';
import { sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

const statusTabs: (InquiryStatus | 'ALL')[] = [
	'ALL',
	InquiryStatus.WAITING,
	InquiryStatus.ANSWERED,
	InquiryStatus.CLOSED,
];

/** 1:1 Inquiry: questions sent from the Help page; answering notifies the member. */
const AdminInquiry: NextPage = () => {
	const [inquiry, setInquiry] = useState<AllInquiriesInquiry>({ page: 1, limit: 10, search: {} });
	const [searchText, setSearchText] = useState<string>('');
	const [answering, setAnswering] = useState<Inquiry | null>(null);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	// Refresh the sidebar badge after an answer or a status change.
	const [answerInquiry, { loading: saving }] = useMutation(ANSWER_INQUIRY, {
		refetchQueries: ['GetWaitingInquiryCount'],
	});
	const [updateInquiryByAdmin] = useMutation(UPDATE_INQUIRY_BY_ADMIN, { refetchQueries: ['GetWaitingInquiryCount'] });

	const result: Inquiries | undefined = data?.getAllInquiriesByAdmin;
	const counts = result?.statusCounter ?? [];
	const countOf = (key: InquiryStatus | 'ALL') =>
		key === 'ALL'
			? counts.reduce((sum, item) => sum + item.count, 0)
			: counts.find((item) => item._id === key)?.count ?? 0;
	const activeTab = inquiry.search.inquiryStatus ?? 'ALL';

	/** HANDLERS **/
	const updateSearch = (search: Partial<AllInquiriesInquiry['search']>) =>
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, ...search } });

	const answerHandler = async (answerContent: string) => {
		if (!answering) return;
		try {
			await answerInquiry({ variables: { input: { _id: answering._id, answerContent } } });
			setAnswering(null);
			await refetch();
			await sweetTopSmallSuccessAlert('Answer sent', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const statusChangeHandler = async (target: Inquiry, inquiryStatus: InquiryStatus) => {
		try {
			await updateInquiryByAdmin({ variables: { input: { _id: target._id, inquiryStatus } } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				1:1 Inquiry Management
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={activeTab}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{statusTabs.map((tab) => (
									<ListItem
										key={tab}
										onClick={() => updateSearch({ inquiryStatus: tab === 'ALL' ? undefined : tab })}
										className={activeTab === tab ? 'li on' : 'li'}
									>
										{tab === 'ALL' ? 'All' : inquiryStatusLabels[tab]} ({countOf(tab)})
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select
									sx={{ width: '180px', mr: '20px' }}
									value={inquiry.search.inquiryTopic ?? 'ALL'}
									onChange={(e) =>
										updateSearch({ inquiryTopic: e.target.value === 'ALL' ? undefined : (e.target.value as InquiryTopic) })
									}
								>
									<MenuItem value={'ALL'}>All topics</MenuItem>
									{Object.values(InquiryTopic).map((topic) => (
										<MenuItem key={topic} value={topic}>
											{inquiryTopicLabels[topic]}
										</MenuItem>
									))}
								</Select>
								<OutlinedInput
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder={'Search questions'}
									onKeyDown={(event) => {
										if (event.key === 'Enter') updateSearch({ text: searchText.trim() || undefined });
									}}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer' }}
													onClick={() => {
														setSearchText('');
														updateSearch({ text: undefined });
													}}
												/>
											)}
											<InputAdornment
												position="end"
												style={{ cursor: 'pointer' }}
												onClick={() => updateSearch({ text: searchText.trim() || undefined })}
											>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
							</Stack>
							<Divider />
						</Box>
						<InquiryList
							inquiries={result?.list ?? []}
							answerHandler={setAnswering}
							statusChangeHandler={statusChangeHandler}
						/>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40]}
							component="div"
							count={result?.metaCounter?.[0]?.total ?? 0}
							rowsPerPage={inquiry.limit}
							page={inquiry.page - 1}
							onPageChange={(_, page) => setInquiry({ ...inquiry, page: page + 1 })}
							onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
						/>
					</TabContext>
				</Box>
			</Box>

			<InquiryAnswerDialog
				inquiry={answering}
				saving={saving}
				onClose={() => setAnswering(null)}
				onSubmit={answerHandler}
			/>
		</Box>
	);
};

export default withAdminLayout(AdminInquiry);
