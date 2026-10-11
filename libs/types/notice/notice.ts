import { FaqGroup, NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	faqGroup?: FaqGroup;
	noticeEvent: boolean;
	noticeTitle: string;
	noticeContent: string;
	noticeViews: number;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface NoticeStatusCount {
	_id: NoticeStatus;
	count: number;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
	statusCounter?: NoticeStatusCount[];
}
