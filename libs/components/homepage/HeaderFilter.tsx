import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SearchIcon from '@mui/icons-material/Search';
import BookingCalendar from '../property/BookingCalendar';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { buildPropertyQuery, formatKRW, normalizePropertySearch } from '../../utils';
import moment from 'moment';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** One-line hint under each city in the Location panel. */
const cityHints: Record<string, string> = {
	SEOUL: 'Capital city',
	BUSAN: 'Beaches & harbor',
	INCHEON: 'Airport city',
	DAEGU: 'Cafes & markets',
	GYEONGJU: 'Silla heritage',
	GWANGJU: 'Art & culture',
	CHONJU: 'Hanok village',
	JEJU: 'Island escape',
};
// Most-visited cities first (2 rows of 4).
const homeLocations = ['SEOUL', 'BUSAN', 'JEJU', 'GYEONGJU', 'INCHEON', 'DAEGU', 'CHONJU', 'GWANGJU'];
const cityName = (code: string) => code.charAt(0) + code.slice(1).toLowerCase();

/** Stay type cards: photo + one-line hint (hanok uses the Jeonju hanok village photo). */
const typeCards: Record<string, { image: string; hint: string }> = {
	APARTMENT: { image: '/img/banner/types/apartment.webp', hint: 'City living' },
	VILLA: { image: '/img/banner/types/villa.webp', hint: 'Space & privacy' },
	HOUSE: { image: '/img/banner/types/house.webp', hint: 'Family homes' },
	HANOK: { image: '/img/banner/types/hanok.webp', hint: 'Traditional Korean' },
};

const DATE_FORMAT = 'YYYY-MM-DD';
const MAX_GUESTS_STEPPER = 16;

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'min(520px, calc(100vw - 24px))',
	maxWidth: 'calc(100vw - 24px)',
	borderRadius: '24px',
	outline: 'none',
};


