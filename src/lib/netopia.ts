/**
 * NETOPIA Payments API v2 integration (card payments — Romanian gateway).
 * Docs: https://doc.netopia-payments.com/docs/payment-api/v2.x/intro
 *
 * Not wired up to the booking flow yet: the owners don't have a merchant
 * account or a .ro domain (required by Netopia) at the time this skeleton
 * was written. Everything here matches the documented request/response
 * shape so it's just a matter of dropping in real credentials and calling
 * `startNetopiaPayment` from an API route once ready. Vacation vouchers
 * ("carduri de vacanță") are configured later from the Netopia merchant
 * dashboard — no extra code should be needed on our side for those.
 */

const NETOPIA_API_KEY = process.env.NETOPIA_API_KEY;
const NETOPIA_POS_SIGNATURE = process.env.NETOPIA_POS_SIGNATURE;
const NETOPIA_SANDBOX = process.env.NETOPIA_SANDBOX !== "false";

const NETOPIA_START_URL = NETOPIA_SANDBOX
  ? "https://secure.sandbox.netopia-payments.com/payment/card/start"
  : "https://secure.mobilpay.ro/pay/payment/card/start";

export function isNetopiaConfigured(): boolean {
  return Boolean(NETOPIA_API_KEY && NETOPIA_POS_SIGNATURE);
}

export interface NetopiaBillingInfo {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city?: string;
  /** ISO 3166-1 numeric country code, e.g. 642 for Romania. */
  country?: number;
  state?: string;
  postalCode?: string;
}

export interface StartNetopiaPaymentInput {
  orderId: string;
  /** Amount in the major currency unit (e.g. RON), not bani. */
  amount: number;
  currency?: string;
  description: string;
  billing: NetopiaBillingInfo;
  /** Where NETOPIA redirects the browser back to after payment. */
  redirectUrl: string;
  /** Server-to-server IPN endpoint, e.g. /api/payments/netopia/ipn. */
  notifyUrl: string;
}

export interface NetopiaStartResponse {
  customerAction?: {
    type?: string;
    url?: string;
    [key: string]: unknown;
  };
  error?: { code: string; message: string };
  payment?: {
    ntpID?: string;
    status?: number;
    amount?: number;
    currency?: string;
    [key: string]: unknown;
  };
}

export async function startNetopiaPayment(
  input: StartNetopiaPaymentInput
): Promise<NetopiaStartResponse> {
  if (!isNetopiaConfigured()) {
    throw new Error(
      "NETOPIA nu este configurat. Adaugă NETOPIA_API_KEY și NETOPIA_POS_SIGNATURE în variabilele de mediu după deschiderea contului de comerciant."
    );
  }

  const response = await fetch(NETOPIA_START_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: NETOPIA_API_KEY!,
    },
    body: JSON.stringify({
      config: {
        emailTemplate: "",
        notifyUrl: input.notifyUrl,
        redirectUrl: input.redirectUrl,
        language: "ro",
      },
      payment: {
        options: { installments: 0, bonus: 0 },
        instrument: { type: "card" },
      },
      order: {
        ntpID: "",
        posSignature: NETOPIA_POS_SIGNATURE,
        dateTime: new Date().toISOString(),
        description: input.description,
        orderID: input.orderId,
        amount: input.amount,
        currency: input.currency ?? "RON",
        billing: {
          email: input.billing.email,
          phone: input.billing.phone,
          firstName: input.billing.firstName,
          lastName: input.billing.lastName,
          city: input.billing.city ?? "",
          country: input.billing.country ?? 642,
          state: input.billing.state ?? "",
          postalCode: input.billing.postalCode ?? "",
          details: "",
        },
      },
    }),
  });

  const body = (await response.json()) as NetopiaStartResponse;

  if (!response.ok) {
    throw new Error(
      `NETOPIA a răspuns cu eroare (${response.status}): ${body.error?.message ?? "eroare necunoscută"}`
    );
  }

  return body;
}

/**
 * TODO once the merchant account exists: verify the authenticity of
 * incoming IPN callbacks (NETOPIA signs/encrypts notifications — check the
 * "IPN" section of the v2 docs for the exact verification method) before
 * trusting `payment.status` to mark a booking as paid.
 */
