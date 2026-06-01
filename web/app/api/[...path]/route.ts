import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"), "GET");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"), "POST");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"), "PUT");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"), "DELETE");
}

async function proxy(req: NextRequest, path: string, method: string) {
  const url = `${API_URL}/api/v1/${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (k !== "host" && k !== "content-length") {
      headers[k] = v;
    }
  });

  const body = method === "GET" || method === "DELETE" ? undefined : await req.text();

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...headers,
        "Content-Type": req.headers.get("content-type") || "application/json",
      },
      body,
    });

    const resHeaders = new Headers();
    res.headers.forEach((v, k) => {
      if (k !== "content-encoding" && k !== "transfer-encoding") {
        resHeaders.set(k, v);
      }
    });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: res.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Backend connection failed" },
      { status: 502 }
    );
  }
}
