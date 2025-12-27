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

  const data = {
    method,
    pathname,
    userId: payload?.id ?? null,
    role: payload?.role ?? null,
  };

  // 🔥 FIRE & FORGET (tidak await)
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-log-secret": process.env.LOG_SECRET,
    },
    body: JSON.stringify(data),
  }).catch(() => {});

}

// ini dibenahin sehingga bisa menyimpan log pada basis data