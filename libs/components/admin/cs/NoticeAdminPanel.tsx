import React, { useState } from 'react';
import { Box, Button, Divider, InputAdornment, List, ListItem, MenuItem, OutlinedInput, Select, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { TabContext } from '@mui/lab';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import { CREATE_NOTICE, REMOVE_NOTICE, UPDATE_NOTICE } from '../../../../apollo/admin/mutation';
import { FaqGroup, faqGroupLabels, NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { Notice, Notices } from '../../../types/notice/notice';
import { AllNoticesInquiry, NoticeInput } from '../../../types/notice/notice.input';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { NoticeList } from './NoticeList';
import NoticeFormDialog from './NoticeFormDialog';

const statusTabs: { key: NoticeStatus | 'ALL'; label: string }[] = [
	{ key: 'ALL', label: 'All' },
	{ key: NoticeStatus.ACTIVE, label: 'Active' },
	{ key: NoticeStatus.HOLD, label: 'Hold' },
	{ key: NoticeStatus.DELETE, label: 'Deleted' },
];

/** Admin CS page body shared by Notice and FAQ: what is saved here is shown on /cs. */
const NoticeAdminPanel = ({ category }: { category: NoticeCategory }) => {
	const isFaq = category === NoticeCategory.FAQ;
	const [inquiry, setInquiry] = useState<AllNoticesInquiry>({ page: 1, limit: 10, search: { noticeCategory: category } });
	const [searchText, setSearchText] = useState<string>('');
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [editing, setEditing] = useState<Notice | null>(null);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [createNotice, { loading: creating }] = useMutation(CREATE_NOTICE);
	const [updateNotice, { loading: updating }] = useMutation(UPDATE_NOTICE);
	const [removeNotice] = useMutation(REMOVE_NOTICE);

	const result: Notices | undefined = data?.getAllNoticesByAdmin;
	const notices = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const counts = result?.statusCounter ?? [];
	const countOf = (key: NoticeStatus | 'ALL') =>
		key === 'ALL' ? counts.reduce((sum, item) => sum + item.count, 0) : counts.find((item) => item._id === key)?.count ?? 0;
	const activeTab = inquiry.search.noticeStatus ?? 'ALL';

	/** HANDLERS **/
	const updateSearch = (search: Partial<AllNoticesInquiry['search']>) =>
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, ...search } });

	const submitHandler = async (input: NoticeInput) => {
		try {
			if (editing) {
				const { noticeCategory, ...update } = input;
				await updateNotice({ variables: { input: { _id: editing._id, ...update } } });
			} else {
				await createNotice({ variables: { input } });
			}
			setDialogOpen(false);
			setEditing(null);
			await refetch();
			await sweetTopSmallSuccessAlert('Saved', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const statusChangeHandler = async (notice: Notice, noticeStatus: NoticeStatus) => {
		try {
			await updateNotice({ variables: { input: { _id: notice._id, noticeStatus } } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeHandler = async (notice: Notice) => {
		try {
			if (!(await sweetConfirmAlert('Remove this item permanently?'))) return;
			await removeNotice({ variables: { input: notice._id } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>{isFaq ? 'FAQ' : 'Notice'} Management</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => {
						setEditing(null);
						setDialogOpen(true);
					}}
				>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={activeTab}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{statusTabs.map((tab) => (
									<ListItem
										key={tab.key}
										onClick={() => updateSearch({ noticeStatus: tab.key === 'ALL' ? undefined : tab.key })}
										className={activeTab === tab.key ? 'li on' : 'li'}
									>
										{tab.label} ({countOf(tab.key)})
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								{isFaq && (
									<Select
										sx={{ width: '180px', mr: '20px' }}
										value={inquiry.search.faqGroup ?? 'ALL'}
										onChange={(e) =>
											updateSearch({ faqGroup: e.target.value === 'ALL' ? undefined : (e.target.value as FaqGroup) })
										}
									>
										<MenuItem value={'ALL'}>All groups</MenuItem>
										{Object.values(FaqGroup).map((group) => (
											<MenuItem key={group} value={group}>
												{faqGroupLabels[group]}
											</MenuItem>
										))}
									</Select>
								)}
								<OutlinedInput
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder={isFaq ? 'Search questions' : 'Search titles'}
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
						<NoticeList
							category={category}
							notices={notices}
							editHandler={(notice) => {
								setEditing(notice);
								setDialogOpen(true);
							}}
							statusChangeHandler={statusChangeHandler}
							removeHandler={removeHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40]}
							component="div"
							count={total}
							rowsPerPage={inquiry.limit}
							page={inquiry.page - 1}
							onPageChange={(_, page) => setInquiry({ ...inquiry, page: page + 1 })}
							onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
						/>
					</TabContext>
				</Box>
			</Box>

			<NoticeFormDialog
				open={dialogOpen}
				category={category}
				notice={editing}
				saving={creating || updating}
				onClose={() => {
					setDialogOpen(false);
					setEditing(null);
				}}
				onSubmit={submitHandler}
			/>
		</Box>
	);
};

export default NoticeAdminPanel;
