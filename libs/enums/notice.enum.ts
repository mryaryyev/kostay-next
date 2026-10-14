export enum NoticeCategory {
	NOTICE = 'NOTICE',
	FAQ = 'FAQ',
}

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

export enum FaqGroup {
	STAYS = 'STAYS',
	PAYMENT = 'PAYMENT',
	GUESTS = 'GUESTS',
	HOSTS = 'HOSTS',
	MEMBERSHIP = 'MEMBERSHIP',
	COMMUNITY = 'COMMUNITY',
	OTHER = 'OTHER',
}

/** Tab labels on the CS page and the admin FAQ filter. */
export const faqGroupLabels: Record<FaqGroup, string> = {
	[FaqGroup.STAYS]: 'Stays',
	[FaqGroup.PAYMENT]: 'Payment',
	[FaqGroup.GUESTS]: 'For Guests',
	[FaqGroup.HOSTS]: 'For Hosts',
	[FaqGroup.MEMBERSHIP]: 'Membership',
	[FaqGroup.COMMUNITY]: 'Community',
	[FaqGroup.OTHER]: 'Other',
};
