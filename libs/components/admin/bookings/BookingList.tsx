import React from 'react';
import Link from 'next/link';
import {
	Avatar,
	Button,
	Chip,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import Moment from 'react-moment';
import { Booking } from '../../../types/booking/booking';
import { BookingStatus, PaymentStatus } from '../../../enums/booking.enum';
import { REACT_APP_API_URL } from '../../../config';
import { formatKRW } from '../../../utils';

interface BookingListProps {
	bookings: Booking[];
	cancelHandler: (booking: Booking) => void;
}

const columns = ['STAY', 'GUEST', 'DATES', 'GUESTS', 'AMOUNT', 'PAYMENT', 'STATUS', 'BOOKED', 'ACTION'];

const statusColors: Record<BookingStatus, 'success' | 'info' | 'default' | 'warning'> = {
	[BookingStatus.CONFIRMED]: 'success',
	[BookingStatus.COMPLETED]: 'info',
	[BookingStatus.CANCELLED]: 'default',
	[BookingStatus.PENDING]: 'warning',
};

const paymentLabel = (booking: Booking) => {
	if (!booking.paymentStatus) return 'Not paid';
	const method = booking.paymentMethod ? ` · ${booking.paymentMethod}` : '';
	return booking.paymentStatus === PaymentStatus.SUCCEEDED ? `Paid${method}` : `${booking.paymentStatus.toLowerCase()}${method}`;
};

/** Admin bookings table: data from PostgreSQL, stay and guest names from MongoDB. */
export const BookingList = ({ bookings, cancelHandler }: BookingListProps) => {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 1000 }} aria-labelledby="tableTitle">
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={column} align={column === 'ACTION' ? 'right' : 'left'}>
									{column}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{bookings.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={columns.length}>
									<span className={'no-data'}>No bookings here.</span>
								</TableCell>
							</TableRow>
						)}

						{bookings.map((booking) => {
							const active = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;
							return (
								<TableRow hover key={booking.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell align="left" sx={{ maxWidth: 220 }}>
										<Link href={{ pathname: '/stay/detail', query: { id: booking.propertyId } }} target={'_blank'}>
											<Typography variant={'body2'} sx={{ fontWeight: 600 }}>
												{booking.propertyData?.propertyTitle ?? 'Removed stay'}
											</Typography>
										</Link>
										<Typography variant={'caption'} color={'text.secondary'}>
											{booking.propertyData?.propertyLocation}
										</Typography>
									</TableCell>
									<TableCell align="left">
										<Stack direction={'row'} alignItems={'center'} gap={1}>
											<Avatar
												alt={booking.guestData?.memberNick}
												src={
													booking.guestData?.memberImage
														? `${REACT_APP_API_URL}/${booking.guestData.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												sx={{ width: 28, height: 28 }}
											/>
											<span>
												{booking.guestData?.memberFullName || booking.guestData?.memberNick || '—'}
												<Typography variant={'caption'} color={'text.secondary'} component={'p'}>
													{booking.guestData?.memberPhone}
												</Typography>
											</span>
										</Stack>
									</TableCell>
									<TableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
										{booking.checkIn} → {booking.checkOut}
									</TableCell>
									<TableCell align="left">{booking.guestsCount}</TableCell>
									<TableCell align="left" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
										{formatKRW(booking.totalPrice)}
									</TableCell>
									<TableCell align="left" sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
										{paymentLabel(booking)}
									</TableCell>
									<TableCell align="left">
										<Chip size={'small'} color={statusColors[booking.status]} label={booking.status} />
									</TableCell>
									<TableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
										<Moment format={'YYYY.MM.DD HH:mm'}>{booking.createdAt}</Moment>
									</TableCell>
									<TableCell align="right">
										{active && (
											<Button size={'small'} color={'error'} variant={'outlined'} onClick={() => cancelHandler(booking)}>
												Cancel
											</Button>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
