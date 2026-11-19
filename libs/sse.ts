/** One Server-Sent Event: its name and its `data:` text. */
export interface SseEvent {
	event: string;
	data: string;
}

/**
 * Splits a growing SSE text stream into complete events. An event ends with a blank line; the
 * unfinished rest waits for the next chunk (the network can cut an event anywhere).
 */
export class SseParser {
	private buffer = '';

	push(chunk: string): SseEvent[] {
		this.buffer += chunk.replace(/\r\n/g, '\n');
		const events: SseEvent[] = [];
		let end = this.buffer.indexOf('\n\n');
		while (end !== -1) {
			const block = this.buffer.slice(0, end);
			this.buffer = this.buffer.slice(end + 2);
			let event = 'message';
			const data: string[] = [];
			for (const line of block.split('\n')) {
				if (line.startsWith('event:')) event = line.slice(6).trim();
				else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
			}
			if (data.length) events.push({ event, data: data.join('\n') });
			end = this.buffer.indexOf('\n\n');
		}
		return events;
	}
}