interface HeaderFilterProps {
	initialInput: PropertiesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');
	const reducedMotion = useReducedMotion();
	const panelMotion = {
		initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: reducedMotion ? 0 : 4, pointerEvents: 'none' as const },
		transition: reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 32 },
	};
	const feedback = { whileHover: { scale: reducedMotion ? 1 : 1.015 }, whileTap: { scale: reducedMotion ? 1 : 0.98 } };
	const optionVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
	const searchRef = useRef<HTMLDivElement>(null);
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(() =>
		normalizePropertySearch(initialInput, initialInput),
	);
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [openDates, setOpenDates] = useState(false);
	const [openGuests, setOpenGuests] = useState(false);

	// Tablets and phones: panels open in the page flow under the buttons, so bring the open one into view.
	useEffect(() => {
		const id = openLocation
			? 'location'
			: openType
			? 'type'
			: openDates
			? 'dates'
			: openGuests
			? 'guests'
			: openRooms
			? 'rooms'
			: '';
		if (!id || window.innerWidth >= 1200) return;
		const timer = window.setTimeout(() => {
			document.getElementById(`home-panel-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}, 80);
		return () => window.clearTimeout(timer);
	}, [openLocation, openType, openDates, openGuests, openRooms]);
	// Dates travel as separate URL params; getProperties has no availability filter yet.
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [propertyLocation, setPropertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));

	const [guestsCount, setGuestsCount] = useState(initialInput.search.guestsCount?.toString() ?? '');
	const guestError =
		guestsCount !== '' &&
		(!Number.isInteger(Number(guestsCount)) || Number(guestsCount) < 1 || Number(guestsCount) > 2147483647);
	// Nightly price in KRW; either bound may stay empty ("from ₩X" or "up to ₩Y").
	const [priceMin, setPriceMin] = useState(initialInput.search.pricesRange?.start?.toString() ?? '');
	const [priceMax, setPriceMax] = useState(initialInput.search.pricesRange?.end?.toString() ?? '');
	const isPrice = (value: string) => value === '' || (/^\d+$/.test(value) && Number(value) <= 2147483647);
	const priceError =
		!isPrice(priceMin) || !isPrice(priceMax) || (priceMin !== '' && priceMax !== '' && Number(priceMin) > Number(priceMax));
	const pricesRange =
		priceMin === '' && priceMax === ''
			? undefined
			: { start: priceMin === '' ? 0 : Number(priceMin), end: priceMax === '' ? 2147483647 : Number(priceMax) };
	const today = moment().format(DATE_FORMAT);
	const minCheckOut = checkIn ? moment(checkIn, DATE_FORMAT).add(1, 'day').format(DATE_FORMAT) : today;
	const datesError =
		(checkIn !== '' && checkIn < today) ||
		(checkIn !== '' && checkOut !== '' && checkOut <= checkIn) ||
		(checkIn === '') !== (checkOut === '');
	const datesLabel =
		checkIn && checkOut
			? `${moment(checkIn, DATE_FORMAT).format('MMM D')} – ${moment(checkOut, DATE_FORMAT).format('MMM D')}`
			: 'Check-in — Check-out';
	const guestsNumber = guestsCount === '' || guestError ? 0 : Number(guestsCount);

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: PointerEvent) => {
			if (searchRef.current?.contains(event.target as Node)) return;
			setOpenLocation(false);
			setOpenType(false);
			setOpenRooms(false);
			setOpenDates(false);
			setOpenGuests(false);
		};
		document.addEventListener('pointerdown', clickHandler);
		return () => document.removeEventListener('pointerdown', clickHandler);
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		disableAllStateHandler();
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenRooms(false);
		setOpenType(false);
		setOpenDates(false);
		setOpenGuests(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenDates(false);
		setOpenGuests(false);
	};

	const datesStateChangeHandler = () => {
		setOpenDates((prev) => !prev);
		setOpenLocation(false);
		setOpenType(false);
		setOpenRooms(false);
		setOpenGuests(false);
	};

	const guestsStateChangeHandler = () => {
		setOpenGuests((prev) => !prev);
		setOpenLocation(false);
		setOpenType(false);
		setOpenRooms(false);
		setOpenDates(false);
	};

	const roomStateChangeHandler = () => {
		setOpenRooms((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
		setOpenDates(false);
		setOpenGuests(false);
	};

	const disableAllStateHandler = () => {
		setOpenRooms(false);
		setOpenType(false);
		setOpenLocation(false);
		setOpenDates(false);
		setOpenGuests(false);
	};

	const checkInChangeHandler = (value: string) => {
		setCheckIn(value);
		// Keep check-out after check-in: drop it if the new check-in passes it.
		if (checkOut && value && checkOut <= value) setCheckOut('');
	};

	const guestsStepHandler = (delta: number) => {
		const next = Math.min(MAX_GUESTS_STEPPER, Math.max(1, guestsNumber + delta));
		setGuestsCount(String(next));
	};

	const propertyLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				typeStateChangeHandler();
				document.getElementById('home-search-type')?.focus();
			} catch (err: any) {
				console.log('ERROR, propertyLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				datesStateChangeHandler();
				document.getElementById('home-search-dates')?.focus();
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyRoomSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						roomsList: [value],
					},
				});
				disableAllStateHandler();
				document.getElementById('home-search-rooms')?.focus();
			} catch (err: any) {
				console.log('ERROR, propertyRoomSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyBedSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.bedsList?.includes(number)) {
						setSearchFilter({
							...searchFilter,
							search: {
								...searchFilter.search,
								bedsList: searchFilter?.search?.bedsList?.filter((item: Number) => item !== number),
							},
						});
					} else {
						setSearchFilter({
							...searchFilter,
							search: { ...searchFilter.search, bedsList: [...(searchFilter?.search?.bedsList || []), number] },
						});
					}
				} else {
					delete searchFilter?.search.bedsList;
					setSearchFilter({ ...searchFilter });
				}

				console.log('propertyBedSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, propertyBedSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(normalizePropertySearch(initialInput, initialInput));
		setGuestsCount('');
		setPriceMin('');
		setPriceMax('');
		setCheckIn('');
		setCheckOut('');
	};

	const pushSearchHandler = async () => {
		if (guestError || priceError) {
			setOpenAdvancedFilter(true);
			return;
		}
		if (datesError) {
			setOpenAdvancedFilter(false);
			disableAllStateHandler();
			setOpenDates(true);
			return;
		}
		try {
			const input = normalizePropertySearch(
				{
					...searchFilter,
					page: 1,
					search: {
						...searchFilter.search,
						guestsCount: guestsCount === '' ? undefined : Number(guestsCount),
						pricesRange,
						checkIn: checkIn && checkOut ? checkIn : undefined,
						checkOut: checkIn && checkOut ? checkOut : undefined,
					},
				},
				initialInput,
			);
			await router.push({
				pathname: '/stay',
				query: buildPropertyQuery(input, initialInput),
			});
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	return (
		<>
			<Stack
				className="search-box home-glass-search"
				ref={searchRef}
				onKeyDown={(event) => {
					if (event.key === 'Escape') {
						const active = openLocation
							? 'location'
							: openType
							? 'type'
							: openDates
							? 'dates'
							: openGuests
							? 'guests'
							: openRooms
							? 'rooms'
							: null;
						disableAllStateHandler();
						if (active) document.getElementById(`home-search-${active}`)?.focus();
					}
				}}
			>
				<Stack className="select-box">
					{[
						{
							id: 'location',
							label: t('Location'),
							value: searchFilter.search.locationList?.[0] || 'Where to?',
							filled: Boolean(searchFilter.search.locationList?.[0]),
							open: openLocation,
							toggle: locationStateChangeHandler,
						},
						{
							id: 'type',
							label: t('Stay type'),
							value: searchFilter.search.typeList?.[0] || 'Any stay',
							filled: Boolean(searchFilter.search.typeList?.[0]),
							open: openType,
							toggle: typeStateChangeHandler,
						},
						{
							id: 'dates',
							label: t('Dates'),
							value: datesLabel,
							filled: Boolean(checkIn && checkOut),
							open: openDates,
							toggle: datesStateChangeHandler,
						},
						{
							id: 'guests',
							label: t('Guests'),
							value: guestsNumber ? `${guestsNumber} guest${guestsNumber > 1 ? 's' : ''}` : 'Add guests',
							filled: Boolean(guestsNumber),
							open: openGuests,
							toggle: guestsStateChangeHandler,
						},
						{
							id: 'rooms',
							label: t('Rooms'),
							value: searchFilter.search.roomsList?.[0] ? `${searchFilter.search.roomsList[0]} rooms` : 'Any rooms',
							filled: Boolean(searchFilter.search.roomsList?.[0]),
							open: openRooms,
							toggle: roomStateChangeHandler,
						},
					].map((field) => (
						<motion.button
							type="button"
							key={field.id}
							id={`home-search-${field.id}`}
							className={`box ${field.filled ? 'is-filled' : 'is-empty'} ${field.open ? 'on' : ''} ${
								field.id === 'dates' && datesError ? 'invalid' : ''
							}`}
							aria-label={`${field.label}${field.filled ? `: ${field.value}` : ''}`}
							aria-expanded={field.open}
							aria-controls={field.open ? `home-panel-${field.id}` : undefined}
							onClick={field.toggle}
							onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
								if (event.key === 'ArrowDown' && field.open) {
									event.preventDefault();
									document.getElementById(`home-panel-${field.id}`)?.querySelector<HTMLElement>('button, input')?.focus();
								}
							}}
							{...feedback}
						>
							<span className="field-copy">
								<span className="field-label">{field.label}</span>
								{field.filled && <span className="field-value">{field.value}</span>}
							</span>
							<ExpandMoreIcon />
						</motion.button>
					))}
				</Stack>
				<Stack className="search-box-other">
					<motion.button type="button" className="advanced-filter" onClick={() => advancedFilterHandler(true)} {...feedback}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>{t('Advanced')}</span>
					</motion.button>
					<motion.button
						type="button"
						className="search-btn"
						aria-label={t('Search')}
						onClick={pushSearchHandler}
						{...feedback}
					>
						<img src="/img/icons/search_white.svg" alt="" />
						<span>{t('Search')}</span>
					</motion.button>
				</Stack>

				{/*MENU */}
				<AnimatePresence>
					{openLocation && (
						<motion.div
							key="location"
							id="home-panel-location"
							role="region"
							aria-labelledby="home-search-location"
							className="filter-location on"
							{...panelMotion}
						>
							<p className="filter-location-title">Where are you going?</p>
							{homeLocations.map((location: string, index: number) => {
								return (
									<motion.button
										type="button"
										variants={optionVariants}
										initial="hidden"
										animate="visible"
										transition={{ duration: reducedMotion ? 0 : 0.15, delay: reducedMotion ? 0 : index * 0.025 }}
										aria-pressed={searchFilter.search.locationList?.includes(location as PropertyLocation) ?? false}
										onClick={() => propertyLocationSelectHandler(location)}
										key={location}
									>
										<img src={`/img/banner/cities/${location}.webp`} alt="" />
										<span className="filter-location-text">
											<strong>{cityName(location)}</strong>
											<small>{cityHints[location]}</small>
										</span>
										<i className="filter-location-check" aria-hidden="true">
											<CheckRoundedIcon />
										</i>
									</motion.button>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openType && (
						<motion.div
							key="type"
							id="home-panel-type"
							role="region"
							aria-labelledby="home-search-type"
							className="filter-type on"
							{...panelMotion}
						>
							<p className="filter-panel-title">What kind of stay?</p>
							{propertyType.map((type: string, index: number) => {
								return (
									<motion.button
										type="button"
										variants={optionVariants}
										initial="hidden"
										animate="visible"
										transition={{ duration: reducedMotion ? 0 : 0.15, delay: reducedMotion ? 0 : index * 0.025 }}
										aria-pressed={searchFilter.search.typeList?.includes(type as PropertyType) ?? false}
										onClick={() => propertyTypeSelectHandler(type)}
										key={type}
									>
										<img src={typeCards[type]?.image} alt="" />
										<span className="filter-location-text">
											<strong>{cityName(type)}</strong>
											<small>{typeCards[type]?.hint}</small>
										</span>
										<i className="filter-location-check" aria-hidden="true">
											<CheckRoundedIcon />
										</i>
									</motion.button>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openRooms && (
						<motion.div
							key="rooms"
							id="home-panel-rooms"
							role="region"
							aria-labelledby="home-search-rooms"
							className="filter-rooms on"
							{...panelMotion}
						>
							<p className="filter-panel-title">How many rooms?</p>
							{[1, 2, 3, 4, 5].map((room: number) => {
								return (
									<motion.button
										type="button"
										{...feedback}
										aria-pressed={searchFilter.search.roomsList?.includes(room) ?? false}
										onClick={() => propertyRoomSelectHandler(room)}
										key={room}
									>
										<strong>{room === 5 ? '5+' : room}</strong>
										<small>{room === 1 ? 'room' : 'rooms'}</small>
									</motion.button>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openDates && (
						<motion.div
							key="dates"
							id="home-panel-dates"
							role="region"
							aria-labelledby="home-search-dates"
							className="filter-dates on"
							{...panelMotion}
						>
							<p className="filter-panel-title">When are you staying?</p>
							{/* Both calendars at once: check-in on the left, check-out on the right. */}
							<div className={'home-dual-calendar'}>
								{(['checkIn', 'checkOut'] as const).map((field) => {
									const value = field === 'checkIn' ? checkIn : checkOut;
									return (
										<div className={'home-calendar'} key={field}>
											<div className={'home-calendar-label'}>
												<span>{field === 'checkIn' ? 'Check-in' : 'Check-out'}</span>
												<strong className={value ? '' : 'is-empty'}>
													{value ? moment(value, DATE_FORMAT).format('ddd, MMM D') : 'Add date'}
												</strong>
											</div>
											<BookingCalendar
												mode={field}
												value={value}
												checkIn={checkIn}
												checkOut={checkOut}
												min={field === 'checkIn' ? today : minCheckOut}
												bookedRanges={[]}
												onSelect={(picked) => (field === 'checkIn' ? checkInChangeHandler(picked) : setCheckOut(picked))}
												// The calendars stay open inside the panel; the panel itself closes on outside click.
												onClose={() => undefined}
											/>
										</div>
									);
								})}
							</div>
							<div className={'date-footer'}>
								{datesError ? (
									<p className={'filter-error'} role="alert">
										Choose both dates; check-out must be after check-in and not in the past.
									</p>
								) : (
									<p className={'date-note'}>
										Check-in from 13:00 · check-out by 11:00. Only stays free for these nights are shown.
									</p>
								)}
								{(checkIn || checkOut) && (
									<button
										type="button"
										className={'clear-link'}
										onClick={() => {
											setCheckIn('');
											setCheckOut('');
										}}
									>
										Clear dates
									</button>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openGuests && (
						<motion.div
							key="guests"
							id="home-panel-guests"
							role="region"
							aria-labelledby="home-search-guests"
							className="filter-guests on"
							{...panelMotion}
						>
							<p className="filter-panel-title">Who is coming?</p>
							<div className={'guests-row'}>
								<div>
									<strong>Guests</strong>
									<span>How many people are staying?</span>
								</div>
								<div className={'stepper'}>
									<button
										type="button"
										aria-label="Fewer guests"
										disabled={guestsNumber <= 1}
										onClick={() => guestsStepHandler(-1)}
									>
										−
									</button>
									<span aria-live="polite">{guestsNumber || 'Any'}</span>
									<button
										type="button"
										aria-label="More guests"
										disabled={guestsNumber >= MAX_GUESTS_STEPPER}
										onClick={() => guestsStepHandler(1)}
									>
										+
									</button>
								</div>
							</div>
							{guestsCount !== '' && (
								<button type="button" className={'clear-link'} onClick={() => setGuestsCount('')}>
									Any number of guests
								</button>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</Stack>

			{/* ADVANCED FILTER MODAL */}
			<AnimatePresence
				onExitComplete={() => {
					if (openDates) document.getElementById('home-search-dates')?.focus();
				}}
			>
				{openAdvancedFilter && (
					<Modal open={openAdvancedFilter} onClose={() => advancedFilterHandler(false)} aria-labelledby="home-filter-title">
						{/* @ts-ignore */}
						<Box sx={style} role="dialog" aria-modal="true" aria-labelledby="home-filter-title" tabIndex={-1}>
							<motion.div className="advanced-filter-modal sx-adv" {...panelMotion}>
								<div className="sx-adv-head">
									<h2 id="home-filter-title">More filters</h2>
									<button
										type="button"
										aria-label="Close filters"
										className="sx-adv-close"
										onClick={() => advancedFilterHandler(false)}
									>
										<CloseIcon />
									</button>
								</div>

								<label className="sx-adv-field">
									<span>Keyword</span>
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder="Stay name, e.g. Hanok or Ocean View"
										onChange={(e) =>
											setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: e.target.value } })
										}
									/>
								</label>

								<div className="sx-adv-field">
									<span>Bedrooms</span>
									<div className="sx-adv-chips" role="group" aria-label="Bedrooms">
										{[0, 1, 2, 3, 4, 5].map((bed: number) => {
											const active =
												bed === 0 ? !searchFilter.search.bedsList?.length : Boolean(searchFilter.search.bedsList?.includes(bed));
											return (
												<button
													type="button"
													key={bed}
													className={active ? 'active' : ''}
													aria-pressed={active}
													onClick={() => propertyBedSelectHandler(bed)}
												>
													{bed === 0 ? 'Any' : bed === 5 ? '5+' : bed}
												</button>
											);
										})}
									</div>
								</div>

								<div className="sx-adv-field">
									<span id="home-price-label">Price per night (₩)</span>
									<div className="sx-adv-range" role="group" aria-labelledby="home-price-label">
										<input
											type="number"
											inputMode="numeric"
											min={0}
											step={1000}
											placeholder="Min"
											aria-label="Minimum nightly price in KRW"
											aria-invalid={priceError}
											value={priceMin}
											onChange={(e) => setPriceMin(e.target.value)}
										/>
										<i aria-hidden="true">—</i>
										<input
											type="number"
											inputMode="numeric"
											min={0}
											step={1000}
											placeholder="Max"
											aria-label="Maximum nightly price in KRW"
											aria-invalid={priceError}
											value={priceMax}
											onChange={(e) => setPriceMax(e.target.value)}
										/>
									</div>
									{priceError ? (
										<small className="sx-adv-error" role="alert">
											Use whole numbers, with the minimum no higher than the maximum.
										</small>
									) : (
										pricesRange && (
											<small className="sx-adv-hint">
												{priceMin === ''
													? `Up to ${formatKRW(pricesRange.end)} / night`
													: priceMax === ''
													? `From ${formatKRW(pricesRange.start)} / night`
													: `${formatKRW(pricesRange.start)} – ${formatKRW(pricesRange.end)} / night`}
											</small>
										)
									)}
								</div>

								<div className="sx-adv-foot">
									<button type="button" className="sx-adv-reset" onClick={resetFilterHandler}>
										Reset all
									</button>
									<button type="button" className="sx-adv-search" disabled={guestError || priceError} onClick={pushSearchHandler}>
										<SearchIcon aria-hidden="true" />
										Show stays
									</button>
								</div>
							</motion.div>
						</Box>
					</Modal>
				)}
			</AnimatePresence>
		</>
	);
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {},
	},
};

export default HeaderFilter;
