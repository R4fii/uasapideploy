import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// export async function requireAuth(request) {
//   const authHeader = request.headers.get("authorization");

//   if (!authHeader) {
//     throw new Error("UNAUTHORIZED");
//   }

//   const [type, token] = authHeader.split(" ");

//   if (type !== "Bearer" || !token) {
//     throw new Error("INVALID_FORMAT");
//   }

//   const { payload } = await jwtVerify(token, secret);

//   const user = await prisma.user.findUnique({
//     where: { id: payload.id },
//   });

//   if (!user || user.token !== token) {
//     throw new Error("TOKEN_INACTIVE");
//   }

//   return {
//     user,
//     payload,
//     token,
//   };
// }

export async function requireAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw { status: 401, message: "Unauthorized" };
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    throw { status: 401, message: "Invalid authorization format" };
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || user.token !== token) {
      throw { status: 401, message: "Token inactive" };
    }

    return { user, payload, token };
  } catch (err) {
    // jose error: JWTExpired, JWTInvalid, dll
    console.error(err)
    throw { status: 401, message: "Token expired or invalid" };
  }
}
