import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
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
			<span>Host</span>
			<em>
				{agent?.memberProperties ?? 0} {agent?.memberProperties === 1 ? 'stay' : 'stays'}
			</em>
		</Link>
	);
};

export default TopAgentCard;
