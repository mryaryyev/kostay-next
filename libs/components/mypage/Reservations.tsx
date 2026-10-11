import React, { useState } from 'react';
import { Pagination } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { GET_HOST_BOOKINGS } from '../../../apollo/user/query';
import { CONFIRM_BOOKING, DECLINE_BOOKING } from '../../../apollo/user/mutation';
import { Booking } from '../../types/booking/booking';
import { BookingStatus } from '../../enums/booking.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import BookingCard from './BookingCard';
import { bookingFilters } from './MyBookings';

const PAGE_LIMIT = 6;

/** My Page → Reservations (hosts): requests guests made on my stays. Confirm or decline PENDING ones. */
const Reservations = () => {
	const [filter, setFilter] = useState<BookingStatus | 'ALL'>(BookingStatus.PENDING);
	const [page, setPage] = useState<number>(1);
	const [busyId, setBusyId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_HOST_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT, ...(filter !== 'ALL' ? { status: filter } : {}) } },
		notifyOnNetworkStatusChange: true,
	});
	const [confirmBooking] = useMutation(CONFIRM_BOOKING);
	const [declineBooking] = useMutation(DECLINE_BOOKING);

	const bookings: Booking[] = data?.getHostBookings?.list ?? [];
	const total: number = data?.getHostBookings?.total ?? 0;

	/** HANDLERS **/
	const decideHandler = async (booking: Booking, accept: boolean) => {
		if (!accept && !(await sweetConfirmAlert('Decline this booking request?'))) return;
		try {
			setBusyId(booking.id);
			if (accept) await confirmBooking({ variables: { bookingId: booking.id } });
			else await declineBooking({ variables: { bookingId: booking.id } });
			await refetch();
			await sweetTopSmallSuccessAlert(accept ? 'Booking confirmed' : 'Request declined', 1000);
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	const renderActions = (booking: Booking) => {
		if (booking.status !== BookingStatus.PENDING) return null;
		const busy = busyId === booking.id;
		return (
			<>
				<button type="button" className="sx-btn-pay" disabled={busy} onClick={() => decideHandler(booking, true)}>
					Confirm
				</button>
				<button type="button" className="sx-btn-ghost" disabled={busy} onClick={() => decideHandler(booking, false)}>
					Decline
				</button>
			</>
		);
	};

	return (
		<div className="sx-bookings">
			<header className="sx-bookings-head">
				<div>
					<h2>Reservations</h2>
					<p>Booking requests from guests on your stays.</p>
				</div>
			</header>

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
					<p>New requests from guests will show up in Pending.</p>
				</div>
			) : (
				<div className="sx-booking-list">
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} view="host" actions={renderActions(booking)} />
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
