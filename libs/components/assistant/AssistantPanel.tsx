import React, { ReactNode, useEffect } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { AssistantIcon } from './assistantIcons';
import type { AskTab } from '../../hooks/AssistantContext';

export type { AskTab };

interface AssistantPanelProps {
	open: boolean;
	onClose: () => void;
	tab: AskTab;
	onTab: (tab: AskTab) => void;
	assistant: ReactNode;
	chat: ReactNode;
}

const TABS: { key: AskTab; label: string; hint: string }[] = [
	{ key: 'assistant', label: 'Kostay Assistant', hint: 'Kostay and Korea Tourism Organization travel data' },
	{ key: 'chat', label: 'Live chat', hint: 'Talk with other travelers and hosts' },
];

/**
 * The "Ask Kostay" window: answers from Kostay (assistant) or from other people (live chat).
 * A small window at the bottom right on desktop (the page stays usable), full screen on phones.
 */
const AssistantPanel = ({ open, onClose, tab, onTab, assistant, chat }: AssistantPanelProps) => {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open) return null;
	const active = TABS.find((t) => t.key === tab) ?? TABS[0];
	return (
		<aside className="sx-ask-panel" role="dialog" aria-label="Ask Kostay">
			<header>
				<div className="sx-ask-tabs" role="tablist">
					{TABS.map((t) => (
						<button
							type="button"
							role="tab"
							key={t.key}
							aria-selected={tab === t.key}
							className={tab === t.key ? 'active' : ''}
							onClick={() => onTab(t.key)}
						>
							{t.key === 'assistant' ? <AssistantIcon /> : <GroupsOutlinedIcon aria-hidden="true" />}
							{t.label}
						</button>
					))}
				</div>
				<button type="button" className="sx-ask-close" aria-label="Close" onClick={onClose}>
					<CloseRoundedIcon />
				</button>
				<p className="sx-ask-hint">{active.hint}</p>
			</header>
			{tab === 'assistant' ? (
				<div className="sx-ask-panel-body">{assistant}</div>
			) : (
				<div className="sx-ask-panel-chat">{chat}</div>
			)}
		</aside>
	);
};

export default AssistantPanel;
