import { FaqGroup, NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	faqGroup?: FaqGroup;
	noticeEvent?: boolean;
	noticeStatus?: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticeUpdate {
	_id: string;
	noticeStatus?: NoticeStatus;
	faqGroup?: FaqGroup;
	noticeEvent?: boolean;
	noticeTitle?: string;
	noticeContent?: string;
}

interface NISearch {
	noticeCategory: NoticeCategory;
	faqGroup?: FaqGroup;
	text?: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	search: NISearch;
}

export interface AllNoticesInquiry {
	page: number;
	limit: number;
	search: NISearch & { noticeStatus?: NoticeStatus };
}
