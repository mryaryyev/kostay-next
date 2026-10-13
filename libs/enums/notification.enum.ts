export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	MESSAGE = 'MESSAGE',
	BOOKING = 'BOOKING',
	INQUIRY = 'INQUIRY',
	LISTING = 'LISTING', // stay submitted / approved / rejected
}

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
	BOOKING = 'BOOKING',
	INQUIRY = 'INQUIRY',
}
