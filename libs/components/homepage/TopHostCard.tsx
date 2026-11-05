import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EastIcon from '@mui/icons-material/East';
import { Member } from '../../types/member/member';

interface TopHostProps {
	host: Member;
}
const TopHostCard = (props: TopHostProps) => {
	const { host } = props;
	const router = useRouter();
	const [imageFailed, setImageFailed] = useState(false);
	const hostImage = host?.memberImage
		? `${process.env.REACT_APP_API_URL}/${host?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	return (
		<Link href={{ pathname: '/host/detail', query: { hostId: host?._id } }} className="sx-host-card">
			<span className="sx-host-cover" aria-hidden="true" />
			<span className="sx-host-avatar">
				<span className="sx-host-photo">
					{host?.memberImage && !imageFailed ? (
						<img src={hostImage} alt="" loading="lazy" onError={() => setImageFailed(true)} />
					) : (
						<PersonIcon aria-hidden="true" />
					)}
				</span>
				<span className="sx-host-check" aria-label="Verified Host">
					<CheckIcon aria-hidden="true" />
				</span>
			</span>
			<strong>{host?.memberNick}</strong>
			<span className="sx-host-meta">
				{host?.memberAddress ? (
					<>
						<PlaceOutlinedIcon aria-hidden="true" />
						{host.memberAddress}
					</>
				) : (
					'Kostay Host'
				)}
			</span>
			<dl className="sx-host-stats">
				<div>
					<dt>{host?.memberProperties === 1 ? 'Stay' : 'Stays'}</dt>
					<dd>{host?.memberProperties ?? 0}</dd>
				</div>
				<div>
					<dt>Likes</dt>
					<dd>{host?.memberLikes ?? 0}</dd>
				</div>
				<div>
					<dt>Views</dt>
					<dd>{host?.memberViews ?? 0}</dd>
				</div>
			</dl>
			<span className="sx-host-link">
				View profile
				<EastIcon aria-hidden="true" />
			</span>
		</Link>
	);
};

export default TopHostCard;
