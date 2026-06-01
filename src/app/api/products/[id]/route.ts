import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/authHelper';

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

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await dbConnect();
    const product = await Product.findById(params.id).lean();
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

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
    const product = await Product.findByIdAndUpdate(params.id, normalizeProductPayload(body), { new: true });
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update product' }, { status: 400 });
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
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete product' }, { status: 400 });
  }
}
