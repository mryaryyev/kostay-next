import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { GET_NOTICES } from '../../../apollo/user/query';
import { FaqGroup, faqGroupLabels, NoticeCategory } from '../../enums/notice.enum';
import { Notice } from '../../types/notice/notice';
import { csItemId, useLinkedItem } from '../../hooks/useLinkedItem';

/**
 * CS → FAQ: questions written by the admin (FAQ Management), one chip per FAQ group.
 * `linkedId` (from "/help?tab=faq&faq=<id>") opens that question in its own group.
 */
const Faq = ({ text, linkedId }: { text: string; linkedId?: string }) => {
	const [group, setGroup] = useState<FaqGroup>(FaqGroup.STAYS);
	const [openId, setOpenId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	// A search looks through every group; otherwise only the selected group is shown.
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 100,
				search: { noticeCategory: NoticeCategory.FAQ, ...(text ? { text } : { faqGroup: group }) },
			},
		},
	});
	const questions: Notice[] = data?.getNotices?.list ?? [];

	// A linked question can be in any group: look it up among all FAQs once, to pick its group.
	const { data: allData } = useQuery(GET_NOTICES, {
		skip: !linkedId,
		variables: { input: { page: 1, limit: 100, search: { noticeCategory: NoticeCategory.FAQ } } },
	});
	const linkedGroup = (allData?.getNotices?.list as Notice[] | undefined)?.find((q) => q._id === linkedId)?.faqGroup;

	/** LIFECYCLES **/
	useEffect(() => setOpenId(null), [group, text]);
	useEffect(() => {
		if (linkedGroup) setGroup(linkedGroup);
	}, [linkedGroup]);
	const highlighted = useLinkedItem(
		linkedId,
		questions.map((q) => q._id),
		setOpenId,
	);

	return (
		<section className="sx-cs-panel">
			<header className="sx-cs-panel-head">
				<h2>{text ? `Results for “${text}”` : 'Frequently asked questions'}</h2>
				<span>
					{questions.length} {questions.length === 1 ? 'question' : 'questions'}
				</span>
			</header>

			{!text && (
				<div className="sx-faq-groups" role="tablist" aria-label="FAQ groups">
					{Object.values(FaqGroup).map((item) => (
						<button
							type="button"
							role="tab"
							key={item}
							aria-selected={group === item}
							className={group === item ? 'active' : ''}
							onClick={() => setGroup(item)}
						>
							{faqGroupLabels[item]}
						</button>
					))}
				</div>
			)}

			{!loading && questions.length === 0 ? (
				<div className="sx-cs-empty">
					<HelpOutlineRoundedIcon aria-hidden="true" />
					<strong>{text ? 'No questions match your search' : 'No questions in this group yet'}</strong>
				</div>
			) : (
				<ul className="sx-faq-list">
					{questions.map((question) => {
						const open = openId === question._id;
						return (
							<li
								key={question._id}
								id={csItemId(question._id)}
								className={`${open ? 'is-open' : ''} ${highlighted === question._id ? 'is-linked' : ''}`}
							>
								<button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : question._id)}>
									<em>Q</em>
									<strong>{question.noticeTitle}</strong>
									{text && question.faqGroup && <small>{faqGroupLabels[question.faqGroup]}</small>}
									<AddRoundedIcon aria-hidden="true" />
								</button>
								{open && (
									<div className="sx-faq-answer">
										<em>A</em>
										<p>{question.noticeContent}</p>
									</div>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
};

export default Faq;
