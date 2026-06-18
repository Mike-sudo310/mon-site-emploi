import { NextResponse } from "next/server";

let cache: any = null;
let lastFetch = 0;

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();

  // ✅ CACHE ACTIF
  if (cache && now - lastFetch < CACHE_TIME) {
    return NextResponse.json(cache);
  }

  try {
    const url =
      "https://jsearch.p.rapidapi.com/search?query=drone OR UAV OR RPAS";

    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    // 🔴 IMPORTANT: gérer 429 proprement
    if (res.status === 429) {
      return NextResponse.json(
        { data: [], error: "Rate limit JSearch" },
        { status: 200 }
      );
    }

    const data = await res.json();

    cache = data;
    lastFetch = now;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { data: [], error: "API error" },
      { status: 500 }
    );
  }
}