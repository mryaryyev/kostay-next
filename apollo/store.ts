import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProperties: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

// @ts-ignore
export const socketVar = makeVar<WebSocket>();

/** Live chat state, filled by the socket in apollo/client.ts so nothing is missed before <Chat /> mounts. */
export interface ChatMessage {
	event: string;
	text: string;
	memberData: { _id: string; memberNick: string; memberImage?: string } | null;
	/** Set when the message reaches this browser; the server sends no time, so the first history has none. */
	receivedAt?: number;
	/** ISO time set by the server (kept in the Redis history), so older messages show their time too. */
	createdAt?: string;
}
export const chatOnlineVar = makeVar<number>(0);
export const chatMessagesVar = makeVar<ChatMessage[]>([]);
/** Socket state for the chat header / composer: 'offline' while waiting to reconnect. */
export const chatStatusVar = makeVar<'connecting' | 'online' | 'offline'>('connecting');
