import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useQuery } from '@apollo/client';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { GET_NOTICES } from '../../../apollo/user/query';
import { FaqGroup, faqGroupLabels, NoticeCategory } from '../../enums/notice.enum';
import { Notice } from '../../types/notice/notice';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

/** CS → FAQ: questions written by the admin (FAQ Management), one tab per FAQ group. */
const Faq = () => {
	const device = useDeviceDetect();
	const [group, setGroup] = useState<FaqGroup>(FaqGroup.STAYS);
	const [expanded, setExpanded] = useState<string | false>(false);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, search: { noticeCategory: NoticeCategory.FAQ, faqGroup: group } } },
	});
	const questions: Notice[] = data?.getNotices?.list ?? [];

	/** HANDLERS **/
	const changeGroupHandler = (value: FaqGroup) => {
		setGroup(value);
		setExpanded(false);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					{Object.values(FaqGroup).map((item) => (
						<div key={item} className={group === item ? 'active' : ''} onClick={() => changeGroupHandler(item)}>
							{faqGroupLabels[item]}
						</div>
					))}
				</Box>
				<Box className={'wrap'} component={'div'}>
					{!loading && questions.length === 0 && <p className={'notice-empty'}>No questions in this group yet.</p>}
					{questions.map((question) => (
						<Accordion expanded={expanded === question._id} onChange={handleChange(question._id)} key={question._id}>
							<AccordionSummary className="question" aria-controls={`${question._id}-content`}>
								<Typography className="badge" variant={'h4'}>
									Q
								</Typography>
								<Typography> {question.noticeTitle}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Stack className={'answer flex-box'}>
									<Typography className="badge" variant={'h4'} color={'primary'}>
										A
									</Typography>
									<Typography> {question.noticeContent}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
