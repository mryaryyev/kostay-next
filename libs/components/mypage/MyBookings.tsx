import React, { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import { GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_BOOKING } from '../../../apollo/user/mutation';
import { Booking } from '../../types/booking/booking';
import { BookingStatus, PaymentStatus } from '../../enums/booking.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import BookingCard from './BookingCard';

const PAGE_LIMIT = 6;

export const bookingFilters: { key: BookingStatus | 'ALL'; label: string }[] = [
	{ key: 'ALL', label: 'All' },
	{ key: BookingStatus.CONFIRMED, label: 'Confirmed' },
	{ key: BookingStatus.COMPLETED, label: 'Completed' },
	{ key: BookingStatus.CANCELLED, label: 'Cancelled' },
];

/** My Page → My Bookings: the guest's own stays. Instant Book: paid and confirmed at checkout; the guest can cancel (full refund). */
const MyBookings = () => {
	const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
	const [page, setPage] = useState<number>(1);
	const [busyId, setBusyId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT, ...(filter !== 'ALL' ? { status: filter } : {}) } },
		notifyOnNetworkStatusChange: true,
	});
	const [cancelBooking] = useMutation(CANCEL_BOOKING);

	const bookings: Booking[] = data?.getMyBookings?.list ?? [];
	const total: number = data?.getMyBookings?.total ?? 0;

	/** HANDLERS **/
	const cancelHandler = async (booking: Booking) => {
		const paid = booking.paymentStatus === PaymentStatus.SUCCEEDED;
		const question = paid ? 'Cancel this booking? Your payment will be fully refunded.' : 'Cancel this booking request?';
		if (!(await sweetConfirmAlert(question))) return;
		try {
			setBusyId(booking.id);
			await cancelBooking({ variables: { bookingId: booking.id } });
			await refetch();
			await sweetTopSmallSuccessAlert('Booking cancelled', 1000);
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	const renderActions = (booking: Booking) => {
		const busy = busyId === booking.id;
		const active = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;
		if (!active) return null;
		return (
			<>
				<button type="button" className="sx-btn-ghost" disabled={busy} onClick={() => cancelHandler(booking)}>
					Cancel booking
				</button>
			</>
		);
	};

	return (
		<div className="sx-bookings">
			<header className="sx-bookings-head">
				<div>
					<h2>My Bookings</h2>
					<p>Your booked stays, payments and refunds.</p>
				</div>
			</header>

			<div className="sx-notifications-filters" role="tablist" aria-label="Filter bookings">
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
					<LuggageOutlinedIcon aria-hidden="true" />
					<strong>No bookings here yet</strong>
					<p>
						Find a place you love and book it in a few steps. <Link href="/property">Browse stays</Link>
					</p>
				</div>
			) : (
				<div className="sx-booking-list">
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} view="guest" actions={renderActions(booking)} />
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

export default MyBookings;
