import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import { requireAdmin } from '@/lib/authHelper';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    const params = await props.params;
    await dbConnect();
    const body = await req.json();

    const video = await Video.findByIdAndUpdate(params.id, body, { new: true });
    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    console.error('Update video error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update video' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    const params = await props.params;
    await dbConnect();
    const video = await Video.findByIdAndDelete(params.id);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('Delete video error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete video' }, { status: 400 });
  }
}
