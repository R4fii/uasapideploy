// logging.js
export function logging(request, payload) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  console.info(`[API LOG] ${method} ${pathname}`);

  if (payload) {
    console.info(
      `[USER] id: ${payload.id ?? "-"}, role: ${payload.role ?? "-"}`
    );
  } else {
    console.info("[USER] anonymous");
  }
}
