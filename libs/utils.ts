import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';
import { Direction } from './enums/common.enum';
import { PropertyLocation, PropertyType } from './enums/property.enum';
import type { PropertiesInquiry } from './types/property/property.input';

const krwFormatter = new Intl.NumberFormat('ko-KR', {
	style: 'currency',
	currency: 'KRW',
	maximumFractionDigits: 0,
});

export const formatKRW = (value: number | null | undefined): string =>
	typeof value === 'number' && Number.isFinite(value) ? krwFormatter.format(value) : '—';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

const isGraphQLInt = (value: unknown): value is number =>
	typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647;

export const isPositiveInt = (value: unknown): value is number => isGraphQLInt(value) && value > 0;

/** Strict digits-only parse; returns null for empty, decimal, signed or partly numeric input. */
export const parsePositiveInt = (value: string): number | null => {
	const trimmed = value.trim();
	if (!/^\d+$/.test(trimmed)) return null;
	const parsed = Number(trimmed);
	return isPositiveInt(parsed) ? parsed : null;
};

export const normalizePropertySearch = (input: unknown, defaults: PropertiesInquiry): PropertiesInquiry => {
	let value = input;
	if (typeof value === 'string') {
		try {
			value = JSON.parse(value);
		} catch {
			value = defaults;
		}
	}
	const source = isRecord(value) ? value : defaults;
	const rawSearch = isRecord(source.search) ? source.search : defaults.search;
	const search: PropertiesInquiry['search'] = {};

	if (typeof rawSearch.memberId === 'string' && /^[a-f\d]{24}$/i.test(rawSearch.memberId)) {
		search.memberId = rawSearch.memberId;
	}
	if (typeof rawSearch.text === 'string' && rawSearch.text.trim()) search.text = rawSearch.text.trim();
	if (isGraphQLInt(rawSearch.guestsCount) && rawSearch.guestsCount > 0) search.guestsCount = rawSearch.guestsCount;
	// Availability dates: plain YYYY-MM-DD; check-out only kept after a valid check-in.
	const isYMD = (item: unknown): item is string => typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item);
	if (isYMD(rawSearch.checkIn)) {
		search.checkIn = rawSearch.checkIn;
		if (isYMD(rawSearch.checkOut) && rawSearch.checkOut > rawSearch.checkIn) search.checkOut = rawSearch.checkOut;
	}

	const locations = Array.isArray(rawSearch.locationList)
		? rawSearch.locationList.filter((item): item is PropertyLocation => Object.values(PropertyLocation).includes(item))
		: [];
	const types = Array.isArray(rawSearch.typeList)
		? rawSearch.typeList.filter((item): item is PropertyType => Object.values(PropertyType).includes(item))
		: [];
	if (locations.length) search.locationList = Array.from(new Set(locations));
	if (types.length) search.typeList = Array.from(new Set(types));
	for (const key of ['roomsList', 'bedsList'] as const) {
		const list = rawSearch[key];
		const numbers = Array.isArray(list) ? list.filter((item) => isGraphQLInt(item) && item > 0) : [];
		if (numbers.length) search[key] = Array.from(new Set(numbers));
	}
	for (const key of ['pricesRange', 'squaresRange'] as const) {
		const range = rawSearch[key];
		if (isRecord(range) && isGraphQLInt(range.start) && isGraphQLInt(range.end) && range.start <= range.end) {
			search[key] = { start: range.start, end: range.end };
		}
	}

	const sorts = ['createdAt', 'updatedAt', 'propertyLikes', 'propertyViews', 'propertyRank', 'pricePerNight'];
	return {
		page: isGraphQLInt(source.page) && source.page > 0 ? source.page : defaults.page,
		limit: isGraphQLInt(source.limit) && source.limit > 0 ? source.limit : defaults.limit,
		sort: typeof source.sort === 'string' && sorts.includes(source.sort) ? source.sort : defaults.sort ?? 'createdAt',
		direction:
			source.direction === Direction.ASC || source.direction === Direction.DESC
				? source.direction
				: defaults.direction ?? Direction.DESC,
		search,
	};
};

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetPropertyHandler = async (likeTargetProperty: any, id: string) => {
	try {
		await likeTargetProperty({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetPropertyHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
