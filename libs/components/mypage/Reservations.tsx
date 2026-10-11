import React, { useState } from 'react';
import { Pagination } from '@mui/material';
import { useQuery } from '@apollo/client';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { GET_HOST_BOOKINGS, GET_HOST_EARNINGS } from '../../../apollo/user/query';
import { Booking, HostEarnings } from '../../types/booking/booking';
import { formatKRW } from '../../utils';
import { BookingStatus } from '../../enums/booking.enum';
import BookingCard from './BookingCard';
import { bookingFilters } from './MyBookings';

const PAGE_LIMIT = 6;

/** My Page → Reservations (hosts): stays guests booked on my listings. Instant Book, so nothing to approve. */
const Reservations = () => {
	const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
	const [page, setPage] = useState<number>(1);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_HOST_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT, ...(filter !== 'ALL' ? { status: filter } : {}) } },
		notifyOnNetworkStatusChange: true,
	});

	const { data: earningsData } = useQuery(GET_HOST_EARNINGS, { fetchPolicy: 'network-only' });

	const bookings: Booking[] = data?.getHostBookings?.list ?? [];
	const earnings: HostEarnings | undefined = earningsData?.getHostEarnings;
	const month = new Date().toLocaleDateString('en-US', { month: 'long' });
	const total: number = data?.getHostBookings?.total ?? 0;

	return (
		<div className="sx-bookings">
			<header className="sx-bookings-head">
				<div>
					<h2>Reservations</h2>
					<p>Guests who booked your stays.</p>
				</div>
			</header>

			{earnings && (
				<div className="sx-earnings">
					<div className="sx-earnings-card is-accent">
						<span>Earned in {month}</span>
						<strong>{formatKRW(earnings.monthRevenue)}</strong>
						<small>{formatKRW(earnings.totalRevenue)} all time</small>
					</div>
					<div className="sx-earnings-card">
						<span>Active bookings</span>
						<strong>{earnings.activeBookings}</strong>
						<small>Confirmed and upcoming</small>
					</div>
					<div className="sx-earnings-card">
						<span>Check-ins soon</span>
						<strong>{earnings.upcomingCheckIns}</strong>
						<small>In the next 7 days</small>
					</div>
					<div className="sx-earnings-card">
						<span>Nights booked</span>
						<strong>{earnings.nightsBooked}</strong>
						<small>Confirmed and completed stays</small>
					</div>
				</div>
			)}

			<div className="sx-notifications-filters" role="tablist" aria-label="Filter reservations">
				{bookingFilters.map((item) => (
					<button
						type="button"
						role="tab"
						key={item.key}
						aria-selected={filter === item.key}
						className={filter === item.key ? 'active' : ''}
						onClick={() => {
							setFilter(item.key);
							setPage(1);
						}}
					>
						{item.label}
					</button>
				))}
			</div>

			{!loading && bookings.length === 0 ? (
				<div className="sx-notifications-empty">
					<EventAvailableOutlinedIcon aria-hidden="true" />
					<strong>No reservations here</strong>
					<p>New bookings from guests will show up here.</p>
				</div>
			) : (
				<div className="sx-booking-list">
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} view="host" />
					))}
				</div>
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

export default Reservations;
