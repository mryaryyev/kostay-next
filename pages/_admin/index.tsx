import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { GET_ADMIN_DASHBOARD, GET_ALL_BOOKINGS_BY_ADMIN } from '../../apollo/admin/query';
import { Booking } from '../../libs/types/booking/booking';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { formatKRW } from '../../libs/utils';

interface AdminDashboardData {
	guests: number;
	hosts: number;
	activeStays: number;
	pausedStays: number;
	pendingStays: number;
	activeArticles: number;
	waitingInquiries: number;
	confirmedBookings: number;
	completedBookings: number;
	cancelledBookings: number;
	upcomingCheckIns: number;
	totalRevenue: number;
	monthRevenue: number;
}

const statusColors: Record<BookingStatus, 'success' | 'info' | 'default' | 'warning'> = {
	[BookingStatus.CONFIRMED]: 'success',
	[BookingStatus.COMPLETED]: 'info',
	[BookingStatus.CANCELLED]: 'default',
	[BookingStatus.PENDING]: 'warning',
};

/** Admin home: platform numbers (MongoDB + PostgreSQL) and the latest bookings. */
const AdminHome: NextPage = () => {
	/** APOLLO REQUESTS **/
	const { data } = useQuery(GET_ADMIN_DASHBOARD, { fetchPolicy: 'network-only' });
	const { data: bookingsData } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 5 } },
	});

	const stats: AdminDashboardData | undefined = data?.getAdminDashboard;
	const recent: Booking[] = bookingsData?.getAllBookingsByAdmin?.list ?? [];
	const month = new Date().toLocaleDateString('en-US', { month: 'long' });

	const cards = stats
		? [
				{
					label: `Revenue in ${month}`,
					value: formatKRW(stats.monthRevenue),
					note: `${formatKRW(stats.totalRevenue)} all time`,
					href: '/_admin/bookings',
					accent: true,
				},
				{
					label: 'Active bookings',
					value: stats.confirmedBookings,
					note: `${stats.upcomingCheckIns} check-ins in the next 7 days`,
					href: '/_admin/bookings',
				},
				{ label: 'Stays', value: stats.activeStays, note: `${stats.pausedStays} paused`, href: '/_admin/stays' },
				{
					label: 'Members',
					value: stats.guests + stats.hosts,
					note: `${stats.guests} guests · ${stats.hosts} hosts`,
					href: '/_admin/users',
				},
				{ label: 'Community posts', value: stats.activeArticles, note: 'Active articles', href: '/_admin/community' },
				{
					label: 'Waiting inquiries',
					value: stats.waitingInquiries,
					note: stats.waitingInquiries ? 'Need an answer' : 'All answered',
					href: '/_admin/cs/inquiry',
					warn: stats.waitingInquiries > 0,
				},
				{
					label: 'Stays to review',
					value: stats.pendingStays,
					note: stats.pendingStays ? 'Waiting for approval' : 'Nothing to review',
					href: '/_admin/stays?status=PENDING',
					warn: stats.pendingStays > 0,
				},
		  ]
		: [];

	return (
		<Box component={'div'} className={'content admin-dashboard'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Dashboard
			</Typography>

			<div className={'admin-dash-grid'}>
				{cards.map((card) => (
					<Link
						href={card.href}
						key={card.label}
						className={`admin-dash-card ${card.accent ? 'is-accent' : ''} ${card.warn ? 'is-warn' : ''}`}
					>
						<span>{card.label}</span>
						<strong>{card.value}</strong>
						<small>{card.note}</small>
					</Link>
				))}
			</div>

			<Stack className={'admin-dash-panel'}>
				<div className={'admin-dash-panel-head'}>
					<h3>Latest bookings</h3>
					<Link href={'/_admin/bookings'}>See all</Link>
				</div>
				<Table size={'small'}>
					<TableHead>
						<TableRow>
							<TableCell>STAY</TableCell>
							<TableCell>GUEST</TableCell>
							<TableCell>DATES</TableCell>
							<TableCell>AMOUNT</TableCell>
							<TableCell>STATUS</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recent.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} align={'center'}>
									No bookings yet.
								</TableCell>
							</TableRow>
						)}
						{recent.map((booking) => (
							<TableRow key={booking.id} hover>
								<TableCell>{booking.propertyData?.propertyTitle ?? 'Removed stay'}</TableCell>
								<TableCell>{booking.guestData?.memberFullName || booking.guestData?.memberNick || '—'}</TableCell>
								<TableCell sx={{ whiteSpace: 'nowrap' }}>
									{booking.checkIn} → {booking.checkOut}
								</TableCell>
								<TableCell sx={{ whiteSpace: 'nowrap' }}>{formatKRW(booking.totalPrice)}</TableCell>
								<TableCell>
									<Chip size={'small'} color={statusColors[booking.status]} label={booking.status} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Stack>
		</Box>
	);
};

export default withAdminLayout(AdminHome);
