import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import { requireAdmin } from '@/lib/authHelper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    // Support fetching by slug or ID
    const page = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Page.findById(id)
      : await Page.findOne({ slug: id });
      
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch page' }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const page = await Page.findByIdAndUpdate(id, body, { new: true });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Update page error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update page' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    await dbConnect();
    const { id } = await params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (error: any) {
    console.error('Delete page error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete page' }, { status: 400 });
  }
}
