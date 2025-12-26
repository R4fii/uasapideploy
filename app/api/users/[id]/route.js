import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"

const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
    password: z.string().min(6)
})

export async function GET(request, {params}){
    try {

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({success:false, error: "Invalid user ID", code:400}, {status: 400})
        }

        const user = await prisma.user.findUnique({
            where: { id: id }
        })

        if (!user) {
            return NextResponse.json({success:false, error: "User not found", code:404}, {status: 404})
        }

        return NextResponse.json({success:true, message:"user updated successfully", data:user}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}

export async function PUT(request, {params}){

    try {
        
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        const body = await request.json()
        const validation = UserSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({success:false,error: validation.error.errors, code:400}, {status: 400})
        }

        const updateUser = await prisma.user.update({
            where: { id: id },
            data:{
                name: body.name,
                email: body.email,
                role: body.role,
                password: body.password
            }
        })

        return NextResponse.json({success:true, message: "user updated successfully", data:updateUser}, {status: 201})

    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }

}

export async function DELETE(request, {params}){
    try {

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({success:false, error: "Invalid user ID", code:400}, {status: 400})
        }

        const deletedUser = await prisma.user.delete({
            where: { id: id }
        })

        if (!deletedUser) {
            return NextResponse.json({success:false, error: "User not found", code:404}, {status: 404})
        }

        return NextResponse.json({success:true, message:"user deleted successfully", data:deletedUser}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}