// app/api/_lib/cors.ts
import { NextResponse } from "next/server";

export function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true", // safe even if you use Bearer
  };
}

export function preflight(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}
