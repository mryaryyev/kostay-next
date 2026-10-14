import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import Badge from '@mui/material/Badge';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { chatMessagesVar, chatOnlineVar, chatStatusVar, socketVar, userVar } from '../../apollo/store';
import { connectChat } from '../../apollo/chatSocket';
import { Member } from '../types/member/member';
import { REACT_APP_API_URL } from '../config';
import moment from 'moment';

const NewMessage = (type: any) => {
	if (type === 'right') {
		return (
			<Box
				component={'div'}
				flexDirection={'row'}
				style={{ display: 'flex' }}
				alignItems={'flex-end'}
				justifyContent={'flex-end'}
				sx={{ m: '10px 0px' }}
			>
				<div className={'msg_right'}></div>
			</Box>
		);
	} else {
		return (
			<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
				<Avatar alt={'jonik'} src={'/img/profile/defaultUser.svg'} />
				<div className={'msg_left'}></div>
			</Box>
		);
	}
};

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
	/** Set when the message reaches this browser; the server sends no time, so older messages have none. */
	receivedAt?: number;
	/** ISO time from the server. */
	createdAt?: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	// Filled by the socket in apollo/client.ts, so the first online count / messages are never missed.
	const messagesList = useReactiveVar(chatMessagesVar) as MessagePayload[];
	const onlineUsers = useReactiveVar(chatOnlineVar);
	const status = useReactiveVar(chatStatusVar);
	const isOnline = status === 'online';
	const isGuest = !user?._id;
	const feedRef = useRef<ScrollableFeed>(null);
	// The feed only follows new messages while the reader is at the bottom; these track that state.
	const [atBottom, setAtBottom] = useState(true);
	const [hasNewMessages, setHasNewMessages] = useState(false);
	const awaitingOwnMessage = useRef(false);
	const lastCount = useRef(messagesList.length);

	/** LIFECYCLES **/

	// (Re)connect the chat socket on first load and whenever the member changes (login / signup), so the server
	// knows who is writing. connectChat skips the reconnect when the member is unchanged.
	useEffect(() => {
		connectChat();
	}, [user?._id]);

	// A new message while the reader is scrolled up: follow it if it is their own, otherwise show "New messages".
	useEffect(() => {
		const added = messagesList.length > lastCount.current;
		lastCount.current = messagesList.length;
		if (!added) return;
		const last = messagesList[messagesList.length - 1];
		const isMine = Boolean(user?._id) && last?.memberData?._id === user._id;
		if (isMine && awaitingOwnMessage.current) {
			awaitingOwnMessage.current = false;
			feedRef.current?.scrollToBottom();
			setHasNewMessages(false);
		} else if (!atBottom) {
			setHasNewMessages(true);
		}
	}, [messagesList]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessageInput(text);
		},
		[messageInput],
	);

	const getKeyHandler = (e: any) => {
		try {
			if (e.key == 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const canSend = messageInput.trim() !== '';

	const onClickHandler = () => {
		if (canSend && isOnline) {
			awaitingOwnMessage.current = true; // scroll down when the server echoes it back
			socket.send(JSON.stringify({ event: 'message', data: messageInput }));
			setMessageInput('');
		}
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat} aria-label={open ? 'Close chat' : 'Open chat'}>
					{open ? <CloseFullscreenIcon /> : <ChatBubbleOutlineRoundedIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div>Online Chat</div>
					{isOnline ? (
						<RippleBadge badgeContent={onlineUsers} />
					) : (
						<span className={'chat-status'} role="status">
							{status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
						</span>
					)}
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					{/* @ts-ignore react-scrollable-feed's types predate React 18 and omit `children` */}
					<ScrollableFeed
						ref={feedRef}
						onScroll={(isAtBottom: boolean) => {
							setAtBottom(isAtBottom);
							if (isAtBottom) setHasNewMessages(false);
						}}
					>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((ele: MessagePayload) => {
								const { text, memberData } = ele;
								const memberImage = memberData?.memberImage
									? `${REACT_APP_API_URL}/${memberData.memberImage}`
									: '/img/profile/defaultUser.svg';

								const sentAt = ele.createdAt ?? ele.receivedAt;
								const time = sentAt ? moment(sentAt).format('HH:mm') : '';

								return memberData?._id === user?._id ? (
									<Box
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-group is-mine'}>
											<div className={'msg-right'}>{text}</div>
											{time && <span className={'msg-time'}>{time}</span>}
										</div>
									</Box>
								) : (
									<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={memberData?.memberNick ?? 'Guest'} src={memberImage} />
										<div className={'msg-group'}>
											<span className={'msg-name'}>{memberData?.memberNick ?? 'Guest'}</span>
											<div className={'msg-left'}>{text}</div>
											{time && <span className={'msg-time'}>{time}</span>}
										</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
					{hasNewMessages && (
						<button
							type="button"
							className={'chat-new-messages'}
							onClick={() => {
								feedRef.current?.scrollToBottom();
								setHasNewMessages(false);
							}}
						>
							New messages
							<ArrowDownwardRoundedIcon aria-hidden="true" />
						</button>
					)}
				</Box>
				{isGuest ? (
					// Visitors can read the chat; writing needs an account so every message has a member behind it.
					<Box className={'chat-bott is-guest'} component={'div'}>
						<span>Log in to join the chat</span>
						<Link href={'/account/join'} className={'chat-login'}>
							Log in
						</Link>
					</Box>
				) : (
					<Box className={'chat-bott'} component={'div'}>
						<input
							type={'text'}
							name={'message'}
							className={'msg-input'}
							placeholder={isOnline ? 'Type message' : 'Chat is reconnecting…'}
							disabled={!isOnline}
							value={messageInput}
							onChange={getInputMessageHandler}
							onKeyDown={getKeyHandler}
						/>
						<button
							className={'send-msg-btn'}
							onClick={onClickHandler}
							disabled={!canSend || !isOnline}
							aria-label="Send message"
						>
							<SendIcon />
						</button>
					</Box>
				)}
			</Stack>
		</Stack>
	);
};

export default Chat;
