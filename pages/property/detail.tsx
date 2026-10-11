import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import BookingCalendar from '../../libs/components/property/BookingCalendar';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import SquareFootOutlinedIcon from '@mui/icons-material/SquareFootOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatKRW } from '../../libs/utils';
import { CHECK_IN_TIME, CHECK_OUT_TIME, REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import { GET_BOOKED_DATES, GET_COMMENTS, GET_MY_BOOKINGS, GET_PROPERTIES, GET_PROPERTY } from '../../apollo/user/query';
import { BookedRange, Booking } from '../../libs/types/booking/booking';
import { BookingStatus, PaymentStatus } from '../../libs/enums/booking.enum';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY, SEND_MESSAGE_TO_HOST } from '../../apollo/user/mutation';
import {
	sweetLoginConfirmAlert,
	sweetErrorHandling,
	sweetMixinErrorAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';

SwiperCore.use([Autoplay, Navigation, Pagination]);

// Booking dates are plain local YYYY-MM-DD strings (never toISOString, which shifts the day by timezone).
const pad = (value: number) => String(value).padStart(2, '0');
const toYMD = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseYMD = (ymd: string) => ymd.split('-').map(Number);
const addDays = (ymd: string, days: number) => {
	const [year, month, day] = parseYMD(ymd);
	return toYMD(new Date(year, month - 1, day + days));
};
const nightsBetween = (from: string, to: string) => {
	if (!from || !to) return 0;
	const [y1, m1, d1] = parseYMD(from);
	const [y2, m2, d2] = parseYMD(to);
	return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};
const MESSAGE_LIMIT = 500;
const toLabel = (value: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperties, setDestinationProperties] = useState<Property[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [checkIn, setCheckIn] = useState<string>('');
	const [checkOut, setCheckOut] = useState<string>('');
	const [guests, setGuests] = useState<number>(1);
	const [openCalendar, setOpenCalendar] = useState<'checkIn' | 'checkOut' | null>(null);
	const [contactName, setContactName] = useState<string>('');
	const [contactPhone, setContactPhone] = useState<string>('');
	const [contactMessage, setContactMessage] = useState<string>('');
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [sendMessageToHost, { loading: sendingMessage }] = useMutation(SEND_MESSAGE_TO_HOST);

	const {
		loading: getPropertyLoading,
		data: getPropertyData,
		error: getPropertyError,
		refetch: getPropertyRefetch,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: propertyId },
		skip: !propertyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProperty) setSlideImage(data?.getProperty?.propertyImages?.[0] ?? '');
		},
	});

	const property: Property | null =
		getPropertyData?.getProperty?._id === propertyId ? getPropertyData.getProperty : null;

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					locationList: property?.propertyLocation ? [property?.propertyLocation] : [],
				},
			},
		},
		skip: !property,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProperties?.list) setDestinationProperties(data?.getProperties?.list);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setPropertyComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const id = typeof router.query.id === 'string' ? router.query.id : '';
		setPropertyId(id || null);
		setSlideImage('');
		setCommentInquiry((current) => ({ ...current, page: 1, search: { commentRefId: id } }));
		setInsertCommentData((current) => ({ ...current, commentRefId: id }));
	}, [router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	useEffect(() => {
		// Prefill the contact form with the logged-in member; still editable.
		setContactName(user?.memberFullName || user?.memberNick || '');
		setContactPhone(user?.memberPhone || '');
	}, [user]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// execute likeTargetProperty Mutation
			await likeTargetProperty({
				variables: { input: id },
			});
			// execute refetch for chosen property(buyuk resmin sag ustu)
			await getPropertyRefetch({ input: id });
			// execute getPropertiesRefetch
			await getPropertiesRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {
						locationList: [property?.propertyLocation],
					},
				},
			});

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	/** BOOKING BOX **/
	const { data: bookedData, refetch: refetchBookedDates } = useQuery(GET_BOOKED_DATES, {
		fetchPolicy: 'cache-and-network',
		variables: { propertyId },
		skip: !propertyId,
	});
	const bookedRanges: BookedRange[] = bookedData?.getBookedDates ?? [];

	// The logged-in guest's own upcoming bookings on this stay (everyone else only sees taken days in the calendar).
	const { data: myBookingsData } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50 } },
		skip: !user?._id || !propertyId,
	});

	const today = toYMD(new Date());
	const myStayBookings: Booking[] = (myBookingsData?.getMyBookings?.list ?? []).filter(
		(b: Booking) =>
			b.propertyId === propertyId &&
			(b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) &&
			b.checkOut > today,
	);
	const nights = nightsBetween(checkIn, checkOut);
	const maxGuests = Math.max(property?.maxGuests ?? 1, 1);
	// Same rule as the database: [checkIn, checkOut) ranges must not overlap (string compare works for YYYY-MM-DD).
	const datesTaken = !!checkIn && !!checkOut && bookedRanges.some((r) => checkIn < r.checkOut && checkOut > r.checkIn);
	const datesValid = !!checkIn && !!checkOut && checkIn >= today && nights > 0 && !datesTaken;
	const totalPrice = datesValid && property ? property.pricePerNight * nights : null;

	const closeCalendar = useCallback(() => setOpenCalendar(null), []);

	const calendarSelectHandler = (value: string) => {
		if (openCalendar === 'checkIn') {
			checkInChangeHandler(value);
			// Picking check-in moves straight on to check-out.
			setOpenCalendar(value ? 'checkOut' : null);
		} else {
			setCheckOut(value);
			setOpenCalendar(null);
		}
	};

	const checkInChangeHandler = (value: string) => {
		setCheckIn(value);
		// A new check-in can make the old check-out invalid (before it, or across a booked night): ask again.
		if (!value || (checkOut && checkOut <= value)) setCheckOut('');
	};

	// Instant Book step 1 → 2: nothing is saved here; the checkout page shows the summary and takes the payment.
	const reserveHandler = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to book this stay.')) await router.push('/account/join');
			return;
		}
		await router.push({
			pathname: '/booking/checkout',
			query: { propertyId: property?._id, checkIn, checkOut, guests },
		});
	};

	// Stored as a MESSAGE notification for the host (bell + My Page → Notifications).
	const sendMessageHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await sendMessageToHost({
				variables: {
					input: {
						propertyId: property?._id,
						senderName: contactName.trim() || user.memberNick,
						senderPhone: contactPhone.trim() || undefined,
						message: contactMessage.trim(),
					},
				},
			});
			setContactMessage('');
			await sweetTopSmallSuccessAlert('Message sent to the host', 1200);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (
		device !== 'mobile' &&
		(!router.isReady || getPropertyLoading || (typeof router.query.id === 'string' && propertyId !== router.query.id))
	) {
		return (
			<div id={'property-detail-page'}>
				<Stack className="sx-detail-loading">
					<CircularProgress size={'3rem'} />
				</Stack>
			</div>
		);
	}

	if (device !== 'mobile' && (getPropertyError || !property)) {
		return (
			<div id={'property-detail-page'}>
				<Stack className="property-unavailable" role="alert">
					<Typography>This stay could not be loaded. It may no longer be available.</Typography>
					<Link href="/property">Back to stays</Link>
				</Stack>
			</div>
		);
	}

	if (device === 'mobile') {
		return <div>PROPERTY DETAIL PAGE</div>;
	} else {
		const liked = !!property?.meLiked?.[0]?.myFavorite;
		const images: string[] = property?.propertyImages ?? [];
		const mainImage = slideImage || images[0];
		const host = property?.memberData;
		const isOwnStay = !!user?._id && user._id === host?._id;
		const hostImage = host?.memberImage ? `${REACT_APP_API_URL}/${host.memberImage}` : '/img/profile/defaultUser.svg';
		const typeLabel = toLabel(property?.propertyType ?? '');
		const locationLabel = toLabel(property?.propertyLocation ?? '');
		const listedDays = moment().diff(property?.createdAt, 'days');
		const facts = [
			{ icon: <BedOutlinedIcon />, label: 'Bedrooms', value: property?.propertyBeds },
			{ icon: <MeetingRoomOutlinedIcon />, label: 'Rooms', value: property?.propertyRooms },
			{ icon: <SquareFootOutlinedIcon />, label: 'Size', value: `${property?.propertySquare} m²` },
			{ icon: <HomeOutlinedIcon />, label: 'Stay type', value: typeLabel },
			{ icon: <PeopleOutlineIcon />, label: 'Max guests', value: property?.maxGuests },
		];

		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<header className="sx-detail-head">
						<nav className="sx-detail-crumbs" aria-label="Breadcrumb">
							<Link href="/">Home</Link>
							<ChevronRightIcon aria-hidden="true" />
							<Link href="/property">Stays</Link>
							<ChevronRightIcon aria-hidden="true" />
							<span aria-current="page">{property?.propertyTitle}</span>
						</nav>
						<div className="sx-detail-title-row">
							<div>
								<div className="sx-detail-chips">
									<span className="sx-chip is-type">{typeLabel}</span>
									<span className="sx-chip">
										<PlaceOutlinedIcon aria-hidden="true" />
										{locationLabel}
									</span>
								</div>
								<h1>{property?.propertyTitle}</h1>
								<div className="sx-detail-meta">
									<span>
										<StarRoundedIcon aria-hidden="true" />
										{commentTotal} reviews
									</span>
									<span>
										<VisibilityOutlinedIcon aria-hidden="true" />
										{property?.propertyViews} views
									</span>
									<span>Listed {listedDays === 0 ? 'today' : `${listedDays} days ago`}</span>
								</div>
							</div>
							<button
								type="button"
								className={`sx-save-btn ${liked ? 'is-liked' : ''}`}
								aria-pressed={liked}
								aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
								onClick={() => likePropertyHandler(user, property?._id as string)}
							>
								{liked ? <FavoriteIcon aria-hidden="true" /> : <FavoriteBorderIcon aria-hidden="true" />}
								<span>{property?.propertyLikes}</span>
							</button>
						</div>
					</header>

					<section className="sx-gallery">
						<div className="sx-gallery-main">
							<img src={mainImage ? `${REACT_APP_API_URL}/${mainImage}` : '/img/property/bigImage.png'} alt="" />
						</div>
						{images.length > 1 && (
							<div className="sx-gallery-thumbs">
								{images.map((image: string) => (
									<button
										type="button"
										key={image}
										className={image === mainImage ? 'active' : ''}
										onClick={() => changeImageHandler(image)}
										aria-label="Show photo"
									>
										<img src={`${REACT_APP_API_URL}/${image}`} alt="" />
									</button>
								))}
							</div>
						)}
					</section>

					<div className="sx-detail-body">
						<div className="sx-detail-main">
							<section className="sx-facts">
								{facts.map((fact) => (
									<div key={fact.label} className="sx-fact">
										<small>{fact.label}</small>
										<div className="sx-fact-top">
											{fact.icon}
											<strong>{fact.value}</strong>
										</div>
									</div>
								))}
							</section>

							<section className="sx-section">
								<h3>About this stay</h3>
								<p className="sx-desc">{property?.propertyDesc || 'The host has not added a description yet.'}</p>
							</section>

							<section className="sx-section">
								<h3>Location</h3>
								<p className="sx-address">
									<PlaceOutlinedIcon aria-hidden="true" />
									{[property?.propertyAddress, locationLabel].filter(Boolean).join(', ')}
								</p>
								<div className="sx-map">
									{/* TODO: backend — map is static until stays have coordinates */}
									<iframe
										src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25867.098915951767!2d128.68632810247993!3d35.86402299180927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660bba427bf179%3A0x1fc02da732b9072f!2sGeumhogangbyeon-ro%2C%20Dong-gu%2C%20Daegu!5e0!3m2!1suz!2skr!4v1695537640704!5m2!1suz!2skr"
										width="100%"
										height="100%"
										style={{ border: 0 }}
										allowFullScreen={true}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										title="Stay location"
									></iframe>
								</div>
							</section>

							<section className="sx-section sx-reviews">
								<h3>
									<StarRoundedIcon aria-hidden="true" />
									Reviews <span>({commentTotal})</span>
								</h3>
								{commentTotal === 0 ? (
									<p className="sx-empty">No reviews yet. Be the first to share your stay.</p>
								) : (
									<div className="sx-review-list">
										{propertyComments?.map((comment: Comment) => (
											<Review comment={comment} key={comment?._id} />
										))}
										{commentTotal > commentInquiry.limit && (
											<div className="sx-review-pagination">
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
												/>
											</div>
										)}
									</div>
								)}
								<div className="sx-review-form">
									<label htmlFor="review-text">Write a review</label>
									<textarea
										id="review-text"
										rows={4}
										placeholder={user?._id ? 'How was your stay?' : 'Log in to write a review'}
										onChange={({ target: { value } }) => setInsertCommentData({ ...insertCommentData, commentContent: value })}
										value={insertCommentData.commentContent}
									/>
									<button
										type="button"
										className="sx-btn-primary"
										disabled={insertCommentData.commentContent === '' || user?._id === ''}
										onClick={createCommentHandler}
									>
										Submit Review
										<SendOutlinedIcon aria-hidden="true" />
									</button>
								</div>
							</section>
						</div>

						<aside className="sx-detail-side">
							<div className="sx-booking">
								<div className="sx-booking-price">
									<strong>{formatKRW(property?.pricePerNight)}</strong>
									<span>/ night</span>
								</div>
								<div className="sx-booking-dates">
									{(['checkIn', 'checkOut'] as const).map((field) => {
										const value = field === 'checkIn' ? checkIn : checkOut;
										return (
											<button
												type="button"
												key={field}
												className={`sx-date-field ${openCalendar === field ? 'is-open' : ''}`}
												aria-expanded={openCalendar === field}
												onClick={() => setOpenCalendar(openCalendar === field ? null : field)}
											>
												<span>{field === 'checkIn' ? 'Check-in' : 'Check-out'}</span>
												<strong className={value ? '' : 'is-empty'}>{value || 'Add date'}</strong>
											</button>
										);
									})}
									{openCalendar && (
										<BookingCalendar
											mode={openCalendar}
											value={openCalendar === 'checkIn' ? checkIn : checkOut}
											checkIn={checkIn}
											checkOut={checkOut}
											min={openCalendar === 'checkIn' ? today : addDays(checkIn || today, 1)}
											bookedRanges={bookedRanges}
											onSelect={calendarSelectHandler}
											onClose={closeCalendar}
										/>
									)}
								</div>
								<p className="sx-booking-times">
									Check-in from {CHECK_IN_TIME} · Check-out by {CHECK_OUT_TIME}
								</p>
								<div className="sx-booking-guests">
									<div>
										<span>Guests</span>
										<small>Up to {maxGuests}</small>
									</div>
									<div className="sx-stepper">
										<button type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests(guests - 1)}>
											<RemoveIcon />
										</button>
										<output aria-live="polite">{guests}</output>
										<button
											type="button"
											aria-label="More guests"
											disabled={guests >= maxGuests}
											onClick={() => setGuests(guests + 1)}
										>
											<AddIcon />
										</button>
									</div>
								</div>

								{myStayBookings.length > 0 && (
									<div className="sx-booked">
										<div className="sx-booked-head">
											<EventAvailableOutlinedIcon aria-hidden="true" />
											<strong>{myStayBookings.length === 1 ? 'Your booking' : 'Your bookings'}</strong>
										</div>
										<ul>
											{myStayBookings.map((booking) => (
												<li key={booking.id}>
													<span>
														{booking.checkIn} → {booking.checkOut}
													</span>
													<em>{booking.paymentStatus === PaymentStatus.SUCCEEDED ? 'Confirmed · Paid' : 'Not paid'}</em>
												</li>
											))}
										</ul>
										<Link href={{ pathname: '/mypage', query: { category: 'myBookings' } }}>Manage in My Bookings</Link>
									</div>
								)}
								{datesValid && (
									<dl className="sx-booking-breakdown">
										<div>
											<dt>
												{formatKRW(property?.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
											</dt>
											<dd>{formatKRW(totalPrice)}</dd>
										</div>
										<div className="is-total">
											<dt>Total</dt>
											<dd>{formatKRW(totalPrice)}</dd>
										</div>
									</dl>
								)}

								{datesTaken && (
									<p className="sx-booking-alert" role="alert">
										Those dates are already booked. Please choose other dates.
									</p>
								)}
								<button type="button" className="sx-reserve" disabled={!datesValid || isOwnStay} onClick={reserveHandler}>
									{isOwnStay ? 'This is your stay' : datesValid ? 'Booking' : 'Select dates'}
								</button>
								<p className="sx-booking-note">You won't be charged yet — review and pay on the next step</p>
							</div>

							{!isOwnStay && (
								<div className="sx-contact">
									<h3>Contact the host</h3>
									<div className="sx-contact-host">
										<img src={hostImage} alt="" />
										<div>
											<strong>{host?.memberFullName || host?.memberNick}</strong>
											{host?.memberPhone && (
												<span>
													<PhoneOutlinedIcon aria-hidden="true" />
													{host.memberPhone}
												</span>
											)}
											<Link href={`/member?memberId=${host?._id}`}>View listings</Link>
										</div>
									</div>
									<label className="sx-contact-field">
										<span>Name</span>
										<input
											type="text"
											placeholder="Enter your name"
											value={contactName}
											onChange={({ target: { value } }) => setContactName(value)}
										/>
									</label>
									<label className="sx-contact-field">
										<span>Phone</span>
										<input
											type="tel"
											placeholder="Enter your phone"
											value={contactPhone}
											onChange={({ target: { value } }) => setContactPhone(value)}
										/>
									</label>
									<label className="sx-contact-field">
										<span>
											Message
											<small>
												{contactMessage.length} / {MESSAGE_LIMIT}
											</small>
										</span>
										<textarea
											rows={4}
											maxLength={MESSAGE_LIMIT}
											placeholder={`Hello, I'm interested in "${property?.propertyTitle}".`}
											value={contactMessage}
											onChange={({ target: { value } }) => setContactMessage(value)}
										/>
									</label>
									<button
										type="button"
										className="sx-btn-primary sx-contact-send"
										disabled={!user?._id || !contactMessage.trim() || sendingMessage}
										onClick={sendMessageHandler}
									>
										Send Message
										<SendOutlinedIcon aria-hidden="true" />
									</button>
									{!user?._id && <p className="sx-contact-hint">Log in to message the host</p>}
								</div>
							)}
						</aside>
					</div>

					{destinationProperties.length !== 0 && (
						<section className="sx-nearby">
							<div className="sx-nearby-head">
								<div>
									<h3>More stays nearby</h3>
									<p>Other stays in {locationLabel}</p>
								</div>
								<div className="sx-nearby-nav">
									<button type="button" className="swiper-similar-prev" aria-label="Previous stays">
										<WestIcon />
									</button>
									<button type="button" className="swiper-similar-next" aria-label="Next stays">
										<EastIcon />
									</button>
								</div>
							</div>
							<Swiper
								className={'similar-homes-swiper'}
								slidesPerView={'auto'}
								spaceBetween={24}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-similar-next',
									prevEl: '.swiper-similar-prev',
								}}
							>
								{destinationProperties.map((property: Property) => (
									<SwiperSlide className={'similar-homes-slide'} key={property._id}>
										<PropertyBigCard property={property} likePropertyHandler={likePropertyHandler} />
									</SwiperSlide>
								))}
							</Swiper>
						</section>
					)}
				</div>
			</div>
		);
	}
};

PropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(PropertyDetail);
