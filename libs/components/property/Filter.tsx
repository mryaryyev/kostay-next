import React, { useCallback, useEffect, useState } from 'react';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BookingCalendar from './BookingCalendar';

/** Plain local YYYY-MM-DD (never toISOString). */
const pad = (value: number) => String(value).padStart(2, '0');
const toYMD = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
/** "2026-10-14" → "Wed, Oct 14" */
const formatDay = (ymd: string) => {
	const [y, m, d] = ymd.split('-').map(Number);
	return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const addDays = (ymd: string, days: number) => {
	const [y, m, d] = ymd.split('-').map(Number);
	return toYMD(new Date(y, m - 1, d + days));
};

const segmentOptions = [
	{ value: 0, label: 'Any' },
	{ value: 1, label: '1' },
	{ value: 2, label: '2' },
	{ value: 3, label: '3' },
	{ value: 4, label: '4' },
	{ value: 5, label: '5+' },
];

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: (input: PropertiesInquiry) => Promise<void>;
	initialInput: PropertiesInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const propertyLocation = Object.values(PropertyLocation);
	const propertyType = Object.values(PropertyType);
	const [searchText, setSearchText] = useState<string>('');
	const [guestsCount, setGuestsCount] = useState('');
	const [openCalendar, setOpenCalendar] = useState<'checkIn' | 'checkOut' | null>(null);
	// Dates are a local draft until both are picked (or cleared), so a lone check-in does not reload the list.
	const [checkIn, setCheckIn] = useState<string>('');
	const [checkOut, setCheckOut] = useState<string>('');
	const today = toYMD(new Date());
	const [priceRange, setPriceRange] = useState({ start: '', end: '' });
	const guestError =
		guestsCount !== '' &&
		(!Number.isInteger(Number(guestsCount)) || Number(guestsCount) < 1 || Number(guestsCount) > 2147483647);
	const priceError =
		(priceRange.start !== '' || priceRange.end !== '') &&
		(priceRange.start === '' ||
			priceRange.end === '' ||
			![priceRange.start, priceRange.end].every(
				(value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 2147483647,
			) ||
			Number(priceRange.start) > Number(priceRange.end));

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter.search.text ?? '');
		setCheckIn(searchFilter.search.checkIn ?? '');
		setCheckOut(searchFilter.search.checkOut ?? '');
		setGuestsCount(searchFilter.search.guestsCount?.toString() ?? '');
		setPriceRange({
			start: searchFilter.search.pricesRange?.start.toString() ?? '',
			end: searchFilter.search.pricesRange?.end.toString() ?? '',
		});
	}, [searchFilter]);

	/** HANDLERS **/
	const updateSearch = (search: PropertiesInquiry['search']) => setSearchFilter({ ...searchFilter, page: 1, search });

	const propertyLocationSelectHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value as PropertyLocation;
		const list = searchFilter.search.locationList ?? [];
		return updateSearch({
			...searchFilter.search,
			locationList: e.target.checked ? [...list, value] : list.filter((item) => item !== value),
		});
	};

	const propertyTypeSelectHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value as PropertyType;
		const list = searchFilter.search.typeList ?? [];
		return updateSearch({
			...searchFilter.search,
			typeList: e.target.checked ? [...list, value] : list.filter((item) => item !== value),
		});
	};

	const propertyRoomSelectHandler = (number: number) => {
		const list = searchFilter.search.roomsList ?? [];
		const roomsList =
			number === 0 ? [] : list.includes(number) ? list.filter((item) => item !== number) : [...list, number];
		return updateSearch({ ...searchFilter.search, roomsList });
	};

	const propertyBedSelectHandler = (number: number) => {
		const list = searchFilter.search.bedsList ?? [];
		const bedsList =
			number === 0 ? [] : list.includes(number) ? list.filter((item) => item !== number) : [...list, number];
		return updateSearch({ ...searchFilter.search, bedsList });
	};

	const propertyPriceHandler = (value: string, type: 'start' | 'end') =>
		setPriceRange((current) => ({ ...current, [type]: value }));

	const applyPriceHandler = () => {
		if (priceError) return;
		return updateSearch({
			...searchFilter.search,
			pricesRange: priceRange.start === '' ? undefined : { start: Number(priceRange.start), end: Number(priceRange.end) },
		});
	};

	const guestsCountHandler = (value: string) => {
		setGuestsCount(value);
		const number = Number(value);
		if (value === '' || (Number.isInteger(number) && number >= 1 && number <= 2147483647)) {
			return updateSearch({ ...searchFilter.search, guestsCount: value === '' ? undefined : number });
		}
	};

	const closeCalendar = useCallback(() => setOpenCalendar(null), []);

	// The list is filtered only when both dates are set; picking check-in moves straight on to check-out.
	const calendarSelectHandler = (value: string) => {
		let nextCheckIn = checkIn;
		let nextCheckOut = checkOut;
		if (openCalendar === 'checkIn') {
			nextCheckIn = value;
			if (!value || (checkOut && checkOut <= value)) nextCheckOut = '';
			setOpenCalendar(value ? 'checkOut' : null);
		} else {
			nextCheckOut = value;
			setOpenCalendar(null);
		}
		setCheckIn(nextCheckIn);
		setCheckOut(nextCheckOut);

		const complete = Boolean(nextCheckIn && nextCheckOut);
		const wasFiltered = Boolean(searchFilter.search.checkIn && searchFilter.search.checkOut);
		// Query only when a full range is set, or when an active date filter is removed.
		if (complete || wasFiltered) {
			return updateSearch({
				...searchFilter.search,
				checkIn: complete ? nextCheckIn : undefined,
				checkOut: complete ? nextCheckOut : undefined,
			});
		}
	};

	const refreshHandler = async () => {
		setOpenCalendar(null);
		setSearchText('');
		setGuestsCount('');
		setPriceRange({ start: '', end: '' });
		await setSearchFilter({ ...initialInput, page: 1 });
	};

	// Small chips instead of checkboxes: "SEOUL" → "Seoul".
	const toLabel = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();
	const search = searchFilter.search;
	const activeCount = [
		search.text,
		search.locationList?.length,
		search.typeList?.length,
		search.roomsList?.length,
		search.bedsList?.length,
		search.checkIn && search.checkOut,
		search.guestsCount,
		search.pricesRange,
	].filter(Boolean).length;

	const renderSegment = (label: string, list: number[] | undefined, onSelect: (value: number) => void) => (
		<div className={'sx-filter-sub'}>
			<span className={'sx-filter-sublabel'}>{label}</span>
			<div className={'sx-segment'} role={'group'} aria-label={label}>
				{segmentOptions.map((option) => {
					const active = option.value === 0 ? !list?.length : Boolean(list?.includes(option.value));
					return (
						<button
							type={'button'}
							key={option.value}
							className={active ? 'is-active' : ''}
							aria-pressed={active}
							onClick={() => onSelect(option.value)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);

	return (
		<aside className={'sx-filter'}>
			<div className={'sx-filter-head'}>
				<div>
					<h2>Find your stay</h2>
					<p>{activeCount ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied` : 'All stays in Korea'}</p>
				</div>
				<button type={'button'} className={'sx-reset'} onClick={refreshHandler} disabled={!activeCount}>
					<RefreshIcon aria-hidden="true" />
					Reset
				</button>
			</div>

			<div className={'sx-search'}>
				<SearchIcon aria-hidden="true" />
				<input
					type={'text'}
					value={searchText}
					placeholder={'Search by stay name'}
					aria-label={'Search stays'}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							updateSearch({ ...searchFilter.search, text: searchText });
						}
					}}
				/>
				{searchText && (
					<button
						type={'button'}
						aria-label={'Clear search'}
						onClick={() => {
							setSearchText('');
							updateSearch({ ...searchFilter.search, text: '' });
						}}
					>
						<CancelRoundedIcon />
					</button>
				)}
			</div>

			{/* Your trip: the booking inputs come first */}
			<section className={'sx-filter-trip'}>
				<span className={'sx-filter-label'}>Your trip</span>
				<div className={'sx-booking-dates'}>
					{(['checkIn', 'checkOut'] as const).map((field) => {
						const value = field === 'checkIn' ? checkIn : checkOut;
						return (
							<button
								type={'button'}
								key={field}
								className={`sx-date-field ${openCalendar === field ? 'is-open' : ''}`}
								aria-expanded={openCalendar === field}
								onClick={() => setOpenCalendar(openCalendar === field ? null : field)}
							>
								<span>{field === 'checkIn' ? 'Check-in' : 'Check-out'}</span>
								<strong className={value ? '' : 'is-empty'}>{value ? formatDay(value) : 'Add date'}</strong>
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
							bookedRanges={[]}
							onSelect={calendarSelectHandler}
							onClose={closeCalendar}
						/>
					)}
				</div>
				<div className={'sx-stepper'} aria-label={'Guests'}>
					<span>
						Guests
						<small>{guestsCount === '' ? 'Any number' : 'Stays that fit everyone'}</small>
					</span>
					<div>
						<button
							type={'button'}
							aria-label={'Fewer guests'}
							disabled={guestsCount === ''}
							onClick={() => guestsCountHandler(Number(guestsCount) <= 1 ? '' : String(Number(guestsCount) - 1))}
						>
							<RemoveIcon />
						</button>
						<strong aria-live={'polite'}>{guestsCount === '' ? 'Any' : guestsCount}</strong>
						<button
							type={'button'}
							aria-label={'More guests'}
							onClick={() => guestsCountHandler(String(guestsCount === '' ? 1 : Number(guestsCount) + 1))}
						>
							<AddIcon />
						</button>
					</div>
				</div>
				{guestError && (
					<p id="property-guests-error" className="filter-error" role="alert">
						Enter a positive whole number of guests.
					</p>
				)}
			</section>

			<div className={'sx-filter-block'}>
				<span className={'sx-filter-label'}>Location</span>
				<div className={'sx-chips'}>
					{propertyLocation.map((location) => (
						<label className={'sx-chip'} key={location}>
							<input
								type={'checkbox'}
								value={location}
								checked={(search.locationList || []).includes(location)}
								onChange={propertyLocationSelectHandler}
							/>
							<span>{toLabel(location)}</span>
						</label>
					))}
				</div>
			</div>

			<div className={'sx-filter-block'}>
				<span className={'sx-filter-label'}>Stay type</span>
				<div className={'sx-chips'}>
					{propertyType.map((type) => (
						<label className={'sx-chip'} key={type}>
							<input
								type={'checkbox'}
								value={type}
								checked={(search.typeList || []).includes(type)}
								onChange={propertyTypeSelectHandler}
							/>
							<span>{toLabel(type)}</span>
						</label>
					))}
				</div>
			</div>

			<div className={'sx-filter-block'}>
				<span className={'sx-filter-label'}>Price per night</span>
				<div className={'sx-range'}>
					<label className={'sx-field'}>
						<small>Min</small>
						<span className={'sx-money'}>
							<em>₩</em>
							<input
								type="number"
								aria-label="Minimum nightly price in KRW"
								placeholder="Any"
								min={0}
								max={2147483647}
								step={1}
								value={priceRange.start}
								onChange={(e) => propertyPriceHandler(e.target.value, 'start')}
								onKeyDown={(event) => event.key === 'Enter' && applyPriceHandler()}
								aria-invalid={priceError}
								aria-describedby={priceError ? 'property-price-error' : undefined}
							/>
						</span>
					</label>
					<span className={'sx-range-dash'}>—</span>
					<label className={'sx-field'}>
						<small>Max</small>
						<span className={'sx-money'}>
							<em>₩</em>
							<input
								type="number"
								aria-label="Maximum nightly price in KRW"
								placeholder="Any"
								min={0}
								max={2147483647}
								step={1}
								value={priceRange.end}
								onChange={(e) => propertyPriceHandler(e.target.value, 'end')}
								onKeyDown={(event) => event.key === 'Enter' && applyPriceHandler()}
								aria-invalid={priceError}
								aria-describedby={priceError ? 'property-price-error' : undefined}
							/>
						</span>
					</label>
				</div>
				{priceError && (
					<p id="property-price-error" className="filter-error" role="alert">
						Enter both bounds as nonnegative whole numbers, with minimum ≤ maximum.
					</p>
				)}
				<div className={'sx-price-actions'}>
					<button type={'button'} className={'sx-apply'} disabled={priceError} onClick={applyPriceHandler}>
						Apply price
					</button>
					{search.pricesRange && (
						<button
							type={'button'}
							className={'sx-clear'}
							onClick={() => {
								setPriceRange({ start: '', end: '' });
								updateSearch({ ...searchFilter.search, pricesRange: undefined });
							}}
						>
							Clear
						</button>
					)}
				</div>
			</div>

			<div className={'sx-filter-block'}>
				<span className={'sx-filter-label'}>Rooms &amp; bedrooms</span>
				{renderSegment('Rooms', search.roomsList as number[] | undefined, propertyRoomSelectHandler)}
				{renderSegment('Bedrooms', search.bedsList as number[] | undefined, propertyBedSelectHandler)}
			</div>
		</aside>
	);
};

export default Filter;
