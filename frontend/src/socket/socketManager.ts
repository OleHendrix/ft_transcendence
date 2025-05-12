// const WS_URL = import.meta.env.VITE_WS_URL;

// class SocketManager {
// 	private static instance: SocketManager;
// 	public socket: WebSocket | null = null;

// 	private constructor() {}

// 	public static getInstance(): SocketManager {
// 		if (!SocketManager.instance) {
// 			SocketManager.instance = new SocketManager();
// 		}
// 		return SocketManager.instance;
// 	}

// 	public connect(userId: number) {
// 		if (this.socket) return;

// 		this.socket = new WebSocket(`${WS_URL}/ws?userId=${userId}`);
// 		this.socket.onopen = () => console.log('WebSocket connected');
// 		this.socket.onclose = () => console.log('WebSocket closed');
// 		this.socket.onerror = (err) => console.error('WebSocket error:', err);
// 	}

// 	public send(event: string, data: any) {
// 		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
// 		this.socket.send(JSON.stringify({ event, data }));
// 	}

// 	public on(event: string, callback: (data: any) => void) {
// 		if (!this.socket) return;

// 		this.socket.addEventListener('message', (msg) => {
// 			const parsed = JSON.parse(msg.data);
// 			if (parsed.event === event) {
// 				callback(parsed.data);
// 			}
// 		});
// 	}

// 	public close() {
// 		if (this.socket) {
// 			this.socket.close();
// 			this.socket = null;
// 		}
// 	}
// }

// export default SocketManager.getInstance();
