import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	CalendarCheck,
	ChatsCircle,
	House,
	Megaphone,
	Question,
	SquaresFour,
	Sparkle,
	Tray,
	Users,
} from 'phosphor-react';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_DASHBOARD, GET_WAITING_INQUIRY_COUNT } from '../../../apollo/admin/query';
import { InquiryStatus } from '../../enums/inquiry.enum';

interface NavItem {
	label: string;
	href: string;
	icon: React.ReactNode;
	count?: number;
}

/** Admin sidebar: one click per page, grouped, with counts for work that is waiting. */
const AdminMenuList = () => {
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const { data: waitingData } = useQuery(GET_WAITING_INQUIRY_COUNT, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: { inquiryStatus: InquiryStatus.WAITING } } },
		pollInterval: 30000,
	});
	const { data: dashboardData } = useQuery(GET_ADMIN_DASHBOARD, {
		fetchPolicy: 'cache-and-network',
		pollInterval: 60000,
	});
	const waitingInquiries: number = waitingData?.getAllInquiriesByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pendingStays: number = dashboardData?.getAdminDashboard?.pendingStays ?? 0;

	const groups: { label?: string; items: NavItem[] }[] = [
		{ items: [{ label: 'Dashboard', href: '/_admin', icon: <SquaresFour /> }] },
		{
			label: 'Manage',
			items: [
				{ label: 'Users', href: '/_admin/users', icon: <Users /> },
				{ label: 'Stays', href: '/_admin/stays', icon: <House />, count: pendingStays },
				{ label: 'Bookings', href: '/_admin/bookings', icon: <CalendarCheck /> },
				{ label: 'Community', href: '/_admin/community', icon: <ChatsCircle /> },
			],
		},
		{
			label: 'Support',
			items: [
				{ label: 'FAQ', href: '/_admin/cs/faq', icon: <Question /> },
				{ label: 'Notices', href: '/_admin/cs/notice', icon: <Megaphone /> },
				{ label: 'Inquiries', href: '/_admin/cs/inquiry', icon: <Tray />, count: waitingInquiries },
			],
		},
		{ label: 'Insights', items: [{ label: 'AI search', href: '/_admin/ai-search', icon: <Sparkle /> }] },
	];

	const isActive = (href: string) =>
		href === '/_admin' ? router.pathname === '/_admin' : router.pathname.startsWith(href);

	return (
		<div className={'adm-nav'}>
			{groups.map((group, index) => (
				<div className={'adm-nav-group'} key={group.label ?? index}>
					{group.label && <div className={'adm-nav-label'}>{group.label}</div>}
					<ul>
						{group.items.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`adm-nav-link ${isActive(item.href) ? 'on' : ''}`}
									aria-current={isActive(item.href) ? 'page' : undefined}
								>
									<span className={'adm-nav-icon'} aria-hidden="true">
										{item.icon}
									</span>
									{item.label}
									{!!item.count && (
										<span className={'admin-menu-badge'} aria-label={`${item.count} waiting`}>
											{item.count > 99 ? '99+' : item.count}
										</span>
									)}
								</Link>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

export default AdminMenuList;
