import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"
import {z} from "zod"
import { RateLimiter } from "../RateLimiter"
import { requireAuth } from "../../../lib/auth"

const BookSchema = z.object({
    title: z.string().min(1),
    authorId: z.number().min(1),
    publishedYear: z.number().min(0),
    publisher: z.string().min(4)
})

// export async function GET(){
//     try {
//         const books = await prisma.book.findMany({
//             include:{
//                 author: true
//             }
//         })
//         return NextResponse.json({success:true, message:"books retrieved successfully", data:books}, {status: 200})
//     } catch (error) {
//         return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
//     }
// }

export async function GET(request) {
  try {

    const {user} = await requireAuth(request);

    if (!user) {
      return NextResponse.json(
      { success: false, message: "user memiliki token tidak invalid" },
      { status: 500 }
    );
    }

    // Panggil rate limiter
    const rateLimitResponse = RateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Ambil query params page & limit
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;      // default page 1
    const limit = parseInt(url.searchParams.get("limit")) || 3;   // default 10 item per page

    // Hitung offset
    const skip = (page - 1) * limit;

    // Ambil total count untuk info pagination
    const total = await prisma.book.count();

    // Ambil data
    const books = await prisma.book.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    });

    // Hitung total page
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: books,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request){

    try {
        
        const body = await request.json()
        const validation = BookSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({success:false,error: validation.error.errors, code:400}, {status: 400})
        }

        const newBook = await prisma.book.create({
            data:{
                title: body.title,
                publishedYear: body.publishedYear,
                publisher: body.publisher,
                author:{
                    connect:{id: body.authorId}
                }
            }
        })

        return NextResponse.json({success:true, message: "book created successfully", data:newBook}, {status: 201})

    } catch (error) {
        return NextResponse.json({success:false, error: error.message, code:500}, {status: 500})
    }

}

