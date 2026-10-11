import { Notification } from '../../types/notification/notification';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { REACT_APP_API_URL } from '../../config';

/** Who did it: full name, nick, or a neutral fallback. */
export const notificationAuthor = (notification: Notification): string =>
	notification.authorData?.memberFullName || notification.authorData?.memberNick || 'Someone';

/** "liked your stay", "sent you a message", ... (the author's name is rendered separately in bold). */
export const notificationAction = (notification: Notification): string =>
	notification.notificationType === NotificationType.MESSAGE ? 'sent you a message' : notification.notificationTitle;

export const notificationAvatar = (notification: Notification): string =>
	notification.authorData?.memberImage
		? `${REACT_APP_API_URL}/${notification.authorData.memberImage}`
		: '/img/profile/defaultUser.svg';

/** Where a click should go. Messages open the full inbox, since the text is only fully shown there. */
export const notificationHref = (notification: Notification) => {
	if (notification.notificationType === NotificationType.MESSAGE) {
		return { pathname: '/mypage', query: { category: 'notifications' } };
	}
	if (notification.notificationGroup === NotificationGroup.PROPERTY && notification.propertyId) {
		return { pathname: '/property/detail', query: { id: notification.propertyId } };
	}
	if (notification.notificationGroup === NotificationGroup.ARTICLE && notification.articleId) {
		return { pathname: '/community/detail', query: { id: notification.articleId } };
	}
	return { pathname: '/member', query: { memberId: notification.authorId } };
};
