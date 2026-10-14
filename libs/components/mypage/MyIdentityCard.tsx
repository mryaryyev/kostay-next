import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';

/** Account summary card at the top of /mypage (Stitch: My Page & Traveler Dashboard). */
const MyIdentityCard = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** Open the My Profile tab (if needed), then bring the form into view so the click always does something visible. */
	const openProfile = async (target: 'form' | 'photo') => {
		if (router.query?.category && router.query.category !== 'myProfile') {
			await router.push({ pathname: '/mypage', query: { category: 'myProfile' } }, undefined, { scroll: false });
		}
		// Wait a frame for the tab to render.
		requestAnimationFrame(() => {
			const form = document.getElementById('my-profile-page');
			form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			if (target === 'photo') document.getElementById('hidden-input')?.click();
			else form?.querySelector<HTMLInputElement>('.sx-profile-grid input:not([readonly])')?.focus({ preventScroll: true });
		});
	};

	return (
		<section className="sx-identity">
			<span className="sx-identity-avatar">
				{user?.memberImage ? (
					<img src={`${REACT_APP_API_URL}/${user.memberImage}`} alt="" />
				) : (
					<PersonIcon aria-hidden="true" />
				)}
				<button
					type="button"
					className="sx-identity-camera"
					aria-label="Change profile photo"
					onClick={() => openProfile('photo')}
				>
					<PhotoCameraOutlinedIcon aria-hidden="true" />
				</button>
			</span>
			<div className="sx-identity-copy">
				<h2>{user?.memberFullName || user?.memberNick}</h2>
				{user?.memberDesc && <p>{user.memberDesc}</p>}
				<div className="sx-identity-meta">
					{user?.memberAddress && (
						<span>
							<PlaceOutlinedIcon aria-hidden="true" />
							{user.memberAddress}
						</span>
					)}
					{user?.memberPhone && (
						<span>
							<PhoneIphoneOutlinedIcon aria-hidden="true" />
							{user.memberPhone}
						</span>
					)}
					{/* TODO: backend — "Member since" needs createdAt in the JWT payload */}
				</div>
			</div>
			<button type="button" className="sx-identity-edit" onClick={() => openProfile('form')}>
				<EditNoteIcon aria-hidden="true" />
				Edit Profile
			</button>
		</section>
	);
};

export default MyIdentityCard;
