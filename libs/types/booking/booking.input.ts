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

export interface PaymentInput {
	bookingId: string;
	paymentMethod: string;
}
