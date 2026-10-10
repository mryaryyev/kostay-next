import React, { useEffect, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { propertySquare } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
	const device = useDeviceDetect();
	const propertyLocation = Object.values(PropertyLocation);
	const propertyType = Object.values(PropertyType);
	const [searchText, setSearchText] = useState<string>('');
	const [guestsCount, setGuestsCount] = useState('');
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
		setGuestsCount(searchFilter.search.guestsCount?.toString() ?? '');
		setPriceRange({
			start: searchFilter.search.pricesRange?.start.toString() ?? '',
			end: searchFilter.search.pricesRange?.end.toString() ?? '',
		});
	}, [searchFilter]);

	/** HANDLERS **/
	const updateSearch = (search: PropertiesInquiry['search']) =>
		setSearchFilter({ ...searchFilter, page: 1, search });

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
		const roomsList = number === 0 ? [] : list.includes(number) ? list.filter((item) => item !== number) : [...list, number];
		return updateSearch({ ...searchFilter.search, roomsList });
	};

	const propertyBedSelectHandler = (number: number) => {
		const list = searchFilter.search.bedsList ?? [];
		const bedsList = number === 0 ? [] : list.includes(number) ? list.filter((item) => item !== number) : [...list, number];
		return updateSearch({ ...searchFilter.search, bedsList });
	};

	const propertySquareHandler = (e: { target: { value: unknown } }, type: 'start' | 'end') =>
		updateSearch({
			...searchFilter.search,
			squaresRange: { start: 0, end: 500, ...searchFilter.search.squaresRange, [type]: Number(e.target.value) },
		});

	const propertyPriceHandler = (value: string, type: 'start' | 'end') =>
		setPriceRange((current) => ({ ...current, [type]: value }));

	const applyPriceHandler = () => {
		if (priceError) return;
		return updateSearch({
			...searchFilter.search,
			pricesRange:
				priceRange.start === '' ? undefined : { start: Number(priceRange.start), end: Number(priceRange.end) },
		});
	};

	const guestsCountHandler = (value: string) => {
		setGuestsCount(value);
		const number = Number(value);
		if (value === '' || (Number.isInteger(number) && number >= 1 && number <= 2147483647)) {
			return updateSearch({ ...searchFilter.search, guestsCount: value === '' ? undefined : number });
		}
	};

	const refreshHandler = async () => {
		setSearchText('');
		setGuestsCount('');
		setPriceRange({ start: '', end: '' });
		await setSearchFilter({ ...initialInput, page: 1 });
	};

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<aside className={'sx-filter'}>
				<div className={'sx-filter-block'}>
					<div className={'sx-filter-head'}>
						<h2>Find Your Home</h2>
						<button type={'button'} className={'sx-icon-btn'} onClick={refreshHandler} title={'Reset filters'} aria-label={'Reset filters'}>
							<RefreshIcon />
						</button>
					</div>
					<div className={'sx-search'}>
						<SearchIcon aria-hidden="true" />
						<input
							type={'text'}
							value={searchText}
							placeholder={'What are you looking for?'}
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
				</div>

				<div className={'sx-filter-divider'} />

				<div className={'sx-filter-block'}>
					<span className={'sx-filter-label'}>Location</span>
					<div className={'sx-check-grid'}>
						{propertyLocation.map((location) => (
							<label className={'sx-check'} key={location}>
								<input
									type={'checkbox'}
									value={location}
									checked={(searchFilter?.search?.locationList || []).includes(location)}
									onChange={propertyLocationSelectHandler}
								/>
								<span>{location}</span>
							</label>
						))}
					</div>
				</div>

				<div className={'sx-filter-divider'} />

				<div className={'sx-filter-block'}>
					<span className={'sx-filter-label'}>Stay Type</span>
					<div className={'sx-check-grid'}>
						{propertyType.map((type) => (
							<label className={'sx-check'} key={type}>
								<input
									type={'checkbox'}
									value={type}
									checked={(searchFilter?.search?.typeList || []).includes(type)}
									onChange={propertyTypeSelectHandler}
								/>
								<span>{type}</span>
							</label>
						))}
					</div>
				</div>

				<div className={'sx-filter-divider'} />

					<div className={'sx-filter-block'}>
						<span className={'sx-filter-label'}>Rooms</span>
						<div className={'sx-segment'} role={'group'} aria-label={'Rooms'}>
							{segmentOptions.map((option) => {
								const active =
									option.value === 0 ? !searchFilter?.search?.roomsList?.length : Boolean(searchFilter?.search?.roomsList?.includes(option.value));
								return (
									<button
										type={'button'}
										key={option.value}
										className={active ? 'is-active' : ''}
										aria-pressed={active}
										onClick={() => propertyRoomSelectHandler(option.value)}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</div>

					<div className={'sx-filter-block'}>
						<span className={'sx-filter-label'}>Bedrooms</span>
						<div className={'sx-segment'} role={'group'} aria-label={'Bedrooms'}>
							{segmentOptions.map((option) => {
								const active =
									option.value === 0 ? !searchFilter?.search?.bedsList?.length : Boolean(searchFilter?.search?.bedsList?.includes(option.value));
								return (
									<button
										type={'button'}
										key={option.value}
										className={active ? 'is-active' : ''}
										aria-pressed={active}
										onClick={() => propertyBedSelectHandler(option.value)}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</div>

				<div className={'sx-filter-block'}>
					<span className={'sx-filter-label'}>Square meter (m²)</span>
					<div className={'sx-range'}>
						<label className={'sx-field'}>
							<small>Min</small>
							<select
								value={searchFilter?.search?.squaresRange?.start ?? 0}
								onChange={(e) => propertySquareHandler(e, 'start')}
							>
								{propertySquare.map((square: number) => (
									<option value={square} disabled={(searchFilter?.search?.squaresRange?.end || 0) < square} key={square}>
										{square} m²
									</option>
								))}
							</select>
						</label>
						<span className={'sx-range-dash'}>—</span>
						<label className={'sx-field'}>
							<small>Max</small>
							<select
								value={searchFilter?.search?.squaresRange?.end ?? 500}
								onChange={(e) => propertySquareHandler(e, 'end')}
							>
								{propertySquare.map((square: number) => (
									<option value={square} disabled={(searchFilter?.search?.squaresRange?.start || 0) > square} key={square}>
										{square} m²
									</option>
								))}
							</select>
						</label>
					</div>
				</div>

				<div className={'sx-filter-block'}>
					<span className={'sx-filter-label'} id={'property-guests-label'}>
						Guests
					</span>
					<div className={'sx-stepper'} aria-labelledby={'property-guests-label'}>
						<span>Total Travelers</span>
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
				</div>

				<div className={'sx-filter-block'}>
					<span className={'sx-filter-label'}>Price per night (KRW)</span>
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
						<button
							type={'button'}
							className={'sx-clear'}
							onClick={() => {
								setPriceRange({ start: '', end: '' });
								updateSearch({ ...searchFilter.search, pricesRange: undefined });
							}}
						>
							Clear price
						</button>
					</div>
				</div>
			</aside>
		);
	}
};

export default Filter;
