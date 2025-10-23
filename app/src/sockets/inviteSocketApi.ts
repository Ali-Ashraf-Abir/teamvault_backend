import { Server, Socket } from "socket.io";
import { userSocketMap } from ".";

export function inviteSent(socket: Socket, io: Server) {
    socket.on("invite_sent", ({ sentId }) => {
        console.log(sentId)
        const targetSocketId = userSocketMap.get(sentId);
        console.log(targetSocketId + " this is the target of our socket")
        if (targetSocketId) {
            io.to(targetSocketId).emit("invites","reload")
        }
       

    })
}