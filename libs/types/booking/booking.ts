import { BookingStatus, PaymentStatus } from '../../enums/booking.enum';

export interface BookingPropertyData {
	_id: string;
	propertyTitle: string;
	propertyImage?: string;
	propertyLocation: string;
	propertyAddress?: string;
}

export interface BookingGuestData {
	_id: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberPhone?: string;
}

/** Booking rows live in PostgreSQL: uuid id, plain YYYY-MM-DD dates. */
export interface Booking {
	id: string;
	propertyId: string;
	memberId: string;
	checkIn: string;
	checkOut: string;
	guestsCount: number;
	totalPrice: number;
	status: BookingStatus;
	paymentStatus?: PaymentStatus;
	createdAt: Date;
	updatedAt: Date;
	propertyData?: BookingPropertyData;
	guestData?: BookingGuestData;
}

export interface Bookings {
	list: Booking[];
	total: number;
}

export interface BookedRange {
	checkIn: string;
	checkOut: string;
}
