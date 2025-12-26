import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"
import { RateLimiter } from "../RateLimiter"

const BookSchema = z.object({
    title: z.string().min(1),
    publishedYear: z.number().min(0).max(new Date().getFullYear()),
    publisher: z.string().min(4)
})

export async function GET(request, {params}){
    try {

        RateLimiter(request)

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

        return NextResponse.json({success:true, message:"book found", data:book}, {status: 200})
    } catch (error) {
        console.error(error.message)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }
}

export async function PUT(request, {params}){

    try {

        RateLimiter(request)
        
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        const body = await request.json()
        const validation = BookSchema.safeParse(body)

        if (!validation.success) {
            console.error(validation.error.flatten)
            return NextResponse.json({success:false,error: "validasi gagal", code:400}, {status: 400})
        }

        let updatedData = {
            title: body.title,
            publishedYear: body.publishedYear,
            publisher: body.publisher
        }

        if (body.hapusAuthor == true) {
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

        return NextResponse.json({success:true, message: "book updated successfully", data:updateBook}, {status: 200})

    } catch (error) {
        console.error(error.message)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }

}

export async function DELETE(request, {params}){
    try {

        RateLimiter(request)

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({success:false, error: "Invalid book ID", code:400}, {status: 400})
        }

        const deletedBook = await prisma.book.delete({
            where: { id: id }
        })

        // if (!deletedBook) {
        //     return NextResponse.json({success:false, error: "Book not found", code:404}, {status: 404})
        // }

        return NextResponse.json({success:true, message:"book deleted successfully", data:deletedBook}, {status: 200})
    } catch (error) {
        console.error(error.message)
        return NextResponse.json({success:false, error: "internal server error", code:500}, {status: 500})
    }
}