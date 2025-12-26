import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"

const BookSchema = z.object({
    title: z.string().min(1),
    publishedYear: z.number().min(0).max(new Date().getFullYear()),
    publisher: z.string().min(4)
})

export async function GET(request, {params}){
    try {

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({success:false, error: "Invalid book ID", code:400}, {status: 400})
        }

        const book = await prisma.book.findUnique({
            where: { id: id },
            include:{
                author: true
            }
        })

        if (!book) {
            return NextResponse.json({success:false, error: "Book not found", code:404}, {status: 404})
        }

        return NextResponse.json({success:true, message:"book updated successfully", data:book}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}

export async function PUT(request, {params}){

    try {
        
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        const body = await request.json()
        const validation = BookSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({success:false,error: validation.error.errors, code:400}, {status: 400})
        }

        let updatedData = {
            title: body.title,
            publishedYear: body.publishedYear,
            publisher: body.publisher
        }

        if (body.hapusAuthor ==true) {
            updatedData.author = { disconnect: true }
        }
        else if (body.authorId) {
            updatedData.author = { connect: { id: body.authorId } }
        }

        const updateBook = await prisma.book.update({
            where: { id: id },
            data: updatedData,
            include:{
                author: true
            }
        })

        return NextResponse.json({success:true, message: "book updated successfully", data:updateBook}, {status: 201})

    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }

}

export async function DELETE(request, {params}){
    try {

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({success:false, error: "Invalid book ID", code:400}, {status: 400})
        }

        const deletedBook = await prisma.book.delete({
            where: { id: id }
        })

        if (!deletedBook) {
            return NextResponse.json({success:false, error: "Book not found", code:404}, {status: 404})
        }

        return NextResponse.json({success:true, message:"book deleted successfully", data:deletedBook}, {status: 200})
    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }
}