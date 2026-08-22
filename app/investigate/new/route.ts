
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const content = formData.get('content');
  const type = formData.get('type') || 'message';
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(baseUrl + '/api/investigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content })
  });
  
  if (!res.ok) {
    return NextResponse.redirect(new URL('/?error=true', req.url));
  }
  
  const data = await res.json();
  return NextResponse.redirect(new URL(`/investigate/${data.id}`, req.url));
}
