import { getJwtToken } from '../libs/auth';
import { chatMessagesVar, chatOnlineVar, chatStatusVar, socketVar } from './store';

/**
 * Live chat socket (plain WebSocket, NestJS WsAdapter on the server). Kept apart from Apollo: the project has no
 * GraphQL subscriptions, and the server only learns who we are from the token in the connect URL, so the socket
 * must reconnect whenever the logged-in member changes.
 */
let socket: WebSocket | null = null;
let socketToken = '';
// Reconnect with exponential backoff (1s, 2s, 4s … max 30s) when the server goes away.
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
const MAX_RETRY_DELAY = 30000;

const scheduleReconnect = () => {
	if (retryTimer) return;
	const delay = Math.min(1000 * 2 ** retryCount, MAX_RETRY_DELAY);
	retryCount++;
	retryTimer = setTimeout(() => {
		retryTimer = null;
		connectChat();
	}, delay);
};

export const connectChat = () => {
	if (typeof window === 'undefined') return;
	const token = getJwtToken() ?? '';
	const alive = socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING);
	// Same member and a live connection: nothing to do (Chat remounts on every page change).
	if (alive && token === socketToken) return;

	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
	if (socket) {
		// Closing on purpose (member changed): detach handlers so it does not count as a drop.
		socket.onmessage = null;
		socket.onerror = null;
		socket.onclose = null;
		socket.close();
	}

	const url = process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007';
	socketToken = token;
	socket = new WebSocket(`${url}?token=${token}`);
	socketVar(socket);
	chatStatusVar(retryCount > 0 ? 'offline' : 'connecting');

	socket.onopen = () => {
		console.log('WebSocket connection!');
		retryCount = 0;
		chatStatusVar('online');
	};

	// Server stopped or network dropped: keep the messages on screen and try again.
	socket.onclose = () => {
		chatStatusVar('offline');
		scheduleReconnect();
	};

	// The server sends the online count and the last messages right on connect, so they are stored here.
	socket.onmessage = (msg) => {
		try {
			const data = JSON.parse(msg.data);
			if (data.event === 'info') chatOnlineVar(data.totalClients);
			if (data.event === 'getMessages') chatMessagesVar(data.list ?? []);
			if (data.event === 'message')
				chatMessagesVar([...chatMessagesVar(), { ...data, receivedAt: Date.now() }].slice(-50));
		} catch (err) {
			console.log('WebSocket message:', msg.data);
		}
	};

	socket.onerror = (error) => {
		console.log('WebSocket, error:', error);
	};
};
