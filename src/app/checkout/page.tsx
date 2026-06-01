"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  DEFAULT_COURIER_RATES,
  type CourierRates,
  formatWeightKg,
  getCourierBracketLabel,
  getCourierFee,
  parseWeightLabelToKg,
  toWeightKg,
} from "@/lib/shipping";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayPaymentFailure = {
  error?: {
    description?: string;
  };
};

type RazorpayCheckout = {
  on: (event: "payment.failed", handler: (response: RazorpayPaymentFailure) => void) => void;
  open: () => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

type CheckoutSettings = {
  courier_charges?: CourierRates;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, updateItemMetadata, clearCart, hasHydrated } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [settings, setSettings] = useState<CheckoutSettings>({});

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.settings || {});
      })
      .catch(err => console.error("Failed to load settings in checkout", err));
  }, []);

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;

    let cancelled = false;
    const missingWeightItems = items.filter((item) => toWeightKg(item.weight, item.weightUnit || "kg") <= 0);
    if (missingWeightItems.length === 0) return;

    async function loadMissingWeights() {
      await Promise.all(
        missingWeightItems.map(async (item) => {
          const [productId, ...variantParts] = item.id.split("-");
          if (!productId || productId === "video") return;

          try {
            const res = await fetch(`/api/products/${productId}`);
            const data = await res.json();
            if (cancelled || !data.success || !data.product) return;

            const product = data.product;
            const variantValue = variantParts.join("-");
            const resolvedWeight = variantValue
              ? parseWeightLabelToKg(variantValue, product.weight, product.weightUnit || "kg")
              : toWeightKg(product.weight, product.weightUnit || "kg");

            if (resolvedWeight > 0) {
              updateItemMetadata(item.id, {
                weight: resolvedWeight,
                weightUnit: "kg",
              });
            }
          } catch (err) {
            console.error("Failed to load checkout item weight:", err);
          }
        })
      );
    }

    loadMissingWeights();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, items, updateItemMetadata]);

  const subtotal = totalPrice();
  const totalWeight = items.reduce((sum, item) => sum + toWeightKg(item.weight, item.weightUnit || "kg") * item.quantity, 0);
  const deliveryFee = getCourierFee(totalWeight, subtotal, settings.courier_charges || DEFAULT_COURIER_RATES);
  const courierBracket = getCourierBracketLabel(totalWeight);
  const hasMissingWeight = items.some((item) => toWeightKg(item.weight, item.weightUnit || "kg") <= 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hasHydrated, items.length, router]);

  const handlePayment = async () => {
    if (!session) {
      alert("Please login to place an order");
      router.push("/auth");
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
      alert("Please fill all required shipping details");
      return;
    }

    const Razorpay = window.Razorpay;
    if (paymentMethod === "online" && !Razorpay) {
      alert("Payment gateway is still loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on our backend (which creates razorpay order)
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: total,
          shippingAddress,
          isCod: paymentMethod === "cod"
        }),
      });

      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error);

      if (paymentMethod === "cod") {
        clearCart();
        const dbId = orderData.dbOrderId;
        const viuId = orderData.orderId || "Confirmed";
        alert(`✅ Order placed successfully!\n\nOrder ID: ${viuId}\n\nSave this ID to track your order.\nYour invoice will open in a new tab.`);
        window.open(`/api/orders/invoice?orderId=${dbId}`, '_blank');
        router.push("/");
        return;
      }

      // Check if simulated
      if (orderData.isSimulated) {
        alert("⚠️ Simulated Transaction: Since you are using placeholder Razorpay keys in your .env.local file, we are completing a mock transaction automatically for you so you aren't blocked!");
        
        const verifyRes = await fetch("/api/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
            dbOrderId: orderData.dbOrderId
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          alert("🎉 Payment simulated successfully! Your order has been placed.\n\nYour invoice will open in a new tab.");
          window.open(`/api/orders/invoice?orderId=${orderData.dbOrderId}`, '_blank');
          router.push("/");
        } else {
          alert("Failed to verify simulated payment: " + (verifyData.error || "Unknown error"));
        }
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
        amount: orderData.amount,
        currency: "INR",
        name: "Vivasaya Ulagam",
        description: "Test Transaction",
        order_id: orderData.orderId,
        handler: async function (response: RazorpayPaymentResponse) {
          // 3. Verify payment
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            alert("Payment successful! Your order has been placed.\n\nYour invoice will open in a new tab.");
            window.open(`/api/orders/invoice?orderId=${orderData.dbOrderId}`, '_blank');
            router.push("/");
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: session.user?.email || "",
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#1F6B3B",
        },
      };

      if (!Razorpay) {
        alert("Payment gateway is unavailable. Please refresh and try again.");
        return;
      }

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed: " + (response.error?.description || "Please try again."));
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Please check your network connection";
      alert("Error initiating checkout: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasHydrated) {
    return (
      <>
        <Navbar />
        <main className="pt-[calc(var(--navbar-height)+1rem)] pb-16 bg-[#f9fafb] min-h-screen flex items-center justify-center">
          <div className="text-sm font-semibold text-text-muted">Loading checkout...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Navbar />
      <main className="pt-[calc(var(--navbar-height)+1rem)] pb-16 bg-[#f9fafb] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Checkout Form */}
            <div className="flex-[2] space-y-8">
              
              {/* Checkout Progress */}
              <div className="flex items-center gap-4 text-sm font-heading font-bold mb-8">
                <div className="flex items-center gap-1 text-primary">
                  <CheckCircle2 size={16} /> <span className="underline">Cart</span>
                </div>
                <span className="text-gray-300">-----</span>
                <div className="flex items-center gap-1 text-text-dark">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span> <span>Details</span>
                </div>
                <span className="text-gray-300">-----</span>
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</span> <span>Payment</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="font-heading font-bold text-xl text-text-dark mb-6 border-b pb-4">Shipping Information</h2>
                
                <form className="space-y-5 font-body">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-dark">Full Name *</label>
                    <input 
                      type="text" 
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      required
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-dark">Phone Number *</label>
                    <input 
                      type="tel" 
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      required
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-dark">Street Address *</label>
                    <input 
                      type="text" 
                      placeholder="House number and street name" 
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      required
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary mb-2" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-dark">Town / City *</label>
                      <input 
                        type="text" 
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                        className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-dark">PIN Code *</label>
                      <input 
                        type="text" 
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        required
                        className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary" 
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-[calc(var(--navbar-height)+1rem)]">
                <h2 className="font-heading font-bold text-lg text-text-dark mb-6 border-b pb-4">Your Order</h2>
                
                <div className="space-y-3 font-body text-sm mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl overflow-hidden shrink-0">
                          {(item.image?.startsWith("data:") || item.image?.startsWith("/") || item.image?.startsWith("http")) ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{item.image || "🌿"}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-dark">{item.name}</p>
                          <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                          <p className="text-xs text-text-muted">
                            Weight: {formatWeightKg(toWeightKg(item.weight, item.weightUnit || "kg"))}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-text-dark">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-text-muted pt-2">
                    <span>Subtotal</span>
                    <span className="font-heading font-semibold text-text-dark">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Total Weight</span>
                    <span className="font-heading font-semibold text-text-dark">{formatWeightKg(totalWeight)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Courier Slab</span>
                    <span className="font-heading font-semibold text-text-dark">{courierBracket}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Courier Charges</span>
                    <span className="font-heading font-semibold text-text-dark">{formatPrice(deliveryFee)}</span>
                  </div>
                  {hasMissingWeight && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-700">
                      Some product weights are missing. Admin product weights are required for exact courier charges.
                    </p>
                  )}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold text-text-dark text-base">Total</span>
                    <span className="font-heading font-extrabold text-2xl text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6 border border-gray-200 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="radio" 
                      id="pay-online" 
                      name="payment" 
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="accent-black" 
                    />
                    <label htmlFor="pay-online" className="text-sm font-bold text-text-dark">Razorpay (Cards / UPI / NetBanking)</label>
                  </div>
                  {paymentMethod === "online" && (
                    <div className="bg-gray-50 p-3 rounded text-xs text-text-muted font-body leading-relaxed mb-3 border border-gray-100">
                      Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="pay-cod" 
                      name="payment" 
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-black" 
                    />
                    <label htmlFor="pay-cod" className="text-sm font-bold text-text-dark">Cash on Delivery</label>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="bg-gray-50 p-3 rounded text-xs text-text-muted font-body leading-relaxed mt-3 border border-gray-100">
                      Pay with cash upon delivery.
                    </div>
                  )}
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-black text-white py-3.5 rounded-sm font-bold tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {loading ? "PROCESSING..." : "PLACE ORDER"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
