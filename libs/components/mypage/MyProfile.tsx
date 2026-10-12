import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { useMutation, useReactiveVar } from '@apollo/client';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { Messages, REACT_APP_API_URL } from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const BIO_LIMIT = 300;

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		resetFromUser();
	}, [user]);

	/** HANDLERS **/
	// Also used by "Discard Changes": put the form back to the saved account values.
	const resetFromUser = () => {
		setUpdateData({
			...initialValues,
			memberNick: user.memberNick,
			memberFullName: user.memberFullName,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
			memberDesc: user.memberDesc,
		});
	};

	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			updateData.memberImage = responseImage;
			setUpdateData({ ...updateData });

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			// memberFullName is optional but must be 3+ chars on the backend, so don't send it blank.
			const { memberFullName, ...rest } = updateData;
			const fullName = memberFullName?.trim();
			const input: MemberUpdate = { ...rest, _id: user._id, ...(fullName ? { memberFullName: fullName } : {}) };
			const result = await updateMember({
				variables: {
					input,
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('information updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const fullNameLength = updateData.memberFullName?.trim().length ?? 0;
	const fullNameTooShort = fullNameLength > 0 && fullNameLength < 3;

	// Save is only useful when something differs from the saved account values.
	const editableFields = [
		'memberNick',
		'memberFullName',
		'memberPhone',
		'memberAddress',
		'memberImage',
		'memberDesc',
	] as const;
	const isDirty = editableFields.some((key) => (updateData[key] ?? '') !== (user[key] ?? ''));

	// Only nick and phone are required by the backend; address, full name and bio are optional.
	const doDisabledCheck = () => !isDirty || !updateData.memberNick || !updateData.memberPhone || fullNameTooShort;

	return (
		<div id="my-profile-page">
			<section className="sx-profile-card">
				<header className="sx-profile-head">
					<h2>Profile Information</h2>
				</header>

				<div className="sx-profile-body">
					<div className="sx-profile-photo">
						<span className="sx-profile-avatar">
							{updateData?.memberImage ? (
								<img src={`${REACT_APP_API_URL}/${updateData.memberImage}`} alt="" />
							) : (
								<PersonIcon aria-hidden="true" />
							)}
						</span>
						<div className="sx-profile-photo-copy">
							<strong>Profile Picture</strong>
							<p>Supports JPG, JPEG or PNG under 5MB.</p>
						</div>
						<div className="sx-profile-photo-actions">
							<input type="file" hidden id="hidden-input" onChange={uploadImage} accept="image/jpg, image/jpeg, image/png" />
							<label htmlFor="hidden-input" className="sx-upload-btn">
								<CloudUploadOutlinedIcon aria-hidden="true" />
								Upload New
							</label>
							{/* TODO: backend — delete the stored image file */}
							<button
								type="button"
								className="sx-outline-btn"
								onClick={() => setUpdateData({ ...updateData, memberImage: '' })}
								disabled={!updateData?.memberImage}
							>
								Remove
							</button>
						</div>
					</div>

					<div className="sx-profile-grid">
						<label className="sx-field">
							<span className="sx-field-label">Legal Full Name</span>
							<span className="sx-input">
								<BadgeOutlinedIcon aria-hidden="true" />
								<input
									type="text"
									placeholder="Your full name"
									value={updateData.memberFullName ?? ''}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberFullName: value })}
								/>
							</span>
							{fullNameTooShort && <small className="sx-field-error">At least 3 characters</small>}
						</label>
						<label className="sx-field">
							<span className="sx-field-label">Community Handle / Username</span>
							<span className="sx-input">
								<AlternateEmailIcon aria-hidden="true" />
								<input
									type="text"
									placeholder="Your username"
									value={updateData.memberNick ?? ''}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
								/>
							</span>
						</label>
						<label className="sx-field">
							<span className="sx-field-label">Mobile Phone</span>
							<span className="sx-input">
								<PhoneOutlinedIcon aria-hidden="true" />
								<input
									type="text"
									placeholder="Your phone"
									value={updateData.memberPhone ?? ''}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
								/>
							</span>
						</label>
						{/* TODO: backend — members have no email field yet */}
						<label className="sx-field">
							<span className="sx-field-label">Primary Email</span>
							<span className="sx-input is-readonly">
								<MailOutlineIcon aria-hidden="true" />
								<input type="email" placeholder="Not connected yet" readOnly />
							</span>
						</label>
						<label className="sx-field">
							<span className="sx-field-label">Home City / Neighborhood</span>
							<span className="sx-input">
								<LocationCityOutlinedIcon aria-hidden="true" />
								<input
									type="text"
									placeholder="Your address"
									value={updateData.memberAddress ?? ''}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
								/>
							</span>
						</label>
						{/* TODO: backend — preferred languages are not stored yet */}
						<label className="sx-field">
							<span className="sx-field-label">Preferred Languages</span>
							<span className="sx-input is-readonly">
								<TranslateIcon aria-hidden="true" />
								<input type="text" placeholder="Korean, English" readOnly />
							</span>
						</label>
						<label className="sx-field is-wide">
							<span className="sx-field-label">
								About Me / Traveler Bio
								<small className="sx-counter">
									{(updateData.memberDesc ?? '').length} / {BIO_LIMIT} characters
								</small>
							</span>
							<textarea
								rows={3}
								maxLength={BIO_LIMIT}
								placeholder="Tell hosts and travelers a little about yourself"
								value={updateData.memberDesc ?? ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
							/>
						</label>
					</div>

					<div className="sx-profile-footer">
						{/* TODO: backend — real last-saved time */}
						<small>
							<CheckCircleOutlineIcon aria-hidden="true" />
							Changes are saved to your Kostay account
						</small>
						<div className="sx-profile-footer-actions">
							<button type="button" className="sx-outline-btn" onClick={resetFromUser} disabled={!isDirty}>
								Discard Changes
							</button>
							<button type="button" className="sx-update-btn" onClick={updatePropertyHandler} disabled={doDisabledCheck()}>
								Save Profile Updates
								<SaveOutlinedIcon aria-hidden="true" />
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberFullName: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;
