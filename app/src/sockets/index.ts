import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { chatSocketApi } from "./chatSocketApi";
import { lobbyLoad } from "./lobbySocketApi";



// import notificationSocketApi from "./notificationSocketApi";

export let io: Server;
export const userSocketMap = new Map();
export function initSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });
   
    io.on("connection", (socket) => {
        console.log("🟢 New connection:", socket.id);
        console.log("Total sockets:", io.sockets.sockets.size);
        console.log(socket.id, socket.handshake.address, socket.handshake.time);


        // register event modules
        socket.on("register_user", (userId) => {
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} is connected with socket ${socket.id}`);
        });

        chatSocketApi(io, socket);
        lobbyLoad(socket,io)
        // notificationSocketApi(io, socket);

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected:", socket.id);
            console.log("Total sockets:", io.sockets.sockets.size);
        });
    });

    return io;
}
