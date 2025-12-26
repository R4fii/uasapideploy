import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request) {
    try {
        
        const {email, password} = await request.json();

        const user =  await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if(!user){
            return NextResponse.json({success:false, error: "Invalid email or password", code:401}, {status: 401})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return NextResponse.json({success:false, error: "Invalid email or password", code:401}, {status: 401})
        }  
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({id: user.id, email: user.email, role: user.role}).
        setProtectedHeader({alg: "HS256"}).
        setExpirationTime("30m").
        sign(secret);

        await prisma.user.update({
            where: { id: user.id },
            data: { token: token },
        });

        return NextResponse.json({success:true, message: "login successful", data:{ token }}, {status: 200})


    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}
