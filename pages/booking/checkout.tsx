import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CircularProgress, Stack } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { userVar } from '../../apollo/store';
import { GET_BOOKED_DATES, GET_PROPERTY } from '../../apollo/user/query';
import { BOOK_AND_PAY } from '../../apollo/user/mutation';
import { Property } from '../../libs/types/property/property';
import { BookedRange, Booking } from '../../libs/types/booking/booking';
import { CHECK_IN_TIME, CHECK_OUT_TIME, REACT_APP_API_URL } from '../../libs/config';
import { formatKRW } from '../../libs/utils';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Dates are plain YYYY-MM-DD strings; nights are counted in UTC so no timezone shifts the day. */
const isYMD = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const nightsBetween = (from: string, to: string) => {
	const [y1, m1, d1] = from.split('-').map(Number);
	const [y2, m2, d2] = to.split('-').map(Number);
	return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};
const pad = (value: number) => String(value).padStart(2, '0');
const todayYMD = () => {
	const now = new Date();
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const toLabel = (value?: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');

// No real gateway yet: the method is stored on the payment, no card data is collected.
const paymentMethods = [
	{ key: 'CARD', label: 'Credit / debit card', icon: <CreditCardOutlinedIcon /> },
	{ key: 'KAKAOPAY', label: 'KakaoPay', icon: <AccountBalanceWalletOutlinedIcon /> },
	{ key: 'TOSS', label: 'Toss Pay', icon: <PaymentsOutlinedIcon /> },
];

/** Instant Book step 2: review the stay and pay. Booking + payment are saved together by bookAndPay. */
const Checkout: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { propertyId, checkIn, checkOut, guests } = router.query;
	const [paymentMethod, setPaymentMethod] = useState<string>('CARD');
	const [booked, setBooked] = useState<Booking | null>(null);

	const validQuery = typeof propertyId === 'string' && isYMD(checkIn) && isYMD(checkOut);
	const guestsCount = Math.max(Number(guests) || 1, 1);

	/** APOLLO REQUESTS **/
	const { data: propertyData, loading: propertyLoading } = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: propertyId },
		skip: !router.isReady || typeof propertyId !== 'string',
	});
	const { data: bookedData } = useQuery(GET_BOOKED_DATES, {
		fetchPolicy: 'network-only',
		variables: { propertyId },
		skip: !router.isReady || typeof propertyId !== 'string',
	});
	const [bookAndPay, { loading: paying }] = useMutation(BOOK_AND_PAY);

	const property: Property | undefined = propertyData?.getProperty;
	const bookedRanges: BookedRange[] = bookedData?.getBookedDates ?? [];

	/** LIFECYCLES **/
	useEffect(() => {
		// Checkout needs an account; the stay page already asks to log in before coming here.
		if (router.isReady && !user?._id) router.replace('/account/join').then();
	}, [router.isReady, user?._id]);

	/** CHECKS **/
	const nights = validQuery ? nightsBetween(checkIn as string, checkOut as string) : 0;
	const totalPrice = property ? property.pricePerNight * nights : 0;
	let problem = '';
	if (!validQuery || nights < 1) problem = 'These booking details are incomplete. Please pick your dates again.';
	else if ((checkIn as string) < todayYMD()) problem = 'Check-in cannot be in the past.';
	else if (property && guestsCount > property.maxGuests)
		problem = `This stay allows up to ${property.maxGuests} guests.`;
	else if (bookedRanges.some((r) => (checkIn as string) < r.checkOut && (checkOut as string) > r.checkIn))
		problem = 'These dates were just booked by someone else. Please choose other dates.';

	/** HANDLERS **/
	const payHandler = async () => {
		try {
			const result = await bookAndPay({
				variables: {
					input: { propertyId, checkIn, checkOut, guestsCount, paymentMethod },
				},
			});
			setBooked(result.data?.bookAndPay ?? null);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (!router.isReady || propertyLoading || !user?._id) {
		return (
			<div id="checkout-page">
				<Stack className="sx-checkout-loading">
					<CircularProgress size={'3rem'} />
				</Stack>
			</div>
		);
	}

	const stayHref = { pathname: '/stay/detail', query: { id: propertyId } };
	const image = property?.propertyImages?.[0];

	return (
		<div id="checkout-page">
			<div className="container">
				{booked ? (
					<section className="sx-checkout-success">
						<CheckCircleIcon aria-hidden="true" />
						<h1>You're booked!</h1>
						<p>
							{property?.propertyTitle} · {booked.checkIn} → {booked.checkOut} · {booked.guestsCount}{' '}
							{booked.guestsCount === 1 ? 'guest' : 'guests'}
						</p>
						<strong>{formatKRW(booked.totalPrice)} paid</strong>
						<p className="sx-checkout-muted">The host has been notified. You can cancel any time for a full refund.</p>
						<div className="sx-checkout-success-actions">
							<Link href={{ pathname: '/mypage', query: { category: 'myBookings' } }} className="sx-checkout-primary">
								View my bookings
							</Link>
							<Link href={stayHref} className="sx-checkout-secondary">
								Back to the stay
							</Link>
						</div>
					</section>
				) : (
					<>
						<Link href={stayHref} className="sx-checkout-back">
							<ChevronLeftIcon aria-hidden="true" />
							Back to the stay
						</Link>
						<h1 className="sx-checkout-title">Confirm and pay</h1>

						<div className="sx-checkout-body">
							<div className="sx-checkout-main">
								{problem && (
									<p className="sx-checkout-problem" role="alert">
										{problem} <Link href={stayHref}>Change dates</Link>
									</p>
								)}

								<section className="sx-checkout-section">
									<div className="sx-checkout-section-head">
										<h2>Your trip</h2>
										<Link href={stayHref}>Edit</Link>
									</div>
									<dl className="sx-checkout-trip">
										<div>
											<dt>Dates</dt>
											<dd>
												{validQuery ? `${checkIn} → ${checkOut}` : '—'} · {nights} {nights === 1 ? 'night' : 'nights'}
											</dd>
										</div>
										<div>
											<dt>Times</dt>
											<dd>
												Check-in from {CHECK_IN_TIME} · Check-out by {CHECK_OUT_TIME}
											</dd>
										</div>
										<div>
											<dt>Guests</dt>
											<dd>
												{guestsCount} {guestsCount === 1 ? 'guest' : 'guests'}
											</dd>
										</div>
									</dl>
								</section>

								<section className="sx-checkout-section">
									<div className="sx-checkout-section-head">
										<h2>Guest details</h2>
										<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }}>Edit profile</Link>
									</div>
									<dl className="sx-checkout-trip">
										<div>
											<dt>Name</dt>
											<dd>{user.memberFullName || user.memberNick}</dd>
										</div>
										<div>
											<dt>Phone</dt>
											<dd>{user.memberPhone || '—'}</dd>
										</div>
									</dl>
								</section>

								<section className="sx-checkout-section">
									<div className="sx-checkout-section-head">
										<h2>Pay with</h2>
										<span className="sx-checkout-test">Test mode · no real charge</span>
									</div>
									<div className="sx-checkout-methods" role="radiogroup" aria-label="Payment method">
										{paymentMethods.map((method) => (
											<button
												type="button"
												role="radio"
												key={method.key}
												aria-checked={paymentMethod === method.key}
												className={paymentMethod === method.key ? 'active' : ''}
												onClick={() => setPaymentMethod(method.key)}
											>
												{method.icon}
												<span>{method.label}</span>
												<i aria-hidden="true" />
											</button>
										))}
									</div>
								</section>

								<section className="sx-checkout-section">
									<h2>Cancellation</h2>
									<p className="sx-checkout-muted">
										<VerifiedUserOutlinedIcon aria-hidden="true" />
										Cancel any time from My Bookings and get a full refund.
									</p>
								</section>

								<button
									type="button"
									className="sx-checkout-pay"
									disabled={!!problem || !property || paying}
									onClick={payHandler}
								>
									{paying ? 'Processing…' : `Confirm and pay ${formatKRW(totalPrice)}`}
								</button>
							</div>

							<aside className="sx-checkout-summary">
								<div className="sx-checkout-stay">
									<img src={image ? `${REACT_APP_API_URL}/${image}` : '/img/property/bigImage.png'} alt="" />
									<div>
										<small>{toLabel(property?.propertyType)}</small>
										<strong>{property?.propertyTitle}</strong>
										<span>
											<PlaceOutlinedIcon aria-hidden="true" />
											{[property?.propertyAddress, toLabel(property?.propertyLocation)].filter(Boolean).join(', ')}
										</span>
									</div>
								</div>
								<h3>Price details</h3>
								<dl className="sx-checkout-price">
									<div>
										<dt>
											{formatKRW(property?.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
										</dt>
										<dd>{formatKRW(totalPrice)}</dd>
									</div>
									<div>
										<dt>Service fee</dt>
										<dd>{formatKRW(0)}</dd>
									</div>
									<div className="is-total">
										<dt>Total (KRW)</dt>
										<dd>{formatKRW(totalPrice)}</dd>
									</div>
								</dl>
							</aside>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(Checkout);
