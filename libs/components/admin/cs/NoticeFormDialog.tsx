import React, { useEffect, useState } from 'react';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	MenuItem,
	Stack,
	TextField,
} from '@mui/material';
import { FaqGroup, faqGroupLabels, NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { Notice } from '../../../types/notice/notice';
import { NoticeInput } from '../../../types/notice/notice.input';

interface NoticeFormDialogProps {
	open: boolean;
	category: NoticeCategory;
	/** Item being edited; empty for "+ ADD". */
	notice?: Notice | null;
	saving?: boolean;
	onClose: () => void;
	onSubmit: (input: NoticeInput) => void;
}

const emptyForm = (category: NoticeCategory): NoticeInput => ({
	noticeCategory: category,
	noticeTitle: '',
	noticeContent: '',
	noticeStatus: NoticeStatus.ACTIVE,
	...(category === NoticeCategory.FAQ ? { faqGroup: FaqGroup.STAYS } : { noticeEvent: false }),
});

/** One form for create and edit, used by the Notice and FAQ admin pages. */
const NoticeFormDialog = ({ open, category, notice, saving, onClose, onSubmit }: NoticeFormDialogProps) => {
	const [form, setForm] = useState<NoticeInput>(emptyForm(category));
	const isFaq = category === NoticeCategory.FAQ;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!open) return;
		setForm(
			notice
				? {
						noticeCategory: category,
						noticeTitle: notice.noticeTitle,
						noticeContent: notice.noticeContent,
						noticeStatus: notice.noticeStatus,
						...(isFaq ? { faqGroup: notice.faqGroup ?? FaqGroup.STAYS } : { noticeEvent: notice.noticeEvent }),
				  }
				: emptyForm(category),
		);
	}, [open, notice, category]);

	const titleError = form.noticeTitle.trim().length > 0 && form.noticeTitle.trim().length < 3;
	const contentError = form.noticeContent.trim().length > 0 && form.noticeContent.trim().length < 3;
	const invalid = form.noticeTitle.trim().length < 3 || form.noticeContent.trim().length < 3;

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth={'sm'}>
			<DialogTitle>
				{notice ? 'Edit' : 'Add'} {isFaq ? 'question' : 'notice'}
			</DialogTitle>
			<DialogContent>
				<Stack spacing={2.5} sx={{ pt: 1 }}>
					{isFaq && (
						<TextField
							select
							label={'FAQ group'}
							value={form.faqGroup}
							onChange={(e) => setForm({ ...form, faqGroup: e.target.value as FaqGroup })}
						>
							{Object.values(FaqGroup).map((group) => (
								<MenuItem key={group} value={group}>
									{faqGroupLabels[group]}
								</MenuItem>
							))}
						</TextField>
					)}
					<TextField
						label={isFaq ? 'Question' : 'Title'}
						value={form.noticeTitle}
						onChange={(e) => setForm({ ...form, noticeTitle: e.target.value })}
						error={titleError}
						helperText={titleError ? 'At least 3 characters' : `${form.noticeTitle.length}/150`}
						inputProps={{ maxLength: 150 }}
						autoFocus
					/>
					<TextField
						label={isFaq ? 'Answer' : 'Content'}
						value={form.noticeContent}
						onChange={(e) => setForm({ ...form, noticeContent: e.target.value })}
						error={contentError}
						helperText={contentError ? 'At least 3 characters' : `${form.noticeContent.length}/2000`}
						inputProps={{ maxLength: 2000 }}
						multiline
						minRows={5}
					/>
					<TextField
						select
						label={'Status'}
						value={form.noticeStatus}
						onChange={(e) => setForm({ ...form, noticeStatus: e.target.value as NoticeStatus })}
						helperText={'Only ACTIVE items are shown on the CS page.'}
					>
						{Object.values(NoticeStatus).map((status) => (
							<MenuItem key={status} value={status}>
								{status}
							</MenuItem>
						))}
					</TextField>
					{!isFaq && (
						<FormControlLabel
							control={
								<Checkbox
									checked={Boolean(form.noticeEvent)}
									onChange={(e) => setForm({ ...form, noticeEvent: e.target.checked })}
								/>
							}
							label={'Event (pinned on top with an event badge)'}
						/>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant={'contained'}
					disabled={invalid || saving}
					onClick={() =>
						onSubmit({ ...form, noticeTitle: form.noticeTitle.trim(), noticeContent: form.noticeContent.trim() })
					}
				>
					{saving ? 'Saving…' : 'Save'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NoticeFormDialog;
