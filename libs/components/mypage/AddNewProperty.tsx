import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import FormSelect from '../common/FormSelect';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { REACT_APP_API_URL, propertySquare } from '../../config';
import { PropertyInput } from '../../types/property/property.input';
import { PropertyUpdate } from '../../types/property/property.update';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { userVar } from '../../../apollo/store';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { CREATE_PROPERTY, UPDATE_PROPERTY } from '../../../apollo/user/mutation';
import { GET_PROPERTY } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { formatKRW, isPositiveInt, parsePositiveInt } from '../../utils';

const AddProperty = ({ initialValues, ...props }: any) => {
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertPropertyData, setInsertPropertyData] = useState<PropertyInput>(initialValues);
	const [priceText, setPriceText] = useState<string>('');
	const [guestsText, setGuestsText] = useState<string>('');
	const propertyId = typeof router.query.propertyId === 'string' ? router.query.propertyId : '';
	const isEditMode = Boolean(propertyId);
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [propertyLocation, setPropertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createProperty] = useMutation(CREATE_PROPERTY);
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getPropertyLoading,
		data: getPropertyData,
		error: getPropertyError,
		refetch: getPropertyRefetch,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		skip: !isEditMode,
		variables: {
			input: propertyId,
		},
	});

	// getProperty returns ACTIVE listings only, so a missing result means the listing cannot be edited
	const editUnavailable =
		isEditMode &&
		!getPropertyLoading &&
		(Boolean(getPropertyError) || (getPropertyData !== undefined && !getPropertyData.getProperty));

	/** LIFECYCLES **/
	useEffect(() => {
		const loaded = getPropertyData?.getProperty;
		setPriceText(loaded ? String(loaded.pricePerNight) : '');
		setGuestsText(loaded ? String(loaded.maxGuests) : '');
	}, [getPropertyData]);

	useEffect(() => {
		setInsertPropertyData({
			...insertPropertyData,
			propertyTitle: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyTitle : '',
			pricePerNight: getPropertyData?.getProperty ? getPropertyData?.getProperty?.pricePerNight : 0,
			maxGuests: getPropertyData?.getProperty ? getPropertyData?.getProperty?.maxGuests : 0,
			propertyType: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyType : '',
			propertyLocation: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyLocation : '',
			propertyAddress: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyAddress : '',
			propertyRooms: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyRooms : 0,
			propertyBeds: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyBeds : 0,
			propertySquare: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertySquare : 0,
			propertyDesc: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyDesc : '',
			propertyImages: getPropertyData?.getProperty ? getPropertyData?.getProperty?.propertyImages : [],
		});
	}, [getPropertyLoading, getPropertyData]);

	/** HANDLERS **/
	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length == 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'property',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;

			console.log('+responseImages: ', responseImages);
			setInsertPropertyData({ ...insertPropertyData, propertyImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertPropertyData.propertyTitle === '' ||
			!isPositiveInt(insertPropertyData.maxGuests) ||
			!isPositiveInt(insertPropertyData.pricePerNight) || // @ts-ignore
			insertPropertyData.propertyType === '' || // @ts-ignore
			insertPropertyData.propertyLocation === '' || // @ts-ignore
			insertPropertyData.propertyAddress === '' || // @ts-ignore
			insertPropertyData.propertyRooms === 0 ||
			insertPropertyData.propertyBeds === 0 ||
			insertPropertyData.propertySquare === 0 ||
			insertPropertyData.propertyDesc === '' ||
			insertPropertyData.propertyImages.length === 0
		) {
			return true;
		}
		return false;
	};

	const hasValidNumbers = async (): Promise<boolean> => {
		if (isPositiveInt(insertPropertyData.pricePerNight) && isPositiveInt(insertPropertyData.maxGuests)) return true;
		await sweetMixinErrorAlert('Price per night and maximum guests must be positive whole numbers.');
		return false;
	};

	const insertPropertyHandler = useCallback(async () => {
		try {
			if (!(await hasValidNumbers())) return;
			await createProperty({
				variables: {
					input: insertPropertyData,
				},
			});

			await sweetMixinSuccessAlert(
				'Your stay was submitted for review. It will appear in search once the Kostay team approves it.',
			);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProperties',
					status: 'PENDING',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertPropertyData]);

	const updatePropertyHandler = useCallback(async () => {
		try {
			const id = getPropertyData?.getProperty?._id;
			if (!id) return;
			if (!(await hasValidNumbers())) return;
			const { memberId, ...fields } = insertPropertyData;
			const input: PropertyUpdate = { ...fields, _id: id };
			await updateProperty({
				variables: {
					input,
				},
			});

			await sweetMixinSuccessAlert('This listing has been updated successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProperties',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertPropertyData, getPropertyData]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	const priceInvalid = priceText !== '' && parsePositiveInt(priceText) === null;
	const guestsInvalid = guestsText !== '' && parsePositiveInt(guestsText) === null;

	// "SEOUL" → "Seoul", "HANOK" → "Hanok"
	const toLabel = (value: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');
	const countOptions = [1, 2, 3, 4, 5].map((count) => ({ value: count, label: String(count) }));
	const sizeOptions = propertySquare
		.filter((square) => square !== 0)
		.map((square) => ({ value: square, label: `${square} m²` }));
	const backToStays = () => router.push({ pathname: '/mypage', query: { category: 'myProperties' } });

	if (editUnavailable) {
		return (
			<div id="add-property-page">
				<div className="sx-form-head">
					<h3>Edit listing</h3>
					<p>This listing can no longer be edited.</p>
				</div>
				<div className="sx-form-actions">
					<button type="button" className="sx-form-primary" onClick={backToStays}>
						Back to My Stays
					</button>
				</div>
			</div>
		);
	}

	const imageCount = insertPropertyData?.propertyImages?.length ?? 0;

	return (
		<div id="add-property-page">
			<div className="sx-form-head">
				<h3>{isEditMode ? 'Edit listing' : 'Add a new stay'}</h3>
				<p>
					{isEditMode
						? 'Update the details guests see on your stay page.'
						: 'Tell guests about your place. The Kostay team reviews every new stay before it appears in search.'}
				</p>
			</div>

			{/* Basics */}
			<section className="sx-form-card">
				<h4>Basics</h4>
				<label className="sx-field">
					<span>Title</span>
					<input
						type="text"
						placeholder="e.g. Seongdong Family House"
						value={insertPropertyData.propertyTitle}
						onChange={({ target: { value } }) => setInsertPropertyData({ ...insertPropertyData, propertyTitle: value })}
					/>
				</label>
				<div className="sx-field-row">
					<div className="sx-field">
						<span id="stay-type-label">Stay type</span>
						<FormSelect
							labelId="stay-type-label"
							value={insertPropertyData.propertyType || ''}
							options={propertyType.map((type: any) => ({ value: type, label: toLabel(type) }))}
							placeholder="Select a type"
							onChange={(value) => setInsertPropertyData({ ...insertPropertyData, propertyType: value as PropertyType })}
						/>
					</div>
					<div className="sx-field">
						<span id="stay-location-label">Location</span>
						<FormSelect
							labelId="stay-location-label"
							value={insertPropertyData.propertyLocation || ''}
							options={propertyLocation.map((location: any) => ({ value: location, label: toLabel(location) }))}
							placeholder="Select a location"
							onChange={(value) =>
								setInsertPropertyData({ ...insertPropertyData, propertyLocation: value as PropertyLocation })
							}
						/>
					</div>
				</div>
				<label className="sx-field">
					<span>Address</span>
					<input
						type="text"
						placeholder="e.g. Seongdong-gu, Seoul, South Korea"
						value={insertPropertyData.propertyAddress}
						onChange={({ target: { value } }) => setInsertPropertyData({ ...insertPropertyData, propertyAddress: value })}
					/>
				</label>
			</section>

			{/* Capacity & price */}
			<section className="sx-form-card">
				<h4>Capacity &amp; price</h4>
				<div className="sx-field-row">
					<label className="sx-field">
						<span>Price per night</span>
						<span className="sx-input-money">
							<em>₩</em>
							<input
								type="text"
								inputMode="numeric"
								placeholder="e.g. 120000"
								value={priceText}
								aria-invalid={priceInvalid}
								onChange={({ target: { value } }) => {
									setPriceText(value);
									setInsertPropertyData({ ...insertPropertyData, pricePerNight: parsePositiveInt(value) ?? 0 });
								}}
							/>
						</span>
						{priceInvalid ? (
							<small className="is-error">Enter a whole number of won greater than 0.</small>
						) : (
							insertPropertyData.pricePerNight > 0 && <small>{formatKRW(insertPropertyData.pricePerNight)} / night</small>
						)}
					</label>
					<label className="sx-field">
						<span>Maximum guests</span>
						<input
							type="number"
							min={1}
							step={1}
							placeholder="e.g. 4"
							value={guestsText}
							aria-invalid={guestsInvalid}
							onChange={({ target: { value } }) => {
								setGuestsText(value);
								setInsertPropertyData({ ...insertPropertyData, maxGuests: parsePositiveInt(value) ?? 0 });
							}}
						/>
						{guestsInvalid && <small className="is-error">Enter a whole number of guests greater than 0.</small>}
					</label>
				</div>
				<div className="sx-field-row is-three">
					<div className="sx-field">
						<span id="stay-rooms-label">Rooms</span>
						<FormSelect
							labelId="stay-rooms-label"
							value={insertPropertyData.propertyRooms || ''}
							options={countOptions}
							placeholder="Select"
							onChange={(value) => setInsertPropertyData({ ...insertPropertyData, propertyRooms: parseInt(value) })}
						/>
					</div>
					<div className="sx-field">
						<span id="stay-beds-label">Bedrooms</span>
						<FormSelect
							labelId="stay-beds-label"
							value={insertPropertyData.propertyBeds || ''}
							options={countOptions}
							placeholder="Select"
							onChange={(value) => setInsertPropertyData({ ...insertPropertyData, propertyBeds: parseInt(value) })}
						/>
					</div>
					<div className="sx-field">
						<span id="stay-size-label">Size</span>
						<FormSelect
							labelId="stay-size-label"
							value={insertPropertyData.propertySquare || ''}
							options={sizeOptions}
							placeholder="Select"
							onChange={(value) => setInsertPropertyData({ ...insertPropertyData, propertySquare: parseInt(value) })}
						/>
					</div>
				</div>
			</section>

			{/* Description */}
			<section className="sx-form-card">
				<h4>Description</h4>
				<label className="sx-field">
					<span>About this stay</span>
					<textarea
						rows={6}
						placeholder="What makes your place special? Mention the neighbourhood, the rooms and anything guests should know."
						value={insertPropertyData.propertyDesc}
						onChange={({ target: { value } }) => setInsertPropertyData({ ...insertPropertyData, propertyDesc: value })}
					></textarea>
				</label>
			</section>

			{/* Photos */}
			<section className="sx-form-card">
				<div className="sx-form-card-head">
					<h4>Photos</h4>
					<span>{imageCount} / 5</span>
				</div>
				<div className="sx-upload">
					<AddPhotoAlternateOutlinedIcon aria-hidden="true" />
					<strong>Add up to 5 photos</strong>
					<small>JPEG or PNG. The first photo is the cover. Choosing new photos replaces the current ones.</small>
					<button type="button" onClick={() => inputRef.current.click()}>
						Browse files
					</button>
					<input
						ref={inputRef}
						type="file"
						hidden={true}
						onChange={uploadImages}
						multiple={true}
						accept="image/jpg, image/jpeg, image/png"
					/>
				</div>
				{imageCount > 0 && (
					<ul className="sx-gallery">
						{insertPropertyData.propertyImages.map((image: string, index: number) => (
							<li key={image}>
								<img src={`${REACT_APP_API_URL}/${image}`} alt="" />
								{index === 0 && <span>Cover</span>}
							</li>
						))}
					</ul>
				)}
			</section>

			<div className="sx-form-actions">
				<button type="button" className="sx-form-secondary" onClick={backToStays}>
					Cancel
				</button>
				<button
					type="button"
					className="sx-form-primary"
					disabled={doDisabledCheck()}
					onClick={isEditMode ? updatePropertyHandler : insertPropertyHandler}
				>
					{isEditMode ? 'Save changes' : 'Submit for review'}
				</button>
			</div>
			{doDisabledCheck() && <p className="sx-form-note">Fill in every field and add at least one photo to continue.</p>}
		</div>
	);
};

AddProperty.defaultProps = {
	initialValues: {
		propertyTitle: '',
		pricePerNight: 0,
		maxGuests: 0,
		propertyType: '',
		propertyLocation: '',
		propertyAddress: '',
		propertyRooms: 0,
		propertyBeds: 0,
		propertySquare: 0,
		propertyDesc: '',
		propertyImages: [],
	},
};

export default AddProperty;
