import React from 'react';
import Link from 'next/link';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Booking } from '../../types/booking/booking';
import { BookingStatus, PaymentStatus } from '../../enums/booking.enum';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW } from '../../utils';

const statusLabels: Record<BookingStatus, string> = {
	// Only bookings made before Instant Book can still be PENDING (never paid); they can only be cancelled.
	[BookingStatus.PENDING]: 'Not paid',
	[BookingStatus.CONFIRMED]: 'Confirmed',
	[BookingStatus.CANCELLED]: 'Cancelled',
	[BookingStatus.COMPLETED]: 'Completed',
};

const toLabel = (value?: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');

// Dates are plain YYYY-MM-DD strings, so nights are counted in UTC to avoid timezone shifts.
const nightsBetween = (from: string, to: string) => {
	const [y1, m1, d1] = from.split('-').map(Number);
	const [y2, m2, d2] = to.split('-').map(Number);
	return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

interface BookingCardProps {
	booking: Booking;
	/** guest = My Bookings (shows the stay), host = Reservations (also shows the guest). */
	view: 'guest' | 'host';
	actions?: React.ReactNode;
}

/** One booking row, shared by My Page → My Bookings (guest) and Reservations (host). */
const BookingCard = ({ booking, view, actions }: BookingCardProps) => {
	const stay = booking.propertyData;
	const guest = booking.guestData;
	const nights = nightsBetween(booking.checkIn, booking.checkOut);
	const paid = booking.paymentStatus === PaymentStatus.SUCCEEDED;
	const refunded = booking.paymentStatus === PaymentStatus.REFUNDED;

	return (
		<article className="sx-booking-card">
			<Link href={{ pathname: '/property/detail', query: { id: booking.propertyId } }} className="sx-booking-photo">
				<img
					src={stay?.propertyImage ? `${REACT_APP_API_URL}/${stay.propertyImage}` : '/img/property/bigImage.png'}
					alt=""
				/>
			</Link>

			<div className="sx-booking-info">
				<div className="sx-booking-chips">
					<span className={`sx-status is-${booking.status.toLowerCase()}`}>{statusLabels[booking.status]}</span>
					{paid && <span className="sx-status is-paid">Paid</span>}
					{refunded && <span className="sx-status is-refunded">Refunded</span>}
				</div>
				<Link href={{ pathname: '/property/detail', query: { id: booking.propertyId } }} className="sx-booking-title">
					{stay?.propertyTitle ?? 'Stay no longer available'}
				</Link>
				{stay && (
					<span className="sx-booking-meta">
						<PlaceOutlinedIcon aria-hidden="true" />
						{[stay.propertyAddress, toLabel(stay.propertyLocation)].filter(Boolean).join(', ')}
					</span>
				)}
				<div className="sx-booking-facts">
					<span>
						<CalendarMonthOutlinedIcon aria-hidden="true" />
						{booking.checkIn} → {booking.checkOut} · {nights} {nights === 1 ? 'night' : 'nights'}
					</span>
					<span>
						<PeopleOutlineIcon aria-hidden="true" />
						{booking.guestsCount} {booking.guestsCount === 1 ? 'guest' : 'guests'}
					</span>
				</div>

				{view === 'host' && guest && (
					<div className="sx-booking-guest">
						<img
							src={guest.memberImage ? `${REACT_APP_API_URL}/${guest.memberImage}` : '/img/profile/defaultUser.svg'}
							alt=""
						/>
						<Link href={{ pathname: '/member', query: { memberId: guest._id } }}>
							{guest.memberFullName || guest.memberNick}
						</Link>
						{guest.memberPhone && (
							<span>
								<PhoneOutlinedIcon aria-hidden="true" />
								{guest.memberPhone}
							</span>
						)}
					</div>
				)}
			</div>

			<div className="sx-booking-side">
				<small>Total</small>
				<strong>{formatKRW(booking.totalPrice)}</strong>
				{actions && <div className="sx-booking-actions">{actions}</div>}
			</div>
		</article>
	);
};

export default BookingCard;
