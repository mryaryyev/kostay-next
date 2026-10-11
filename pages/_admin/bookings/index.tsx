import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Box, Divider, List, ListItem, Stack, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { TabContext } from '@mui/lab';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { BookingList } from '../../../libs/components/admin/bookings/BookingList';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../../apollo/admin/query';
import { CANCEL_BOOKING_BY_ADMIN } from '../../../apollo/admin/mutation';
import { BookingStatus, PaymentStatus } from '../../../libs/enums/booking.enum';
import { Booking, Bookings } from '../../../libs/types/booking/booking';
import { AllBookingsInquiry } from '../../../libs/types/booking/booking.input';
import { formatKRW } from '../../../libs/utils';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

const statusTabs: { key: BookingStatus | 'ALL'; label: string }[] = [
	{ key: 'ALL', label: 'All' },
	{ key: BookingStatus.CONFIRMED, label: 'Confirmed' },
	{ key: BookingStatus.COMPLETED, label: 'Completed' },
	{ key: BookingStatus.CANCELLED, label: 'Cancelled' },
	{ key: BookingStatus.PENDING, label: 'Not paid' },
];

/** Admin → Bookings: every booking (PostgreSQL) with payments; the admin can cancel with a full refund. */
const AdminBookings: NextPage = () => {
	const [inquiry, setInquiry] = useState<AllBookingsInquiry>({ page: 1, limit: 10 });

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [cancelBookingByAdmin] = useMutation(CANCEL_BOOKING_BY_ADMIN);

	const result: Bookings | undefined = data?.getAllBookingsByAdmin;
	const counts = result?.statusCounter ?? [];
	const countOf = (key: BookingStatus | 'ALL') =>
		key === 'ALL' ? counts.reduce((sum, item) => sum + item.count, 0) : counts.find((item) => item.status === key)?.count ?? 0;
	const activeTab = inquiry.status ?? 'ALL';
	const paid = result?.paymentSummary?.paidTotal ?? 0;
	const refunded = result?.paymentSummary?.refundedTotal ?? 0;

	/** HANDLERS **/
	const update = (patch: Partial<AllBookingsInquiry>) => setInquiry({ ...inquiry, page: 1, ...patch });

	const cancelHandler = async (booking: Booking) => {
		const refund = booking.paymentStatus === PaymentStatus.SUCCEEDED ? ` ${formatKRW(booking.totalPrice)} will be refunded.` : '';
		if (!(await sweetConfirmAlert(`Cancel this booking?${refund} The guest and the host are notified.`))) return;
		try {
			await cancelBookingByAdmin({ variables: { bookingId: booking.id } });
			await refetch();
			await sweetTopSmallSuccessAlert('Booking cancelled', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const summary = [
		{ label: 'Bookings', value: String(countOf('ALL')) },
		{ label: 'Active (confirmed)', value: String(countOf(BookingStatus.CONFIRMED)) },
		// Refunded payments change to REFUNDED, so "Revenue" is already net of refunds.
		{ label: 'Revenue', value: formatKRW(paid) },
		{ label: 'Refunded', value: formatKRW(refunded) },
	];

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Bookings
			</Typography>

			<Stack direction={'row'} gap={2} sx={{ mb: 3 }} className={'admin-summary'}>
				{summary.map((item) => (
					<Box component={'div'} key={item.label} className={'admin-summary-card'}>
						<span>{item.label}</span>
						<strong>{item.value}</strong>
					</Box>
				))}
			</Stack>

			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={activeTab}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{statusTabs.map((tab) => (
									<ListItem
										key={tab.key}
										onClick={() => update({ status: tab.key === 'ALL' ? undefined : tab.key })}
										className={activeTab === tab.key ? 'li on' : 'li'}
									>
										{tab.label} ({countOf(tab.key)})
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} direction={'row'} gap={2} sx={{ m: '24px' }}>
								<TextField
									type={'date'}
									size={'small'}
									label={'Check-in from'}
									InputLabelProps={{ shrink: true }}
									value={inquiry.checkInFrom ?? ''}
									onChange={(e) => update({ checkInFrom: e.target.value || undefined })}
								/>
								<TextField
									type={'date'}
									size={'small'}
									label={'Check-in to'}
									InputLabelProps={{ shrink: true }}
									value={inquiry.checkInTo ?? ''}
									onChange={(e) => update({ checkInTo: e.target.value || undefined })}
								/>
							</Stack>
							<Divider />
						</Box>
						<BookingList bookings={result?.list ?? []} cancelHandler={cancelHandler} />
						<TablePagination
							rowsPerPageOptions={[10, 20, 40]}
							component="div"
							count={result?.total ?? 0}
							rowsPerPage={inquiry.limit}
							page={inquiry.page - 1}
							onPageChange={(_, page) => setInquiry({ ...inquiry, page: page + 1 })}
							onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminBookings);
