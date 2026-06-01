import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authHelper';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export async function POST(req: Request) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
    }

    const data = await req.json();
    await dbConnect();

    // Iterate through keys and update or create them
    for (const [key, value] of Object.entries(data)) {
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
