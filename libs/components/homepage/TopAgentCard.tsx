import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EastIcon from '@mui/icons-material/East';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const router = useRouter();
	const [imageFailed, setImageFailed] = useState(false);
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	return (
		<Link href={{ pathname: '/agent/detail', query: { agentId: agent?._id } }} className="sx-host-card">
			<span className="sx-host-cover" aria-hidden="true" />
			<span className="sx-host-avatar">
				<span className="sx-host-photo">
					{agent?.memberImage && !imageFailed ? (
						<img src={agentImage} alt="" loading="lazy" onError={() => setImageFailed(true)} />
					) : (
						<PersonIcon aria-hidden="true" />
					)}
				</span>
				<span className="sx-host-check" aria-label="Verified Host">
					<CheckIcon aria-hidden="true" />
				</span>
			</span>
			<strong>{agent?.memberNick}</strong>
			<span className="sx-host-meta">
				{agent?.memberAddress ? (
					<>
						<PlaceOutlinedIcon aria-hidden="true" />
						{agent.memberAddress}
					</>
				) : (
					'Kostay Host'
				)}
			</span>
			<dl className="sx-host-stats">
				<div>
					<dt>{agent?.memberProperties === 1 ? 'Stay' : 'Stays'}</dt>
					<dd>{agent?.memberProperties ?? 0}</dd>
				</div>
				<div>
					<dt>Likes</dt>
					<dd>{agent?.memberLikes ?? 0}</dd>
				</div>
				<div>
					<dt>Views</dt>
					<dd>{agent?.memberViews ?? 0}</dd>
				</div>
			</dl>
			<span className="sx-host-link">
				View profile
				<EastIcon aria-hidden="true" />
			</span>
		</Link>
	);
};

export default TopAgentCard;
