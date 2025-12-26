import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"

export async function GET(){
    try {
        const users = await prisma.user.findMany()
        return NextResponse.json({success:true, message:"users retrieved successfully", data:users}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}

