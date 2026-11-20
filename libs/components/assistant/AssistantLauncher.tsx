import React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AssistantIcon } from './assistantIcons';

interface AssistantLauncherProps {
	onOpen: () => void;
	/** First visit: a small note next to the button, shown once. */
	showIntro?: boolean;
	onDismissIntro?: () => void;
	onAskExample?: (question: string) => void;
}

const INTRO_EXAMPLES = ['Hanok in Jeonju for 4 people', 'Festivals in Busan this winter'];

/** "Ask Kostay" button on every page: the assistant and the live chat behind one button. */
const AssistantLauncher = ({ onOpen, showIntro, onDismissIntro, onAskExample }: AssistantLauncherProps) => (
	<div className="sx-ask">
		{showIntro && (
			<div className="sx-ask-intro" role="dialog" aria-label="Ask Kostay">
				<button type="button" className="sx-ask-intro-close" aria-label="Close" onClick={onDismissIntro}>
					<CloseRoundedIcon />
				</button>
				<strong>Ask Kostay</strong>
				<p>Find a place to stay, ask how booking works or what&apos;s on in Korea, or chat with other travelers.</p>
				<div className="sx-ask-intro-examples">
					{INTRO_EXAMPLES.map((example) => (
						<button type="button" key={example} onClick={() => onAskExample?.(example)}>
							{example}
						</button>
					))}
				</div>
			</div>
		)}
		<button type="button" className="sx-ask-button" onClick={onOpen} aria-label="Ask Kostay">
			<AssistantIcon />
			<span>Ask Kostay</span>
		</button>
	</div>
);

export default AssistantLauncher;
