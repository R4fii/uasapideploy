import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"

const AuthorSchema = z.object({
    name: z.string().min(1),
})

export async function GET(request, {params}){
    try {

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        const author = await prisma.author.findMany({
            where: { id: id }
        })
        return NextResponse.json({success:true, message:"author retrieved successfully", data:author}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}

export async function POST(request){

    try {
        
        const body = await request.json()
        const validation = AuthorSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({success:false,error: validation.error.errors, code:400}, {status: 400})
        }

        const newAuthor = await prisma.author.create({
            data:{
                name: body.name
            }
        })

        return NextResponse.json({success:true, message: "author created successfully", data:newAuthor}, {status: 201})

    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }

}
