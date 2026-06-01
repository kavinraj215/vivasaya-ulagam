import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const rows = await Setting.find().lean();
    
    // Convert array of settings into a nice key-value object
    const settingsObj: Record<string, any> = {};
    rows.forEach((r: any) => {
      settingsObj[r.key] = r.value;
    });
    
    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Save each key-value pair
    for (const [key, value] of Object.entries(body)) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save settings' }, { status: 400 });
  }
}
