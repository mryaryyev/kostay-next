import React, { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import moment from 'moment';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { GET_MY_INQUIRIES } from '../../../apollo/user/query';
import { CREATE_INQUIRY, REMOVE_MY_INQUIRY } from '../../../apollo/user/mutation';
import { InquiryStatus, inquiryStatusLabels, InquiryTopic, inquiryTopicLabels } from '../../enums/inquiry.enum';
import { Inquiry as InquiryType } from '../../types/inquiry/inquiry';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const PAGE_LIMIT = 5;
const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

/** CS → Inquiry: a member asks the Kostay team; the admin answers on the 1:1 Inquiry page and the member is notified. */
const Inquiry = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [topic, setTopic] = useState<InquiryTopic>(InquiryTopic.BOOKING);
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const [openId, setOpenId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_MY_INQUIRIES, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user?._id,
	});
	const [createInquiry, { loading: sending }] = useMutation(CREATE_INQUIRY);
	const [removeMyInquiry] = useMutation(REMOVE_MY_INQUIRY);

	const inquiries: InquiryType[] = data?.getMyInquiries?.list ?? [];
	const total: number = data?.getMyInquiries?.metaCounter?.[0]?.total ?? 0;
	const titleOk = title.trim().length >= 3;
	const contentOk = content.trim().length >= 10;

	/** HANDLERS **/
	const submitHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!titleOk || !contentOk) return;
		try {
			await createInquiry({
				variables: { input: { inquiryTopic: topic, inquiryTitle: title.trim(), inquiryContent: content.trim() } },
			});
			setTitle('');
			setContent('');
			setPage(1);
			await refetch({ input: { page: 1, limit: PAGE_LIMIT } });
			await sweetTopSmallSuccessAlert('Your question was sent', 1200);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const removeHandler = async (inquiry: InquiryType) => {
		if (!(await sweetConfirmAlert('Withdraw this question?'))) return;
		try {
			await removeMyInquiry({ variables: { input: inquiry._id } });
			await refetch();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (device === 'mobile') {
		return <div>INQUIRY MOBILE</div>;
	}

	if (!user?._id) {
		return (
			<section className="sx-cs-panel">
				<div className="sx-cs-empty">
					<SupportAgentOutlinedIcon aria-hidden="true" />
					<strong>Log in to ask the Kostay team a question</strong>
					<p>
						Your questions and our answers are kept here. <Link href="/account/join">Log in or sign up</Link>
					</p>
				</div>
			</section>
		);
	}

	return (
		<>
			<section className="sx-cs-panel">
				<header className="sx-cs-panel-head">
					<h2>Ask the Kostay team</h2>
					<span>We usually answer within a day</span>
				</header>
				<form className="sx-inquiry-form" onSubmit={submitHandler}>
					<div className="sx-inquiry-topics" role="radiogroup" aria-label="Topic">
						{Object.values(InquiryTopic).map((item) => (
							<button
								type="button"
								role="radio"
								key={item}
								aria-checked={topic === item}
								className={topic === item ? 'active' : ''}
								onClick={() => setTopic(item)}
							>
								{inquiryTopicLabels[item]}
							</button>
						))}
					</div>
					<label>
						<span>Title</span>
						<input
							value={title}
							maxLength={TITLE_MAX}
							placeholder="e.g. Can I change the dates of my booking?"
							onChange={(e) => setTitle(e.target.value)}
						/>
					</label>
					<label>
						<span>Your question</span>
						<textarea
							value={content}
							maxLength={CONTENT_MAX}
							rows={5}
							placeholder="Tell us what happened. Add the stay name and dates if it is about a booking."
							onChange={(e) => setContent(e.target.value)}
						/>
						<small>
							{content.length}/{CONTENT_MAX}
							{content.length > 0 && !contentOk && ' · at least 10 characters'}
						</small>
					</label>
					<button type="submit" className="sx-inquiry-send" disabled={!titleOk || !contentOk || sending}>
						<SendOutlinedIcon aria-hidden="true" />
						{sending ? 'Sending…' : 'Send question'}
					</button>
				</form>
			</section>

			<section className="sx-cs-panel">
				<header className="sx-cs-panel-head">
					<h2>My questions</h2>
					<span>
						{total} {total === 1 ? 'question' : 'questions'}
					</span>
				</header>

				{!loading && inquiries.length === 0 ? (
					<div className="sx-cs-empty">
						<SupportAgentOutlinedIcon aria-hidden="true" />
						<strong>You have not asked anything yet</strong>
					</div>
				) : (
					<ul className="sx-notice-list sx-inquiry-list">
						{inquiries.map((inquiry) => {
							const open = openId === inquiry._id;
							return (
								<li key={inquiry._id} className={open ? 'is-open' : ''}>
									<button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : inquiry._id)}>
										<em className={`sx-inquiry-status is-${inquiry.inquiryStatus.toLowerCase()}`}>
											{inquiryStatusLabels[inquiry.inquiryStatus]}
										</em>
										<strong>{inquiry.inquiryTitle}</strong>
										<small>{inquiryTopicLabels[inquiry.inquiryTopic]}</small>
										<time>{moment(inquiry.createdAt).format('MMM D, YYYY')}</time>
										<ExpandMoreRoundedIcon aria-hidden="true" />
									</button>
									{open && (
										<div className="sx-inquiry-thread">
											<div className="sx-inquiry-q">
												<span>You asked</span>
												<p>{inquiry.inquiryContent}</p>
											</div>
											{inquiry.answerContent ? (
												<div className="sx-inquiry-a">
													<span>Kostay Help · {moment(inquiry.answeredAt).format('MMM D, YYYY HH:mm')}</span>
													<p>{inquiry.answerContent}</p>
												</div>
											) : (
												<p className="sx-inquiry-wait">No answer yet. You will get a notification when we reply.</p>
											)}
											{inquiry.inquiryStatus === InquiryStatus.WAITING && (
												<button type="button" className="sx-inquiry-remove" onClick={() => removeHandler(inquiry)}>
													Withdraw question
												</button>
											)}
										</div>
									)}
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
		</>
	);
};

export default Inquiry;
