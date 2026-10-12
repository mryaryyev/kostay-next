import React from 'react';

interface KostayLogoProps {
	className?: string;
	width?: number;
	height?: number;
}

const LETTERS = ['K', 'O', 'S', 'T', 'A', 'Y'];

/** Inline Kostay logo so its parts can animate on hover (an <img> SVG cannot). */
const KostayLogo = ({ className = '', width = 129, height = 52 }: KostayLogoProps) => {
	return (
		<svg
			className={`kostay-logo ${className}`}
			width={width}
			height={height}
			viewBox="0 0 129 52"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Kostay"
		>
			<g className="kostay-logo__icon">
				<rect x="2" y="8" width="36" height="36" rx="10" fill="#C2471F" />
				<path
					className="kostay-logo__roof"
					d="M10 26.5L20 18L30 26.5"
					stroke="white"
					strokeWidth="2.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path d="M13 25V35H27V25" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
				<path
					className="kostay-logo__door"
					d="M17.5 35V30.5C17.5 29.4 18.4 28.5 19.5 28.5H20.5C21.6 28.5 22.5 29.4 22.5 30.5V35"
					stroke="white"
					strokeWidth="2.2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<text
				x="46"
				y="32.5"
				fill="white"
				fontFamily="Poppins, 'Segoe UI', Helvetica, Arial, sans-serif"
				fontSize="18"
				fontWeight="700"
				letterSpacing="0.4"
			>
				{LETTERS.map((letter, i) => (
					<tspan
						key={i}
						className={`kostay-logo__letter ${i < 2 ? 'kostay-logo__ko' : ''}`}
						// KO = Korea (brand terracotta), STAY = context colour. Inline so page rules can't override it.
						style={{ animationDelay: `${i * 0.05}s`, ...(i < 2 && { fill: '#C2471F' }) }}
					>
						{letter}
					</tspan>
				))}
			</text>
		</svg>
	);
};

export default KostayLogo;
