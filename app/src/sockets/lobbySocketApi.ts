import { Server, Socket } from "socket.io";
import { userSocketMap } from ".";

export function lobbyLoad(socket: Socket, io: Server) {
    socket.on("member_added_to_lobby", ({ userId }) => {
        console.log(userId)
        userId.forEach((id:string) => {
            const targetSocketId = userSocketMap.get(id);
            console.log(targetSocketId +" this is the target of our socket")
            if (targetSocketId) {
            io.to(targetSocketId).emit("reload_user_lobby", "reload_lobby")
            }
        });

    })
}