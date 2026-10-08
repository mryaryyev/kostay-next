import React, { ReactNode } from 'react';

interface SectionHeaderProps {
	eyebrow: string;
	title: string;
	subtitle?: string;
	action?: ReactNode;
}

const SectionHeader = (props: SectionHeaderProps) => {
	const { eyebrow, title, subtitle, action } = props;

	return (
		<div className="home-section-header">
			<div className="home-section-heading">
				<span className="home-eyebrow">{eyebrow}</span>
				<h2>{title}</h2>
				{subtitle && <p>{subtitle}</p>}
			</div>
			{action && <div className="home-section-action">{action}</div>}
		</div>
	);
};

export default SectionHeader;
