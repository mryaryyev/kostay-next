import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAssistant } from './useAssistant';
import { AssistantTurn } from '../types/assistant/assistant';

export type AskTab = 'assistant' | 'chat';

interface AssistantContextValue {
	/** The conversation with the assistant, oldest question first. */
	turns: AssistantTurn[];
	ask: (question: string) => Promise<void>;
	newChat: () => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	tab: AskTab;
	setTab: (tab: AskTab) => void;
	/** The first-visit note next to the "Ask Kostay" button. */
	introVisible: boolean;
	dismissIntro: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

// only "seen" is stored; the questions and answers stay in memory
const INTRO_SEEN_KEY = 'askKostayIntroSeen';

const introSeen = (): boolean => {
	try {
		return window.localStorage.getItem(INTRO_SEEN_KEY) === '1';
	} catch {
		return false; // storage blocked (private mode): show it, and hide it for this visit once dismissed
	}
};

/**
 * One assistant for the whole site. It sits in _app, above the page layouts, so the conversation and the
 * open window survive a page change.
 */
export const AssistantProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const { turns, ask, newChat } = useAssistant();
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<AskTab>('assistant');
	const [introVisible, setIntroVisible] = useState(false);

	// read storage after mount: the server render has no window, and both renders must match
	useEffect(() => {
		setIntroVisible(!introSeen());
	}, []);

	// phone: the window covers the whole screen, so close it when a link (a stay card, a source) opens a page
	useEffect(() => {
		const closeOnPhone = () => {
			if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
		};
		router.events.on('routeChangeStart', closeOnPhone);
		return () => router.events.off('routeChangeStart', closeOnPhone);
	}, [router.events]);

	const dismissIntro = useCallback(() => {
		setIntroVisible(false);
		try {
			window.localStorage.setItem(INTRO_SEEN_KEY, '1');
		} catch {
			// storage blocked: hidden for this visit only
		}
	}, []);

	const value = useMemo(
		() => ({ turns, ask, newChat, open, setOpen, tab, setTab, introVisible, dismissIntro }),
		[turns, ask, newChat, open, tab, introVisible, dismissIntro],
	);
	return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistantContext = (): AssistantContextValue => {
	const value = useContext(AssistantContext);
	if (!value) throw new Error('useAssistantContext must be used inside AssistantProvider');
	return value;
};
