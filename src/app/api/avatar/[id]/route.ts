import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params to get the id
  const { id } = await params;

  // Validate the id to prevent potential errors
  if (!id || typeof id !== 'string') {
    return new NextResponse('Invalid ID', { status: 400 });
  }

  // Create initials from the ID (first character)
  const initial = id.charAt(0).toUpperCase();

  // Create a simple SVG avatar
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#3B82F6" rx="50"/>
      <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}