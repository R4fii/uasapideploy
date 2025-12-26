import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"
import bcrypt from "bcryptjs"

const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
    password: z.string().min(6)
})

export async function POST(request){

    try {
        
        RateLimiter(request);

        const body = await request.json()
        const validation = UserSchema.safeParse(body)

        if (!validation.success) {
            console.error(validation.error.errors)
            return NextResponse.json({success:false,error: "validasi salah", code:400}, {status: 400})
        }
        const {name, email, role, password} = validation.data

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data:{
                name,
                email,
                role,
                password: hashedPassword
            }
        })

        return NextResponse.json({success:true, message: "user created successfully", data:newUser}, {status: 201})

    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }

}