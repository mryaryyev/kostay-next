import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import { Pagination } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import {
	notificationAction,
	notificationAuthor,
	notificationAvatar,
	notificationHref,
} from '../common/notificationHelpers';

const PAGE_LIMIT = 8;

type Filter = 'all' | 'unread' | 'messages';
const filters: { key: Filter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'unread', label: 'Unread' },
	{ key: 'messages', label: 'Messages' },
];

const typeIcons: Record<NotificationType, JSX.Element> = {
	[NotificationType.LIKE]: <FavoriteBorderIcon />,
	[NotificationType.COMMENT]: <ChatBubbleOutlineIcon />,
	[NotificationType.MESSAGE]: <MailOutlineIcon />,
	[NotificationType.FOLLOW]: <PersonAddAltOutlinedIcon />,
	[NotificationType.BOOKING]: <EventAvailableOutlinedIcon />,
	[NotificationType.INQUIRY]: <SupportAgentOutlinedIcon />,
	[NotificationType.LISTING]: <AddHomeOutlinedIcon />,
};

/** My Page → Notifications: the full inbox (likes, reviews, follows and messages from guests). */
const MyNotifications = () => {
	const router = useRouter();
	const [filter, setFilter] = useState<Filter>('all');
	const [page, setPage] = useState<number>(1);

	/** APOLLO REQUESTS **/
	const searchByFilter: Record<Filter, object | undefined> = {
		all: undefined,
		unread: { notificationStatus: NotificationStatus.WAIT },
		messages: { notificationType: NotificationType.MESSAGE },
	};
	const {
		data,
		loading,
		refetch: refetchNotifications,
	} = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit: PAGE_LIMIT,
				...(searchByFilter[filter] ? { search: searchByFilter[filter] } : {}),
			},
		},
		notifyOnNetworkStatusChange: true,
	});
	const refreshCount = { refetchQueries: [{ query: GET_UNREAD_NOTIFICATION_COUNT }] };
	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ, refreshCount);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, refreshCount);

	// Same cached query as the bell and the menu badge, so "Mark all as read" reflects every unread item, not just this page.
	const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, { fetchPolicy: 'cache-and-network' });

	const notifications: Notification[] = data?.getNotifications?.list ?? [];
	const total: number = data?.getNotifications?.metaCounter?.[0]?.total ?? 0;
	const hasUnread = (unreadData?.getUnreadNotificationCount ?? 0) > 0;

	/** HANDLERS **/
	const filterHandler = (key: Filter) => {
		setFilter(key);
		setPage(1);
	};

	const markReadHandler = async (notification: Notification) => {
		if (notification.notificationStatus !== NotificationStatus.WAIT) return;
		try {
			await markNotificationRead({ variables: { input: notification._id } });
			await refetchNotifications();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const openHandler = async (notification: Notification) => {
		await markReadHandler(notification);
		// Messages are read right here; everything else opens the related page.
		if (notification.notificationType !== NotificationType.MESSAGE) await router.push(notificationHref(notification));
	};

	const markAllHandler = async () => {
		try {
			await markAllNotificationsRead();
			await refetchNotifications();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className="sx-notifications">
			<header className="sx-notifications-head">
				<div>
					<h2>Notifications</h2>
					<p>Likes, reviews, follows and messages from guests.</p>
				</div>
				<button type="button" className="sx-outline-btn" onClick={markAllHandler} disabled={!hasUnread}>
					Mark all as read
				</button>
			</header>

			<div className="sx-notifications-filters" role="tablist" aria-label="Filter notifications">
				{filters.map((item) => (
					<button
						type="button"
						role="tab"
						key={item.key}
						aria-selected={filter === item.key}
						className={filter === item.key ? 'active' : ''}
						onClick={() => filterHandler(item.key)}
					>
						{item.label}
					</button>
				))}
			</div>

			{!loading && notifications.length === 0 ? (
				<div className="sx-notifications-empty">
					<NotificationsNoneOutlinedIcon aria-hidden="true" />
					<strong>{filter === 'all' ? 'No notifications yet' : 'Nothing here'}</strong>
					<p>When guests like, review or message you, it shows up here.</p>
				</div>
			) : (
				<ul className="sx-notifications-list">
					{notifications.map((notification) => {
						const unread = notification.notificationStatus === NotificationStatus.WAIT;
						const isMessage = notification.notificationType === NotificationType.MESSAGE;
						return (
							<li key={notification._id} className={`${unread ? 'is-unread' : ''} ${isMessage ? 'is-message' : ''}`}>
								<button type="button" className="sx-notification-main" onClick={() => openHandler(notification)}>
									<span className="sx-notification-avatar">
										<img src={notificationAvatar(notification)} alt="" />
										<i className={`sx-type is-${notification.notificationType.toLowerCase()}`}>
											{typeIcons[notification.notificationType]}
										</i>
									</span>
									<span className="sx-notification-body">
										<span className="sx-notification-line">
											<b>{notificationAuthor(notification)}</b> {notificationAction(notification)}
										</span>
										{isMessage ? (
											<>
												<small className="sx-notification-subject">{notification.notificationTitle}</small>
												<span className="sx-notification-message">{notification.notificationDesc}</span>
											</>
										) : (
											notification.notificationDesc && <em>{notification.notificationDesc}</em>
										)}
										<small className="sx-notification-time">
											<Moment fromNow>{notification.createdAt}</Moment>
										</small>
									</span>
									{unread && <span className="sx-unread-dot" aria-label="Unread" />}
								</button>
								{isMessage && notification.propertyId && (
									<Link
										href={{ pathname: '/stay/detail', query: { id: notification.propertyId } }}
										className="sx-notification-link"
									>
										View stay
									</Link>
								)}
							</li>
						);
					})}
				</ul>
			)}

			{total > PAGE_LIMIT && (
				<div className="sx-notifications-pagination">
					<Pagination
						page={page}
						count={Math.ceil(total / PAGE_LIMIT)}
						onChange={(_, value) => setPage(value)}
						shape="circular"
					/>
				</div>
			)}
		</div>
	);
};

export default MyNotifications;
