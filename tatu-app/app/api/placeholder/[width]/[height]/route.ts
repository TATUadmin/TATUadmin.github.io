import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function clampSize(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.min(Math.max(Math.floor(value), 1), 2000)
}

export async function GET(
  request: Request,
  { params }: { params: { width: string; height: string } }
) {
  const width = clampSize(parseInt(params.width, 10), 80)
  const height = clampSize(parseInt(params.height, 10), 80)
  const fontSize = Math.max(10, Math.round(Math.min(width, height) / 5))
  const label = `${width}x${height}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#1f2937" />
  <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" fill="#9ca3af" dominant-baseline="middle" text-anchor="middle">${label}</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
