import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"
import {requireAuth} from "../../../lib/auth"
import {RateLimiter} from "../RateLimiter"

const AuthorSchema = z.object({
    name: z.string().min(1),
})

export async function GET(request){
    try {
        RateLimiter(request);

        const {user} = await requireAuth(request);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "user memiliki token tidak invalid" },
            { status: 500 }
          );
        }


        const authors = await prisma.author.findMany()
        return NextResponse.json({success:true, message:"authors retrieved successfully", data:authors}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }
}

export async function POST(request){

    try {

        const {user} = await requireAuth(request);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "user memiliki token tidak invalid" },
            { status: 500 }
          );
        }
        
        RateLimiter(request);

        const body = await request.json()
        const validation = AuthorSchema.safeParse(body)

        if (!validation.success) {
            console.error(validation.error.errors)
            return NextResponse.json({success:false,error: "validasi gagal", code:400}, {status: 400})
        }

        const newAuthor = await prisma.author.create({
            data:{
                name: body.name
            }
        })

        return NextResponse.json({success:true, message: "author created successfully", data:newAuthor}, {status: 201})

    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }

}
