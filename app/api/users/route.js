import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import { RateLimiter } from "../RateLimiter"
import {requireAuth} from "../../../lib/auth"

export async function GET(request){
    try {

        const {user} = await requireAuth(request);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "user memiliki token tidak invalid" },
            { status: 500 }
          );
        }

        RateLimiter(request)

        const users = await prisma.user.findMany()
        return NextResponse.json({success:true, message:"users retrieved successfully", data:users}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }
}

