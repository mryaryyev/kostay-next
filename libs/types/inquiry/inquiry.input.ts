import { InquiryStatus, InquiryTopic } from '../../enums/inquiry.enum';

export interface InquiryInput {
	inquiryTopic: InquiryTopic;
	inquiryTitle: string;
	inquiryContent: string;
}

export interface AllInquiriesInquiry {
	page: number;
	limit: number;
	search: { inquiryStatus?: InquiryStatus; inquiryTopic?: InquiryTopic; text?: string };
}
