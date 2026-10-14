import { BookingStatus } from '../../enums/booking.enum';

export interface BookingInput {
	propertyId: string;
	checkIn: string; // YYYY-MM-DD
	checkOut: string; // YYYY-MM-DD
	guestsCount: number;
}

export interface BookingsInquiry {
	page: number;
	limit: number;
	status?: BookingStatus;
}

/** Instant Book: BookingInput + payment method (simulated card for now). */
export interface BookAndPayInput extends BookingInput {
	paymentMethod: string;
}

export interface AllBookingsInquiry extends BookingsInquiry {
	checkInFrom?: string;
	checkInTo?: string;
}
