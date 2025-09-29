
import { prisma } from "../../db/prisma";

export async function getUserByIdService(id:string){
    const user = await prisma.user.findUnique({where:{userId:id} ,
        select:{userId:true, email:true, firstName:true, lastName:true}}
        
    )
    if(!user) return {ok:false as const, message:"User not found"}
    return {ok:true as const, user}
}