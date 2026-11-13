import React, { ReactNode } from 'react';

interface AdminPageHeaderProps {
	title: string;
	subtitle?: string;
	/** Optional buttons on the right (e.g. "New notice"). */
	actions?: ReactNode;
}

/** Title row shared by every admin page. */
const AdminPageHeader = ({ title, subtitle, actions }: AdminPageHeaderProps) => (
	<div className={'adm-page-head'}>
		<div>
			<h1>{title}</h1>
			{subtitle && <p>{subtitle}</p>}
		</div>
		{actions && <div className={'adm-page-actions'}>{actions}</div>}
	</div>
);

export default AdminPageHeader;
