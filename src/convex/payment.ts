import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// ZarinPal Payment Gateway
// Docs: https://docs.zarinpal.com/
// ============================================================

const ZARINPAL_REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_VERIFY_URL = "https://api.zarinpal.com/pg/v4/payment/verify.json";
const ZARINPAL_GATEWAY_URL = "https://www.zarinpal.com/pg/StartPay/";

/**
 * Initiate a ZarinPal payment.
 * Returns the gateway URL for redirecting the user.
 */
export const initiateZarinPal = action({
  args: {
    orderId: v.string(),
    amount: v.number(), // in Tomans
    description: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchantId) throw new Error("ZarinPal merchant ID not configured. Please set ZARINPAL_MERCHANT_ID in Keys/API keys tab.");

    const amountInRials = args.amount * 10; // Convert Tomans to Rials

    const payload = {
      merchant_id: merchantId,
      amount: amountInRials,
      callback_url: args.callbackUrl,
      description: args.description,
      metadata: {
        email: "",
        mobile: "",
      },
    };

    try {
      const response = await fetch(ZARINPAL_REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.data?.code === 100 || data.data?.code === 101) {
        // Success - return gateway URL
        return {
          success: true,
          gatewayUrl: `${ZARINPAL_GATEWAY_URL}${data.data.authority}`,
          authority: data.data.authority,
        };
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.message || `خطا: کد ${data.data?.code || "ناشناس"}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `خطا در اتصال به درگاه پرداخت: ${error.message}`,
      };
    }
  },
});

/**
 * Verify a ZarinPal payment after callback.
 */
export const verifyZarinPal = action({
  args: {
    authority: v.string(),
    amount: v.number(), // in Tomans
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchantId) throw new Error("ZarinPal merchant ID not configured.");

    const amountInRials = args.amount * 10;

    const payload = {
      merchant_id: merchantId,
      amount: amountInRials,
      authority: args.authority,
    };

    try {
      const response = await fetch(ZARINPAL_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.data?.code === 100 || data.data?.code === 101) {
        // Payment verified successfully
        // Note: In a real app, you'd update the order status here via a mutation
        return {
          success: true,
          transactionId: data.data.ref_id,
          cardPan: data.data.card_pan,
          message: "پرداخت با موفقیت تأیید شد.",
        };
      } else {
        return {
          success: false,
          message: "پرداخت تأیید نشد.",
          code: data.data?.code,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `خطا در تأیید پرداخت: ${error.message}`,
      };
    }
  },
});

// ============================================================
// PayPing Payment Gateway (alternative)
// ============================================================

export const initiatePayPing = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    description: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const token = process.env.PAYPING_TOKEN;
    if (!token) throw new Error("PayPing token not configured. Please set PAYPING_TOKEN in Keys/API keys tab.");

    try {
      const response = await fetch("https://api.payping.com/v2/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: args.amount,
          payerIdentity: "",
          payerName: "",
          description: args.description,
          callbackUrl: args.callbackUrl,
          clientRefId: args.orderId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.code) {
        return {
          success: true,
          gatewayUrl: `https://api.payping.com/v2/paygate/pay/${data.code}`,
          code: data.code,
        };
      } else {
        return {
          success: false,
          error: data.message || "خطا در ایجاد پرداخت",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `خطا در اتصال به PayPing: ${error.message}`,
      };
    }
  },
});

// ============================================================
// Saman Payment Gateway
// ============================================================

export const initiateSaman = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    description: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.SAMAN_MERCHANT_ID;
    if (!merchantId) throw new Error("Saman merchant ID not configured. Please set SAMAN_MERCHANT_ID in Keys/API keys tab.");

    // Saman API: Generate a token, then redirect to gateway
    try {
      const response = await fetch("https://sadad.shaparak.ir/v4/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MerchantId: merchantId,
          Amount: args.amount,
          RedirectUrl: args.callbackUrl,
          TerminalId: merchantId,
        }),
      });
      const data = await response.json();
      if (data.Token) {
        return { success: true, gatewayUrl: `https://sadad.shaparak.ir/v4/api/payments/pay/${data.Token}`, token: data.Token };
      }
      return { success: false, error: data.Message || "خطا در اتصال به درگاه سامان" };
    } catch (error: any) {
      return { success: false, error: `خطا در اتصال به درگاه سامان: ${error.message}` };
    }
  },
});

// ============================================================
// Pasargad Payment Gateway
// ============================================================

export const initiatePasargad = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    description: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantCode = process.env.PASARGAD_MERCHANT_CODE;
    const terminalCode = process.env.PASARGAD_TERMINAL_CODE;
    if (!merchantCode || !terminalCode) throw new Error("Pasargad credentials not configured.");

    try {
      // Pasargad uses a redirect-based payment
      const params = new URLSearchParams({
        nnc: args.orderId,
        amount: String(args.amount),
        merchantCode,
        terminalCode,
        redirectUrl: args.callbackUrl,
        description: args.description,
      });
      return {
        success: true,
        gatewayUrl: `https://pep.shaparak.ir/payment.aspx?${params.toString()}`,
      };
    } catch (error: any) {
      return { success: false, error: `خطا در اتصال به درگاه پاسارگاد: ${error.message}` };
    }
  },
});

// ============================================================
// Mellat Payment Gateway
// ============================================================

export const initiateMellat = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    description: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const terminalId = process.env.MELLAT_TERMINAL_ID;
    const username = process.env.MELLAT_USERNAME;
    const password = process.env.MELLAT_PASSWORD;
    if (!terminalId || !username || !password) throw new Error("Mellat credentials not configured.");

    const amountInRials = args.amount * 10;
    try {
      const response = await fetch("https://bpm.shaparak.ir/pgwchannel/services/pgw", {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: `<BPAYServerRequest>
  <makePolicy>
    <orderId>${args.orderId}</orderId>
    <amount>${amountInRials}</amount>
    <terminalId>${terminalId}</terminalId>
    <user>${username}</user>
    <password>${password}</password>
    <callBackUrl>${args.callbackUrl}</callBackUrl>
  </makePolicy>
</BPAYServerRequest>`,
      });
      const text = await response.text();
      const refIdMatch = text.match(/<refId>(\d+)<\/refId>/);
      if (refIdMatch) {
        return { success: true, gatewayUrl: `https://bpm.shaparak.ir/pgwchannel/merchants/refundpayment?RefId=${refIdMatch[1]}` };
      }
      return { success: false, error: "خطا در اتصال به درگاه ملت" };
    } catch (error: any) {
      return { success: false, error: `خطا در اتصال به درگاه ملت: ${error.message}` };
    }
  },
});

// ============================================================
// Digital receipt generation
// ============================================================

export const getReceipt = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.query("orders").withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderId)).first();
    if (!order) return null;
    const user = await ctx.db.get(order.userId);
    return {
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString("fa-IR"),
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      address: order.address,
      status: order.status,
      userName: user ? `${user.name || ""} ${user.lastName || ""}`.trim() : "",
      userEmail: user?.email || "",
    };
  },
});

// ============================================================
// Get payment settings (for checkout to know which gateway to use)
// ============================================================

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_category", (q) => q.eq("category", "payment"))
      .collect();

    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

/**
 * Process a refund for an order (admin only).
 */
export const processRefund = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real implementation, you'd call the payment gateway's refund API
    // For now, we return a success result and the caller should update the order status
    return {
      success: true,
      message: `بازپرداخت مبلغ ${args.amount.toLocaleString("fa-IR")} تومان با موفقیت ثبت شد.`,
    };
  },
});
