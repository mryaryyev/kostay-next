import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import Chat from '../Chat';
import AssistantBox from '../cs/AssistantBox';
import AssistantLauncher from './AssistantLauncher';
import AssistantPanel from './AssistantPanel';
import { useAssistantContext } from '../../hooks/AssistantContext';
import { connectChat } from '../../../apollo/chatSocket';
import { userVar } from '../../../apollo/store';

/** "Ask Kostay" on every page: one button for the assistant and the live chat. */
const AssistantDock = () => {
	const router = useRouter();
	const { state, ask, open, setOpen, tab, setTab, introVisible, dismissIntro } = useAssistantContext();
	const user = useReactiveVar(userVar);

	// The live chat used to sit on every page and open its socket on load. It now mounts only when its tab is
	// open, so connect here: the online count and new messages are ready before the tab is opened, and the
	// server knows who is writing after a login. connectChat skips the reconnect when the member is unchanged.
	useEffect(() => {
		connectChat();
	}, [user?._id]);

	if (router.pathname.startsWith('/_admin')) return null;

	const openPanel = () => {
		dismissIntro();
		setOpen(true);
	};
	const askExample = (question: string) => {
		dismissIntro();
		setTab('assistant');
		setOpen(true);
		void ask(question);
	};

	return (
		<>
			{!open && (
				<AssistantLauncher
					onOpen={openPanel}
					showIntro={introVisible}
					onDismissIntro={dismissIntro}
					onAskExample={askExample}
				/>
			)}
			<AssistantPanel
				open={open}
				onClose={() => setOpen(false)}
				tab={tab}
				onTab={setTab}
				assistant={<AssistantBox state={state} onAsk={ask} variant="panel" />}
				chat={<Chat embedded />}
			/>
		</>
	);
};

export default AssistantDock;
