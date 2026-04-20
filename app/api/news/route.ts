
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  const query = searchParams.get('query') || '';

  const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

  let url = '';
  if (query) {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=12&apikey=${apiKey}`;
  } else {
    url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=12&apikey=${apiKey}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ articles: [] });
  }
}