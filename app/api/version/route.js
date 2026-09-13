export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// What build is the server running? The client compares this to the build it
// was loaded from and reloads when they differ.
export async function GET() {
  return Response.json(
    { id: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
