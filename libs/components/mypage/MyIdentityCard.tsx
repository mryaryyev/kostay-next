import React from 'react';
import Link from 'next/link';
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
	const profileHref = { pathname: '/mypage', query: { category: 'myProfile' } };

	return (
		<section className="sx-identity">
			<span className="sx-identity-avatar">
				{user?.memberImage ? (
					<img src={`${REACT_APP_API_URL}/${user.memberImage}`} alt="" />
				) : (
					<PersonIcon aria-hidden="true" />
				)}
				<Link href={profileHref} className="sx-identity-camera" aria-label="Change profile photo">
					<PhotoCameraOutlinedIcon aria-hidden="true" />
				</Link>
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
			<Link href={profileHref} className="sx-identity-edit">
				<EditNoteIcon aria-hidden="true" />
				Edit Profile
			</Link>
		</section>
	);
};

export default MyIdentityCard;
