import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { chatSocketApi } from "./chatSocketApi";



// import notificationSocketApi from "./notificationSocketApi";

export let io: Server; // optional export for global use

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
        chatSocketApi(io, socket);
        // notificationSocketApi(io, socket);

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected:", socket.id);
            console.log("Total sockets:", io.sockets.sockets.size);
        });
    });

    return io;
}
