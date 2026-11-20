import React from 'react';
import { AssistantIcon } from '../assistant/assistantIcons';
import { useAssistantContext } from '../../hooks/AssistantContext';

/** Help Center: the assistant lives in the "Ask Kostay" window on every page; this line opens it. */
const AskKostayStrip = () => {
	const { setOpen, setTab, dismissIntro } = useAssistantContext();

	const open = () => {
		dismissIntro();
		setTab('assistant');
		setOpen(true);
	};

	return (
		<div className="sx-cs-ask">
			<span className="sx-cs-ask-icon" aria-hidden="true">
				<AssistantIcon />
			</span>
			<p>
				<strong>Can&apos;t find your answer?</strong> <span>Ask about stays, booking or festivals.</span>
			</p>
			<button type="button" onClick={open}>
				Ask Kostay
			</button>
		</div>
	);
};

export default AskKostayStrip;
