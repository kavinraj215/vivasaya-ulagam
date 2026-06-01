import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId).select('addresses');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, addresses: user.addresses || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { label, line1, line2 } = await req.json();
    
    if (!label || !line1) {
      return NextResponse.json({ error: 'Label and Line 1 are required' }, { status: 400 });
    }
    
    await dbConnect();
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    user.addresses.push({ label, line1, line2: line2 || '' });
    await user.save();
    
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('id');
    
    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId);
    await user.save();
    
    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
