import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import { requireAdmin } from '@/lib/authHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const pages = await Page.find().sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    await dbConnect();
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Title and Slug are required' }, { status: 400 });
    }
    const page = await Page.create(body);
    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error: any) {
    console.error('Create page error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create page' }, { status: 400 });
  }
}
