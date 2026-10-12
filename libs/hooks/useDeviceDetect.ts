import { useEffect, useState } from 'react';

/** Phones are anything up to 767px wide; matches the `mobile` SCSS mixin in scss/variables.scss. */
export const MOBILE_QUERY = '(max-width: 767px)';

/**
 * 'mobile' | 'desktop' by screen width (not the user agent), so a narrow desktop window or a tablet
 * behaves like the CSS does. Layout is responsive SCSS; use this hook only where the markup itself differs
 * (e.g. the filter drawer or the sticky booking bar).
 */
const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	useEffect(() => {
		const media = window.matchMedia(MOBILE_QUERY);
		const update = () => setDevice(media.matches ? 'mobile' : 'desktop');
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	}, []);

	return device;
};

export default useDeviceDetect;
