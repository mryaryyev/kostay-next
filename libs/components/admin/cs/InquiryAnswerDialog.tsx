import React, { useEffect, useState } from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { Inquiry } from '../../../types/inquiry/inquiry';
import { inquiryTopicLabels } from '../../../enums/inquiry.enum';

interface InquiryAnswerDialogProps {
	inquiry: Inquiry | null;
	saving?: boolean;
	onClose: () => void;
	onSubmit: (answerContent: string) => void;
}

/** Shows the member's question and saves (or edits) the answer. */
const InquiryAnswerDialog = ({ inquiry, saving, onClose, onSubmit }: InquiryAnswerDialogProps) => {
	const [answer, setAnswer] = useState<string>('');

	/** LIFECYCLES **/
	useEffect(() => {
		setAnswer(inquiry?.answerContent ?? '');
	}, [inquiry]);

	const tooShort = answer.trim().length < 3;

	return (
		<Dialog open={Boolean(inquiry)} onClose={onClose} fullWidth maxWidth={'sm'}>
			<DialogTitle>{inquiry?.answerContent ? 'Edit answer' : 'Answer inquiry'}</DialogTitle>
			{inquiry && (
				<DialogContent>
					<Stack spacing={2} sx={{ pt: 1 }}>
						<Stack direction={'row'} spacing={1} alignItems={'center'}>
							<Chip size={'small'} label={inquiryTopicLabels[inquiry.inquiryTopic]} />
							<Typography variant={'caption'} color={'text.secondary'}>
								{inquiry.memberData?.memberFullName || inquiry.memberData?.memberNick} ({inquiry.memberData?.memberType}) ·{' '}
								{moment(inquiry.createdAt).format('YYYY.MM.DD HH:mm')}
							</Typography>
						</Stack>
						<Typography variant={'subtitle1'} sx={{ fontWeight: 700 }}>
							{inquiry.inquiryTitle}
						</Typography>
						<Typography variant={'body2'} sx={{ whiteSpace: 'pre-line', p: 2, bgcolor: '#f7f3ed', borderRadius: 2 }}>
							{inquiry.inquiryContent}
						</Typography>
						{/* Plain textarea: the MUI multiline field collapsed and put the caret above it inside the admin layout. */}
						<label className={'inquiry-answer-field'}>
							<span>Answer</span>
							<textarea
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
								rows={7}
								maxLength={2000}
								placeholder={'Write your answer to the member…'}
								autoFocus
							/>
							<small>{answer.length}/2000 · the member gets a notification</small>
						</label>
					</Stack>
				</DialogContent>
			)}
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose}>Cancel</Button>
				<Button variant={'contained'} disabled={tooShort || saving} onClick={() => onSubmit(answer.trim())}>
					{saving ? 'Sending…' : 'Send answer'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InquiryAnswerDialog;
