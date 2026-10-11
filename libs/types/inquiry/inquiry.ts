import { InquiryStatus, InquiryTopic } from '../../enums/inquiry.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Inquiry {
	_id: string;
	inquiryTopic: InquiryTopic;
	inquiryStatus: InquiryStatus;
	inquiryTitle: string;
	inquiryContent: string;
	memberId: string;
	answerContent?: string;
	answeredAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Inquiries {
	list: Inquiry[];
	metaCounter: TotalCounter[];
	statusCounter?: { _id: InquiryStatus; count: number }[];
}
