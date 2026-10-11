import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { propertySquare } from '../../config';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { buildPropertyQuery, normalizePropertySearch } from '../../utils';
import moment from 'moment';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const DATE_FORMAT = 'YYYY-MM-DD';
const MAX_GUESTS_STEPPER = 16;

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	maxWidth: 'calc(100vw - 48px)',
	borderRadius: '24px',
	outline: 'none',
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface HeaderFilterProps {
	initialInput: PropertiesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
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
	// Dates travel as separate URL params; getProperties has no availability filter yet.
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [propertyLocation, setPropertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));

	const [guestsCount, setGuestsCount] = useState(initialInput.search.guestsCount?.toString() ?? '');
	const guestError =
		guestsCount !== '' &&
		(!Number.isInteger(Number(guestsCount)) || Number(guestsCount) < 1 || Number(guestsCount) > 2147483647);
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

	const propertySquareHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;

			if (type == 'start') {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						squaresRange: { ...searchFilter.search.squaresRange, start: parseInt(value) },
					},
				});
			} else {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						squaresRange: { ...searchFilter.search.squaresRange, end: parseInt(value) },
					},
				});
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(normalizePropertySearch(initialInput, initialInput));
		setGuestsCount('');
		setCheckIn('');
		setCheckOut('');
	};

	const pushSearchHandler = async () => {
		if (guestError) {
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
						checkIn: checkIn && checkOut ? checkIn : undefined,
						checkOut: checkIn && checkOut ? checkOut : undefined,
					},
				},
				initialInput,
			);
			await router.push({
				pathname: '/property',
				query: buildPropertyQuery(input, initialInput),
			});
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
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
								label: 'Stay type',
								value: searchFilter.search.typeList?.[0] || 'Any stay',
				filled: Boolean(searchFilter.search.typeList?.[0]),
								open: openType,
								toggle: typeStateChangeHandler,
							},
							{
								id: 'dates',
								label: 'Dates',
								value: datesLabel,
								filled: Boolean(checkIn && checkOut),
								open: openDates,
								toggle: datesStateChangeHandler,
							},
							{
								id: 'guests',
								label: 'Guests',
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
						<motion.button
							type="button"
							className="advanced-filter"
							onClick={() => advancedFilterHandler(true)}
							{...feedback}
						>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</motion.button>
						<motion.button
							type="button"
							className="search-btn"
							aria-label="Search stays"
							onClick={pushSearchHandler}
							{...feedback}
						>
							<img src="/img/icons/search_white.svg" alt="" />
							<span>Search</span>
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
								{propertyLocation.map((location: string, index: number) => {
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
											<img src={`img/banner/cities/${location}.webp`} alt="" />
											<span>{location}</span>
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
								{propertyType.map((type: string, index: number) => {
									return (
										<motion.button
											type="button"
											variants={optionVariants}
											initial="hidden"
											animate="visible"
											transition={{ duration: reducedMotion ? 0 : 0.15, delay: reducedMotion ? 0 : index * 0.025 }}
											style={{ backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp)` }}
											aria-pressed={searchFilter.search.typeList?.includes(type as PropertyType) ?? false}
											onClick={() => propertyTypeSelectHandler(type)}
											key={type}
										>
											<span>{type}</span>
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
								{[1, 2, 3, 4, 5].map((room: number) => {
									return (
										<motion.button
											type="button"
											{...feedback}
											aria-pressed={searchFilter.search.roomsList?.includes(room) ?? false}
											onClick={() => propertyRoomSelectHandler(room)}
											key={room}
										>
											{room} room{room > 1 ? 's' : ''}
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
								<div className={'date-fields'}>
									<label>
										<span>Check-in</span>
										<input
											type="date"
											min={today}
											value={checkIn}
											onChange={(e) => checkInChangeHandler(e.target.value)}
											aria-invalid={datesError && (checkIn === '' || checkIn < today)}
										/>
									</label>
									<label>
										<span>Check-out</span>
										<input
											type="date"
											min={minCheckOut}
											value={checkOut}
											onChange={(e) => setCheckOut(e.target.value)}
											aria-invalid={datesError && (checkOut === '' || checkOut <= checkIn)}
										/>
									</label>
								</div>
								<div className={'date-footer'}>
									{datesError ? (
										<p className={'filter-error'} role="alert">
											Choose both dates; check-out must be after check-in and not in the past.
										</p>
									) : (
										<p className={'date-note'}>Availability filtering is coming soon.</p>
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
								<motion.div className="advanced-filter-modal home-glass-dialog" {...panelMotion}>
									<button
										type="button"
										aria-label="Close filters"
										className="close"
										onClick={() => advancedFilterHandler(false)}
									>
										<CloseIcon />
									</button>
									<div className={'top'}>
										<span id="home-filter-title">Find your stay</span>
										<div className={'search-input-box'}>
											<img src="/img/icons/search.svg" alt="" />
											<input
												value={searchFilter?.search?.text ?? ''}
												type="text"
												placeholder={'What are you looking for?'}
												aria-label="Search stays by keyword"
												onChange={(e: any) => {
													setSearchFilter({
														...searchFilter,
														search: { ...searchFilter.search, text: e.target.value },
													});
												}}
											/>
										</div>
									</div>
									<Divider sx={{ mt: '30px', mb: '35px' }} />
									<div className={'middle'}>
										<div className={'row-box'}>
											<div className={'box'}>
												<span>bedrooms</span>
												<div className={'inside'}>
													<button
														type="button"
														className={`room ${!searchFilter?.search?.bedsList ? 'active' : ''}`}
														aria-pressed={!searchFilter.search.bedsList}
														onClick={() => propertyBedSelectHandler(0)}
													>
														Any
													</button>
													{[1, 2, 3, 4, 5].map((bed: number) => (
														<button
															type="button"
															className={`room ${searchFilter?.search?.bedsList?.includes(bed) ? 'active' : ''}`}
															aria-pressed={searchFilter.search.bedsList?.includes(bed) ?? false}
															onClick={() => propertyBedSelectHandler(bed)}
															key={bed}
														>
															{bed == 0 ? 'Any' : bed}
														</button>
													))}
												</div>
											</div>
											<div className="box guest-filter">
												<label htmlFor="homepage-guests">Guests</label>
												<input
													id="homepage-guests"
													type="number"
													min={1}
													max={2147483647}
													step={1}
													placeholder="Any"
													value={guestsCount}
													onChange={(e) => setGuestsCount(e.target.value)}
													aria-invalid={guestError}
													aria-describedby={guestError ? 'homepage-guests-error' : undefined}
												/>
												{guestError && (
													<p id="homepage-guests-error" role="alert">
														Enter a positive whole number of guests.
													</p>
												)}
											</div>
										</div>
										<div className={'row-box'} style={{ marginTop: '44px' }}>
											<div className={'box'}>
												<span>square meter</span>
												<div className={'inside space-between align-center'}>
													<FormControl sx={{ width: '122px' }}>
														<Select
															value={searchFilter?.search?.squaresRange?.start}
															onChange={(e: any) => propertySquareHandler(e, 'start')}
															displayEmpty
															inputProps={{ 'aria-label': 'Minimum stay size' }}
															MenuProps={MenuProps}
														>
															{propertySquare.map((square: number) => (
																<MenuItem
																	value={square}
																	disabled={(searchFilter?.search?.squaresRange?.end || 0) < square}
																	key={square}
																>
																	{square}
																</MenuItem>
															))}
														</Select>
													</FormControl>
													<div className={'minus-line'}></div>
													<FormControl sx={{ width: '122px' }}>
														<Select
															value={searchFilter?.search?.squaresRange?.end}
															onChange={(e: any) => propertySquareHandler(e, 'end')}
															displayEmpty
															inputProps={{ 'aria-label': 'Maximum stay size' }}
															MenuProps={MenuProps}
														>
															{propertySquare.map((square: number) => (
																<MenuItem
																	value={square}
																	disabled={(searchFilter?.search?.squaresRange?.start || 0) > square}
																	key={square}
																>
																	{square}
																</MenuItem>
															))}
														</Select>
													</FormControl>
												</div>
											</div>
										</div>
									</div>
									<Divider sx={{ mt: '60px', mb: '18px' }} />
									<div className={'bottom'}>
										<button type="button" className="reset-filters" onClick={resetFilterHandler}>
											<img src="/img/icons/reset.svg" alt="" />
											<span>Reset all filters</span>
										</button>
										<Button
											startIcon={<img src={'/img/icons/search.svg'} />}
											className={'search-btn'}
											disabled={guestError}
											onClick={pushSearchHandler}
										>
											Search
										</Button>
									</div>
								</motion.div>
							</Box>
						</Modal>
					)}
				</AnimatePresence>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
		},
	},
};

export default HeaderFilter;
