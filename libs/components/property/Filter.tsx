import React, { useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { propertySquare } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: (input: PropertiesInquiry) => Promise<void>;
	initialInput: PropertiesInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const [propertyLocation, setPropertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);
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
		setShowMore(Boolean(searchFilter.search.locationList?.length));
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
		setShowMore(false);
		await setSearchFilter({ ...initialInput, page: 1 });
	};

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Home</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									updateSearch({ ...searchFilter.search, text: searchText });
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											updateSearch({ ...searchFilter.search, text: '' });
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Location
					</p>
					<Stack
						className={`property-location`}
						style={{ height: showMore ? '253px' : '115px' }}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.locationList) {
								setShowMore(false);
							}
						}}
					>
						{propertyLocation.map((location: string) => {
							return (
								<Stack className={'input-box'} key={location}>
									<Checkbox
										id={location}
										className="property-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(searchFilter?.search?.locationList || []).includes(location as PropertyLocation)}
										onChange={propertyLocationSelectHandler}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="property-type">{location}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Property Type</Typography>
					{propertyType.map((type: string) => (
						<Stack className={'input-box'} key={type}>
							<Checkbox
								id={type}
								className="property-checkbox"
								color="default"
								size="small"
								value={type}
								onChange={propertyTypeSelectHandler}
								checked={(searchFilter?.search?.typeList || []).includes(type as PropertyType)}
							/>
							<label style={{ cursor: 'pointer' }}>
								<Typography className="property_type">{type}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Rooms</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !searchFilter?.search?.roomsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => propertyRoomSelectHandler(0)}
						>
							Any
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.roomsList?.includes(1) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.roomsList?.includes(1) ? undefined : 'none',
							}}
							onClick={() => propertyRoomSelectHandler(1)}
						>
							1
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.roomsList?.includes(2) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.roomsList?.includes(2) ? undefined : 'none',
							}}
							onClick={() => propertyRoomSelectHandler(2)}
						>
							2
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.roomsList?.includes(3) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.roomsList?.includes(3) ? undefined : 'none',
							}}
							onClick={() => propertyRoomSelectHandler(3)}
						>
							3
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.roomsList?.includes(4) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.roomsList?.includes(4) ? undefined : 'none',
								borderRight: searchFilter?.search?.roomsList?.includes(4) ? undefined : 'none',
							}}
							onClick={() => propertyRoomSelectHandler(4)}
						>
							4
						</Button>
						<Button
							sx={{
								borderRadius: '0 12px 12px 0',
								border: searchFilter?.search?.roomsList?.includes(5) ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => propertyRoomSelectHandler(5)}
						>
							5+
						</Button>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Bedrooms</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !searchFilter?.search?.bedsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => propertyBedSelectHandler(0)}
						>
							Any
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.bedsList?.includes(1) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.bedsList?.includes(1) ? undefined : 'none',
							}}
							onClick={() => propertyBedSelectHandler(1)}
						>
							1
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.bedsList?.includes(2) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.bedsList?.includes(2) ? undefined : 'none',
							}}
							onClick={() => propertyBedSelectHandler(2)}
						>
							2
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.bedsList?.includes(3) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.bedsList?.includes(3) ? undefined : 'none',
							}}
							onClick={() => propertyBedSelectHandler(3)}
						>
							3
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.bedsList?.includes(4) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.bedsList?.includes(4) ? undefined : 'none',
								// borderRight: false ? undefined : 'none',
							}}
							onClick={() => propertyBedSelectHandler(4)}
						>
							4
						</Button>
						<Button
							sx={{
								borderRadius: '0 12px 12px 0',
								border: searchFilter?.search?.bedsList?.includes(5) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.bedsList?.includes(5) ? undefined : 'none',
							}}
							onClick={() => propertyBedSelectHandler(5)}
						>
							5+
						</Button>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Square meter</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="demo-simple-select-label">Min</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.squaresRange?.start ?? 0}
								label="Min"
								onChange={(e: any) => propertySquareHandler(e, 'start')}
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
						<div className="central-divider"></div>
						<FormControl>
							<InputLabel id="demo-simple-select-label">Max</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.squaresRange?.end ?? 500}
								label="Max"
								onChange={(e: any) => propertySquareHandler(e, 'end')}
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
					</Stack>
				</Stack>
				<Stack className="find-your-home" mb="30px">
					<label className="title" htmlFor="property-guests">Guests</label>
					<input id="property-guests" className="guest-input" type="number" min={1} max={2147483647} step={1}
						placeholder="Any" value={guestsCount} onChange={(e) => guestsCountHandler(e.target.value)}
						aria-invalid={guestError} aria-describedby={guestError ? 'property-guests-error' : undefined} />
					{guestError && <p id="property-guests-error" className="filter-error" role="alert">Enter a positive whole number of guests.</p>}
				</Stack>
				<Stack className="find-your-home">
					<Typography className="title">Price per night (KRW)</Typography>
					<Stack className="square-year-input">
						<input type="number" placeholder="₩ min" aria-label="Minimum nightly price in KRW" min={0} max={2147483647} step={1}
							value={priceRange.start} onChange={(e) => propertyPriceHandler(e.target.value, 'start')}
							aria-invalid={priceError} aria-describedby={priceError ? 'property-price-error' : undefined} />
						<div className="central-divider"></div>
						<input type="number" placeholder="₩ max" aria-label="Maximum nightly price in KRW" min={0} max={2147483647} step={1}
							value={priceRange.end} onChange={(e) => propertyPriceHandler(e.target.value, 'end')}
							aria-invalid={priceError} aria-describedby={priceError ? 'property-price-error' : undefined} />
					</Stack>
					{priceError && <p id="property-price-error" className="filter-error" role="alert">Enter both bounds as nonnegative whole numbers, with minimum ≤ maximum.</p>}
					<Stack className="price-actions" direction="row">
						<Button disabled={priceError} onClick={applyPriceHandler}>Apply price</Button>
						<Button onClick={() => {
							setPriceRange({ start: '', end: '' });
							updateSearch({ ...searchFilter.search, pricesRange: undefined });
						}}>Clear price</Button>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
