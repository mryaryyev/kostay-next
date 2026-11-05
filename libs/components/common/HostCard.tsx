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

interface HostCardProps {
	host: Member;
	likeMemberHandler: any;
}

/** Host directory card (Stitch: Kostay - Hosts Directory). */
const HostCard = (props: HostCardProps) => {
	const { host, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const [imageFailed, setImageFailed] = useState(false);
	const imagePath = host?.memberImage ? `${REACT_APP_API_URL}/${host.memberImage}` : '';
	const detailHref = { pathname: '/host/detail', query: { hostId: host?._id } };
	const isSuperhost = (host?.memberRank ?? 0) >= topPropertyRank;
	const isLiked = Boolean(host?.meLiked?.[0]?.myFavorite);
	const properties = host?.memberProperties ?? 0;
	const description = host?.memberDesc?.trim() || 'Kostay host welcoming guests across Korea.';
	const firstSentence = description.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] ?? description;

	return (
		<article className="sx-host">
			<div>
				{isSuperhost && (
					<div className="sx-host-top">
						<span className="sx-host-tag is-super">
							<WorkspacePremiumOutlinedIcon aria-hidden="true" />
							Superhost
						</span>
					</div>
				)}

				<div className="sx-host-who">
					<Link href={detailHref} className="sx-host-avatar" aria-label={`View ${host?.memberNick}`}>
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
						<div className="sx-host-name-row">
							<h3>
								<Link href={detailHref}>{host?.memberFullName || host?.memberNick}</Link>
							</h3>
							<span className="sx-host-count">
								{properties} {properties === 1 ? 'Stay' : 'Stays'}
							</span>
						</div>
						{host?.memberAddress && (
							<span className="sx-host-place">
								<PlaceOutlinedIcon aria-hidden="true" />
								{host.memberAddress}
							</span>
						)}
					</div>
				</div>

				<p className="sx-host-desc">{firstSentence}</p>
			</div>

			<div>
				<div className="sx-host-stats">
					<span aria-label={`${host?.memberViews ?? 0} views`}>
						<VisibilityOutlinedIcon aria-hidden="true" />
						{host?.memberViews ?? 0}
					</span>
					<button
						type="button"
						className={isLiked ? 'is-on' : ''}
						aria-pressed={isLiked}
						aria-label={`${isLiked ? 'Unlike' : 'Like'} ${host?.memberNick}`}
						onClick={() => likeMemberHandler(user, host?._id)}
					>
						{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						{host?.memberLikes ?? 0}
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

export default HostCard;
