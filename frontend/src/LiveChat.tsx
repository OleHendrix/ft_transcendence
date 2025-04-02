// // Assuming senderId is available as a variable in the frontend
// const senderId = 123; // Example sender ID
// const receiverId = 456; // Example receiver ID

// const socket = new WebSocket(`ws://${window.location.hostname}:5001/chat/private/${receiverId}?senderId=${senderId}`);

// // Handle connection events
// socket.onopen = () => {
//   console.log("Connected to private chat");
//   socket.send("Hello from sender " + senderId);
// };

// socket.onmessage = (event) => {
//   console.log("Received message:", event.data);
// };

// socket.onclose = () => {
//   console.log("Connection closed");
// };

// socket.onerror = (error) => {
//   console.error("WebSocket error:", error);
// };
