import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }
    
    // Check if email already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed!' });
    }
    
    await Newsletter.create({ email });
    return NextResponse.json({ success: true, message: 'Subscribed successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Subscription failed' }, { status: 400 });
  }
}
