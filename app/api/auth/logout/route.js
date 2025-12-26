import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function PUT(request) {
    try {
        
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            // throw { status: 401, message: "Unauthorized" };
            return NextResponse.json({success:false, error: "unauthorized", code:401}, {status: 401})
        }

        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) {
            // throw { status: 401, message: "Invalid authorization format" };
            return NextResponse.json({success:false, error: "Invalid authorization format", code:401}, {status: 401})
        }

        const { payload } = await jwtVerify(token, secret);

        const user = await prisma.user.findUnique({
            where: {id:payload.id}
        })

        if (!user || !user.token) {
            return NextResponse.json({success:false, error: "User telah logout atau belum login", code:401}, {status: 401})
        }

        await prisma.user.update({
            where: { id: payload.id },
            data: { 
                token: null
            },
        });

        return NextResponse.json({success:true, message: "logout successful", data: user}, {status: 200})


    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false, error: "internal server erro", code:500}, {status: 500})
    }
}
