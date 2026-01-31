import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolved = await params;
  const slug = resolved.slug ?? [];
  const [width, height] = slug.map(Number);

  if (!width || !height || width > 2000 || height > 2000) {
    return new Response('Invalid dimensions', { status: 400 });
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">
        ${width} x ${height}
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
