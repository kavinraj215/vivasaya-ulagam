import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, sendAdminNotification } from '@/lib/email';
import User from '@/models/User';
import Product from '@/models/Product';

type CheckoutItem = {
  id?: string;
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

type ShippingAddress = {
  fullName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
};

type CreateOrderPayload = {
  items?: CheckoutItem[];
  totalAmount?: number;
  shippingAddress?: ShippingAddress;
  isCod?: boolean;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { items, totalAmount, shippingAddress, isCod } = (await req.json()) as CreateOrderPayload;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.phone
    ) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 });
    }

    await dbConnect();

    // Safely locate user ID via session property or database email fallback
    const sessionUser = session.user as typeof session.user & { id?: string };
    let userId = sessionUser.id;
    if (!userId && session.user.email) {
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        userId = dbUser._id.toString();
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid Session: User not found in database matching email' }, { status: 400 });
    }

    // Retrieve active product prices and info from the database
    let totalWeightKg = 0;
    const formattedItems = [];
    
    // Import Setting model dynamically if needed or query it
    const Setting = (await import('@/models/Setting')).default;

    const parseWeightToKg = (val: string, defaultWeight = 0, defaultUnit = 'kg'): number => {
      if (!val) {
        return defaultUnit === 'g' ? defaultWeight / 1000 : defaultWeight;
      }
      const match = val.match(/^([\d.]+)\s*(g|kg|ml|l)$/i);
      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 'g' || unit === 'ml') return amount / 1000;
        return amount;
      }
      return defaultUnit === 'g' ? defaultWeight / 1000 : defaultWeight;
    };

    for (const item of items) {
      const pId = item.id || item.productId;
      if (!pId) {
        return NextResponse.json({ error: 'Missing product ID in order items' }, { status: 400 });
      }
      
      const [mongoId, ...variantParts] = pId.split('-');
      const variantValue = variantParts.join('-'); // e.g., '500g'

      const product = await Product.findById(mongoId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name || 'Unknown'}` }, { status: 404 });
      }
      
      if (product.status !== 'active') {
        return NextResponse.json({ error: `Product is not active: ${product.title}` }, { status: 400 });
      }
      
      const orderQty = Math.floor(Number(item.quantity));
      if (!Number.isFinite(orderQty) || orderQty < 1) {
        return NextResponse.json({ error: `Invalid quantity for product: ${product.title}` }, { status: 400 });
      }
      
      // Determine variant price and stock
      let itemPrice = product.price;
      let finalName = product.title;
      let itemWeight = product.weight || 0;
      let itemWeightUnit = product.weightUnit || 'kg';

      if (variantValue) {
        const variant = product.variants.find((v: any) => v.value === variantValue);
        if (variant) {
          itemPrice = typeof variant.price === 'number' ? variant.price : (product.price + (variant.additionalPrice || 0));
          if (product.trackInventory && typeof variant.stock === 'number' && variant.stock < orderQty) {
            return NextResponse.json({ error: `Insufficient stock for variant: ${product.title} (${variantValue})` }, { status: 400 });
          }
        }
        finalName = `${product.title} - ${variantValue}`;
        itemWeight = parseWeightToKg(variantValue, product.weight, product.weightUnit);
        itemWeightUnit = 'kg';
      } else {
        if (product.trackInventory && product.quantity < orderQty) {
          return NextResponse.json({ error: `Insufficient stock for product: ${product.title}` }, { status: 400 });
        }
        itemWeight = parseWeightToKg('', product.weight, product.weightUnit);
        itemWeightUnit = 'kg';
      }

      totalWeightKg += itemWeight * orderQty;
      
      formattedItems.push({
        productId: product._id.toString(),
        name: finalName,
        price: itemPrice, // STRICTLY USE DB OR VARIANT PRICE
        quantity: orderQty,
        image: product.images?.[0] || item.image || "",
        weightKg: itemWeight,
      });
    }

    const computedSubtotal = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Fetch courier rates
    const courierSetting = await Setting.findOne({ key: 'courier_charges' });
    const rates = courierSetting?.value || { charge_250g: 40, charge_500g: 60, charge_1kg: 80, charge_above: 120 };
    
    let deliveryFee = 0;
    if (computedSubtotal > 0) {
      if (totalWeightKg <= 0.25) deliveryFee = Number(rates.charge_250g || 40);
      else if (totalWeightKg <= 0.5) deliveryFee = Number(rates.charge_500g || 60);
      else if (totalWeightKg <= 1.0) deliveryFee = Number(rates.charge_1kg || 80);
      else deliveryFee = Number(rates.charge_above || 120);
    }

    const computedTotal = computedSubtotal + deliveryFee;

    // Validate client totalAmount against calculated server subtotal
    if (typeof totalAmount === 'number' && Number.isFinite(totalAmount)) {
      if (Math.abs(computedTotal - totalAmount) > 1) {
        return NextResponse.json({ error: 'Product prices have changed. Please refresh your cart and try again.' }, { status: 400 });
      }
    }

    if (isCod) {
      // Cash on Delivery Logic — use new+save to guarantee pre-save hook fires
      const newOrder = new Order({
        user: userId,
        items: formattedItems,
        subtotalAmount: computedSubtotal,
        deliveryFee,
        totalWeightKg,
        totalAmount: computedTotal,
        shippingAddress,
        status: 'processing',
        isPaid: false
      });
      await newOrder.save();

      const populatedOrder = await Order.findById(newOrder._id).populate('user');

      // Send Emails
      if (populatedOrder) {
        try {
          await sendAdminNotification(
            `New COD Order Placed - ${newOrder.orderId}`,
            `<h1>New COD Order Received!</h1><p>Order ID: ${newOrder.orderId}</p><p>Amount: ₹${computedTotal} (To be collected on delivery)</p>`
          );

          const populatedUser = populatedOrder.user as { email?: string } | null;
          if (populatedUser?.email) {
            await sendEmail(
              populatedUser.email,
              'Order Confirmation - Vivasaya Ulagam',
              `<h1>Thank you for your order!</h1><p>Your Cash on Delivery order (ID: ${newOrder.orderId}) has been received and is now processing.</p><p>Amount to pay on delivery: ₹${computedTotal}</p>`
            );
          }
        } catch (emailErr) {
          console.error("Failed to send COD order emails:", emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        orderId: newOrder.orderId,
        dbOrderId: newOrder._id
      });
    } else {
      // Check if Razorpay keys are properly configured or placeholders
      const isRazorpayConfigured = 
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && 
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("your_key_id") && 
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("dummy");

      let razorpayOrderId = "";
      let razorpayAmount = Math.round(computedTotal * 100);

      if (!isRazorpayConfigured) {
        console.warn("⚠️ Razorpay is using placeholder keys. Simulating mock order for local test.");
        razorpayOrderId = `rzp_mock_${Date.now().toString().slice(-6)}`;
      } else {
        const options = {
          amount: razorpayAmount,
          currency: "INR",
          receipt: `receipt_order_${Date.now()}`
        };
        const razorpayOrder = await razorpay.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
        razorpayAmount = typeof razorpayOrder.amount === 'string' ? parseInt(razorpayOrder.amount, 10) : razorpayOrder.amount;
      }

      // Use new+save to guarantee pre-save hook fires
      const newOrder = new Order({
        user: userId,
        items: formattedItems,
        subtotalAmount: computedSubtotal,
        deliveryFee,
        totalWeightKg,
        totalAmount: computedTotal,
        shippingAddress,
        status: 'pending',
        razorpayOrderId,
        isPaid: false
      });
      await newOrder.save();

      return NextResponse.json({
        orderId: razorpayOrderId,
        viuOrderId: newOrder.orderId,
        amount: razorpayAmount,
        dbOrderId: newOrder._id,
        isSimulated: !isRazorpayConfigured
      });
    }

  } catch (error) {
    console.error('Error creating order:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to create order: ${message}` 
    }, { status: 500 });
  }
}
