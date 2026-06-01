import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/authHelper';

export const dynamic = 'force-dynamic';

function normalizeProductPayload(body: any) {
  return {
    ...body,
    weight: body?.weight === '' || body?.weight === undefined ? 0 : Number(body.weight),
    variants: Array.isArray(body?.variants)
      ? body.variants.map((variant: any) => ({
          ...variant,
          price: variant.price === '' || variant.price === undefined ? undefined : Number(variant.price),
          additionalPrice: variant.additionalPrice === '' || variant.additionalPrice === undefined ? 0 : Number(variant.additionalPrice),
          stock: variant.stock === '' || variant.stock === undefined ? 0 : Number(variant.stock),
        }))
      : [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');
    
    await dbConnect();
    
    let products;
    let total = 0;
    let pagination = null;

    if (pageStr || limitStr) {
      const page = Math.max(1, parseInt(pageStr || '1', 10));
      const limit = Math.max(1, Math.min(1000, parseInt(limitStr || '12', 10)));
      const skip = (page - 1) * limit;
      total = await Product.countDocuments();
      products = await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } else {
      products = await Product.find().sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ 
      success: true, 
      products,
      ...(pagination ? { pagination } : {})
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
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
    const product = await Product.create(normalizeProductPayload(body));
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create product' }, { status: 400 });
  }
}
