import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import Link from 'next/link';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Property } from '../../types/property/property';
import { formatKRW } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { PropertyStatus } from '../../enums/property.enum';

interface PropertyCardProps {
	property: Property;
	deletePropertyHandler?: any;
	updatePropertyHandler?: any;
}

const statusLabels: Record<string, string> = {
	[PropertyStatus.ACTIVE]: 'Active',
	[PropertyStatus.INACTIVE]: 'Paused',
	[PropertyStatus.PENDING]: 'In review',
};

/** One row in My Page → My Stays. */
export const PropertyCard = (props: PropertyCardProps) => {
	const { property, deletePropertyHandler, updatePropertyHandler } = props;
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const isPending = property.propertyStatus === PropertyStatus.PENDING;
	const isActive = property.propertyStatus === PropertyStatus.ACTIVE;
	// The owner can open every own stay; pending / paused ones show their status card instead of booking.
	const detailHref = { pathname: '/stay/detail', query: { id: property._id } };

	/** HANDLERS **/
	const pushEditProperty = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProperty', propertyId: id },
		});
	};

	const changeStatus = (status: PropertyStatus) => {
		setAnchorEl(null);
		updatePropertyHandler(status, property._id);
	};

	return (
		<li className="sx-stay-row">
			<Link href={detailHref} className="sx-stay-row-photo" aria-label={`Open ${property.propertyTitle}`}>
				<img src={`${process.env.REACT_APP_API_URL}/${property.propertyImages[0]}`} alt="" />
			</Link>

			<div className="sx-stay-row-info">
				<Link href={detailHref} className="sx-stay-row-title">
					{property.propertyTitle}
				</Link>
				<span className="sx-stay-row-address">{property.propertyAddress}</span>
				<span className="sx-stay-row-price">
					<strong>{formatKRW(property.pricePerNight)}</strong> / night · Up to {property.maxGuests}{' '}
					{property.maxGuests === 1 ? 'guest' : 'guests'}
				</span>
			</div>

			<div className="sx-stay-row-meta">
				<span className="sx-stay-row-date">
					<Moment format="DD MMM YYYY">{property.createdAt}</Moment>
				</span>
				<span className="sx-stay-row-views" aria-label={`${property.propertyViews} views`}>
					<VisibilityOutlinedIcon aria-hidden="true" />
					{property.propertyViews.toLocaleString()}
				</span>
			</div>

			<div className="sx-stay-row-actions">
				{isPending ? (
					<span className="sx-stay-status is-pending" title="Waiting for Kostay team approval">
						{statusLabels[PropertyStatus.PENDING]}
					</span>
				) : (
					<>
						<button
							type="button"
							className={`sx-stay-status ${isActive ? 'is-active' : 'is-paused'}`}
							aria-haspopup="menu"
							aria-expanded={Boolean(anchorEl)}
							onClick={(e) => setAnchorEl(e.currentTarget)}
						>
							{statusLabels[property.propertyStatus] ?? property.propertyStatus}
							<ExpandMoreIcon aria-hidden="true" />
						</button>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={() => setAnchorEl(null)}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							PaperProps={{ className: 'sx-sort-menu' }}
							disableScrollLock
						>
							{isActive ? (
								<MenuItem onClick={() => changeStatus(PropertyStatus.INACTIVE)}>Pause (hide from guests)</MenuItem>
							) : (
								<MenuItem onClick={() => changeStatus(PropertyStatus.ACTIVE)}>Reactivate</MenuItem>
							)}
						</Menu>
					</>
				)}

				{isActive && (
					<>
						<button
							type="button"
							className="sx-stay-icon"
							aria-label={`Edit ${property.propertyTitle}`}
							onClick={() => pushEditProperty(property._id)}
						>
							<EditOutlinedIcon aria-hidden="true" />
						</button>
						<button
							type="button"
							className="sx-stay-icon is-danger"
							aria-label={`Delete ${property.propertyTitle}`}
							onClick={() => deletePropertyHandler(property._id)}
						>
							<DeleteOutlineIcon aria-hidden="true" />
						</button>
					</>
				)}
			</div>
		</li>
	);
};
