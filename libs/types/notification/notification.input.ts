import { NotificationStatus, NotificationType } from '../../enums/notification.enum';

interface NotificationSearch {
	notificationStatus?: NotificationStatus;
	notificationType?: NotificationType;
}

export interface NotificationInquiry {
	page: number;
	limit: number;
	search?: NotificationSearch;
}

export interface MessageInput {
	propertyId: string;
	senderName: string;
	senderPhone?: string;
	message: string;
}
