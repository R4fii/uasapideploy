import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function PUT(request) {
    try {
        
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            throw { status: 401, message: "Unauthorized" };
        }

        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) {
            throw { status: 401, message: "Invalid authorization format" };
        }

        const { payload } = await jwtVerify(token, secret);

        const user = await prisma.user.findUnique({
            where: {id:payload.id}
        })

        if (!user || !user.token) {
            return NextResponse.json({success:false, message: "User telah logout", code:401}, {status: 401})
        }

        await prisma.user.update({
            where: { id: payload.id },
            data: { 
                token: null
            },
        });

        return NextResponse.json({success:true, message: "logout successful"}, {status: 200})


    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}
