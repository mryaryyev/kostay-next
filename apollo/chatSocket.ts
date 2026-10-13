import { getJwtToken } from '../libs/auth';
import { chatMessagesVar, chatOnlineVar, socketVar } from './store';

/**
 * Live chat socket (plain WebSocket, NestJS WsAdapter on the server). Kept apart from Apollo: the project has no
 * GraphQL subscriptions, and the server only learns who we are from the token in the connect URL, so the socket
 * must reconnect whenever the logged-in member changes.
 */
let socket: WebSocket | null = null;
let socketToken = '';

export const connectChat = () => {
	if (typeof window === 'undefined') return;
	const token = getJwtToken() ?? '';
	const alive = socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING);
	// Same member and a live connection: nothing to do (Chat remounts on every page change).
	if (alive && token === socketToken) return;

	if (socket) {
		socket.onmessage = null;
		socket.onerror = null;
		socket.close();
	}

	const url = process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007';
	socketToken = token;
	socket = new WebSocket(`${url}?token=${token}`);
	socketVar(socket);

	socket.onopen = () => {
		console.log('WebSocket connection!');
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
