import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../property/property';
import { Member } from '../member/member';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	propertyId?: string;
	articleId?: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	authorData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
