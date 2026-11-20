import { useEffect, useRef, useState } from 'react';

/** DOM id of a Help Center question or notice, so a link can scroll to it. */
export const csItemId = (id: string): string => `cs-item-${id}`;

/**
 * A link can point at one Help Center item ("/help?tab=faq&faq=<id>", used by the assistant's sources).
 * Once that item is in the list on screen, open it, scroll to it and highlight it for a moment.
 * Each link is handled once, so the reader can close the item or move on afterwards.
 */
export const useLinkedItem = (
	linkedId: string | undefined,
	ids: string[],
	open: (id: string) => void,
): string | null => {
	const handled = useRef<string | null>(null);
	const [highlighted, setHighlighted] = useState<string | null>(null);
	const inList = Boolean(linkedId && ids.includes(linkedId));

	useEffect(() => {
		if (!linkedId || !inList || handled.current === linkedId) return;
		handled.current = linkedId;
		open(linkedId);
		setHighlighted(linkedId);
		// after the item has opened, so the scroll lands on its full height
		const frame = requestAnimationFrame(() =>
			document.getElementById(csItemId(linkedId))?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
		);
		const timer = window.setTimeout(() => setHighlighted(null), 2000);
		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(timer);
		};
	}, [linkedId, inList, open]);

	return highlighted;
};
