import { Notification } from '../../types/notification/notification';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { REACT_APP_API_URL } from '../../config';

/** Titles set by the booking service for notifications the host receives. */
const HOST_BOOKING_TITLES = ['booked your stay', 'cancelled their booking', 'cancelled a booking of your stay'];

/** Set by the inquiry service on the notification each admin gets for a new question. */
const NEW_INQUIRY_TITLE = 'sent an inquiry';
const isAnswerFromHelp = (notification: Notification) =>
	notification.notificationType === NotificationType.INQUIRY && notification.notificationTitle !== NEW_INQUIRY_TITLE;

/** Who did it: full name, nick, or a neutral fallback. */
export const notificationAuthor = (notification: Notification): string =>
	isAnswerFromHelp(notification)
		? 'Kostay Help'
		: notification.authorData?.memberFullName || notification.authorData?.memberNick || 'Someone';

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
	if (notification.notificationType === NotificationType.INQUIRY) {
		// Admins open the 1:1 Inquiry page; members see the answer in Help → Inquiry.
		return isAnswerFromHelp(notification)
			? { pathname: '/help', query: { tab: 'inquiry' } }
			: { pathname: '/_admin/cs/inquiry' };
	}
	if (notification.notificationType === NotificationType.BOOKING) {
		// New bookings and guest cancellations go to the host (Reservations); anything else to the guest.
		const forHost = HOST_BOOKING_TITLES.includes(notification.notificationTitle);
		return { pathname: '/mypage', query: { category: forHost ? 'reservations' : 'myBookings' } };
	}
	if (notification.notificationGroup === NotificationGroup.PROPERTY && notification.propertyId) {
		return { pathname: '/stay/detail', query: { id: notification.propertyId } };
	}
	if (notification.notificationGroup === NotificationGroup.ARTICLE && notification.articleId) {
		return { pathname: '/community/detail', query: { id: notification.articleId } };
	}
	return { pathname: '/member', query: { memberId: notification.authorId } };
};
