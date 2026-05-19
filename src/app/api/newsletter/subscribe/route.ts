import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('REDIRECT: Newsletter Subscribe POST hit');
  // Redirect to new location
  return NextResponse.json({ success: true, message: 'Redirected', isRedirect: true });
}

export async function GET() {
  return NextResponse.json({ status: 'redirecting' });
}
