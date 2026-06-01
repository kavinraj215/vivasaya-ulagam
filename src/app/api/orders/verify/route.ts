import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { sendEmail, sendAdminNotification } from '@/lib/email';

type VerifyPaymentPayload = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  dbOrderId?: string;
};

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = (await req.json()) as VerifyPaymentPayload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    const isSimulated = razorpay_order_id?.startsWith("rzp_mock_") && process.env.NODE_ENV !== 'production';
    let isAuthentic = false;

    if (isSimulated) {
      // Simulate verification for development mode with placeholder keys
      isAuthentic = razorpay_signature === "mock_signature";
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(body.toString())
        .digest('hex');

      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
    }

    await dbConnect();

    // Update order status
    const order = await Order.findByIdAndUpdate(
      dbOrderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        isPaid: true,
        paidAt: new Date(),
        status: 'processing'
      },
      { new: true }
    ).populate('user');

    if (order) {
      try {
        // Send Email to Admin
        await sendAdminNotification(
          `New Order Placed - ${dbOrderId}`,
          `<h1>New Order Received!</h1><p>Order ID: ${dbOrderId}</p><p>Amount: ₹${order.totalAmount}</p>`
        );

        // Send Email to Customer
        const orderUser = order.user as { email?: string } | null;
        if (orderUser?.email) {
          await sendEmail(
            orderUser.email,
            'Order Confirmation - Vivasaya Ulagam',
            `<h1>Thank you for your order!</h1><p>Your order (ID: ${dbOrderId}) has been received and is now processing.</p><p>Amount Paid: ₹${order.totalAmount}</p>`
          );
        }
      } catch (emailErr) {
        console.error("Failed to send verification emails:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('Error verifying payment:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to verify payment: ${message}` }, { status: 500 });
  }
}
