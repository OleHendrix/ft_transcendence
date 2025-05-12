// /server/socket/SocketManager.ts
import WebSocket, { WebSocketServer } from 'ws';

type SocketEventHandler = (data: any, socket: WebSocket) => void;

interface ClientInfo {
	id: number; // Your custom way of identifying clients
	socket: WebSocket;
}

export class SocketManager {
	private wss: WebSocketServer;
	private clients: Map<WebSocket, ClientInfo>;
	private eventHandlers: Map<string, SocketEventHandler>;

	constructor(server: any) {
		this.wss = new WebSocketServer({ server });
		this.clients = new Map();
		this.eventHandlers = new Map();

		this.wss.on('connection', (socket: WebSocket) => {
			console.log('New WebSocket connection established');

			// Optional: handle handshake with client ID, auth, etc.
			socket.on('message', (message: string) => this.handleMessage(socket, message));

			socket.on('close', () => {
				console.log('WebSocket connection closed');
				this.clients.delete(socket);
			});
		});
	}

	private handleMessage(socket: WebSocket, rawMessage: string) {
		try {
			const { event, data } = JSON.parse(rawMessage);
			const handler = this.eventHandlers.get(event);
			if (handler) handler(data, socket);
		} catch (err) {
			console.error('Error parsing WebSocket message:', err);
		}
	}

	public on(event: string, handler: SocketEventHandler) {
		this.eventHandlers.set(event, handler);
	}

	public send(socket: WebSocket, event: string, data: any) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ event, data }));
		}
	}

	public broadcast(event: string, data: any) {
		for (const client of this.clients.values()) {
			this.send(client.socket, event, data);
		}
	}

	public registerClient(socket: WebSocket, id: number) {
		this.clients.set(socket, { id, socket });
	}

	public getClientById(id: number): WebSocket | null {
		for (const client of this.clients.values()) {
			if (client.id === id) return client.socket;
		}
		return null;
	}
}
