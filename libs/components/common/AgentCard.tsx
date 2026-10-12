import React, { useState } from 'react';
import Link from 'next/link';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import EastIcon from '@mui/icons-material/East';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';

interface AgentCardProps {
	agent: Member;
	likeMemberHandler: any;
}

/** Host directory card (Stitch: Kostay - Hosts Directory). */
const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const [imageFailed, setImageFailed] = useState(false);
	const imagePath = agent?.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '';
	const detailHref = { pathname: '/agent/detail', query: { agentId: agent?._id } };
	const isSuperhost = (agent?.memberRank ?? 0) >= topPropertyRank;
	const isLiked = Boolean(agent?.meLiked?.[0]?.myFavorite);
	const properties = agent?.memberProperties ?? 0;

	return (
		<article className="sx-host">
			<div>
				<div className="sx-host-top">
					{isSuperhost ? (
						<span className="sx-host-tag is-super">
							<WorkspacePremiumOutlinedIcon aria-hidden="true" />
							Superhost
						</span>
					) : (
						<span className="sx-host-tag">Verified Host</span>
					)}
					<span className="sx-host-count">
						{properties} {properties === 1 ? 'Property' : 'Properties'}
					</span>
				</div>

				<div className="sx-host-who">
					<Link href={detailHref} className="sx-host-avatar" aria-label={`View ${agent?.memberNick}`}>
						{imagePath && !imageFailed ? (
							<img src={imagePath} alt="" loading="lazy" onError={() => setImageFailed(true)} />
						) : (
							<PersonIcon aria-hidden="true" />
						)}
						<span className="sx-host-verified" aria-hidden="true">
							<CheckIcon />
						</span>
					</Link>
					<div>
						<h3>
							<Link href={detailHref}>{agent?.memberFullName || agent?.memberNick}</Link>
						</h3>
						{agent?.memberAddress && (
							<span className="sx-host-place">
								<PlaceOutlinedIcon aria-hidden="true" />
								{agent.memberAddress}
							</span>
						)}
					</div>
				</div>

				<p className="sx-host-desc">{agent?.memberDesc || 'Kostay host welcoming guests across Korea.'}</p>
			</div>

			<div>
				<div className="sx-host-stats">
					<span aria-label={`${agent?.memberViews ?? 0} views`}>
						<VisibilityOutlinedIcon aria-hidden="true" />
						{agent?.memberViews ?? 0}
					</span>
					<button
						type="button"
						className={isLiked ? 'is-on' : ''}
						aria-pressed={isLiked}
						aria-label={`${isLiked ? 'Unlike' : 'Like'} ${agent?.memberNick}`}
						onClick={() => likeMemberHandler(user, agent?._id)}
					>
						{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						{agent?.memberLikes ?? 0}
					</button>
				</div>
				<Link href={detailHref} className="sx-host-cta">
					View Stays
					<EastIcon aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
};

export default AgentCard;
