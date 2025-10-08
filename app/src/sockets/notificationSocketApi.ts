// import { Server, Socket } from "socket.io";


// export default function notificationSocketApi(io: Server, socket: Socket) {
//   // when user connects, they register their personal room
//   socket.on("register_user", ({ userId }) => {
//     socket.join(`user:${userId}`);
//     console.log(`User ${userId} registered for notifications`);
//   });

//   // Example: send a test notification
//   socket.on("notify_user", ({ userId, message }) => {
//     io.to(`user:${userId}`).emit("notification", { message });
//   });
// }
