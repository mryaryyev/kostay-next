export enum InquiryStatus {
	WAITING = 'WAITING',
	ANSWERED = 'ANSWERED',
	CLOSED = 'CLOSED',
}

export enum InquiryTopic {
	BOOKING = 'BOOKING',
	PAYMENT = 'PAYMENT',
	STAY = 'STAY',
	ACCOUNT = 'ACCOUNT',
	OTHER = 'OTHER',
}

export const inquiryTopicLabels: Record<InquiryTopic, string> = {
	[InquiryTopic.BOOKING]: 'Booking',
	[InquiryTopic.PAYMENT]: 'Payment',
	[InquiryTopic.STAY]: 'Stay',
	[InquiryTopic.ACCOUNT]: 'Account',
	[InquiryTopic.OTHER]: 'Other',
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
	[InquiryStatus.WAITING]: 'Waiting',
	[InquiryStatus.ANSWERED]: 'Answered',
	[InquiryStatus.CLOSED]: 'Closed',
};
