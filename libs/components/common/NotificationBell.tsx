import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Menu from '@mui/material/Menu';
import Moment from 'react-moment';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationStatus } from '../../enums/notification.enum';
import { notificationAction, notificationAuthor, notificationAvatar, notificationHref } from './notificationHelpers';

const PREVIEW_LIMIT = 5;

/** Navbar bell: unread badge + latest notifications. Full inbox lives in My Page → Notifications. */
const NotificationBell = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	/** APOLLO REQUESTS **/
	const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		fetchPolicy: 'network-only',
		skip: !user?._id,
		pollInterval: 30000,
	});
	const { data: listData, refetch: refetchList } = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: PREVIEW_LIMIT } },
		skip: !user?._id || !open,
	});
	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	const unread: number = countData?.getUnreadNotificationCount ?? 0;
	const notifications: Notification[] = listData?.getNotifications?.list ?? [];

	/** HANDLERS **/
	const openHandler = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
	const closeHandler = () => setAnchorEl(null);

	const itemClickHandler = async (notification: Notification) => {
		closeHandler();
		try {
			if (notification.notificationStatus === NotificationStatus.WAIT) {
				await markNotificationRead({ variables: { input: notification._id } });
				await refetchCount();
			}
		} catch (err: any) {
			console.log('ERROR, markNotificationRead:', err.message);
		}
		await router.push(notificationHref(notification));
	};

	const markAllHandler = async () => {
		try {
			await markAllNotificationsRead();
			await Promise.all([refetchCount(), refetchList()]);
		} catch (err: any) {
			console.log('ERROR, markAllNotificationsRead:', err.message);
		}
	};

	if (!user?._id) return null;

	return (
		<>
			<button
				type="button"
				className="sx-bell"
				aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
				aria-haspopup="true"
				aria-expanded={open}
				onClick={openHandler}
			>
				<NotificationsOutlinedIcon />
				{unread > 0 && <span className="sx-bell-badge">{unread > 9 ? '9+' : unread}</span>}
			</button>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={closeHandler}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{ className: 'sx-bell-menu' }}
				MenuListProps={{ disablePadding: true }}
			>
				<div className="sx-bell-head">
					<strong>Notifications</strong>
					{unread > 0 && (
						<button type="button" onClick={markAllHandler}>
							Mark all as read
						</button>
					)}
				</div>
				{notifications.length === 0 ? (
					<p className="sx-bell-empty">You're all caught up.</p>
				) : (
					<ul className="sx-bell-list">
						{notifications.map((notification) => (
							<li key={notification._id}>
								<button
									type="button"
									className={notification.notificationStatus === NotificationStatus.WAIT ? 'is-unread' : ''}
									onClick={() => itemClickHandler(notification)}
								>
									<img src={notificationAvatar(notification)} alt="" />
									<span className="sx-bell-text">
										<span>
											<b>{notificationAuthor(notification)}</b> {notificationAction(notification)}
										</span>
										{notification.notificationDesc && <em>{notification.notificationDesc}</em>}
										<small>
											<Moment fromNow>{notification.createdAt}</Moment>
										</small>
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
				<Link
					href={{ pathname: '/mypage', query: { category: 'notifications' } }}
					className="sx-bell-all"
					onClick={closeHandler}
				>
					See all notifications
				</Link>
			</Menu>
		</>
	);
};

export default NotificationBell;
