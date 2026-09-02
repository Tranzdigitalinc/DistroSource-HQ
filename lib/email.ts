import { Resend } from "resend"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured")
  return new Resend(apiKey)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "RedeemCove <support@redeemcove.com>"
const LOGO_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2031%2C%202026%2C%2008_01_39%20PM-qRhA04nZH0DW0ucjzMDiU2ILGL1e2U.png"

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to RedeemCove — verify your email",
    html: `
      <div style="margin:0;padding:32px 12px;background:#eef4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0b1b31;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;margin:0 auto;border-collapse:separate;">
          <tr><td style="padding:0 0 18px;text-align:center;font-size:12px;letter-spacing:1.5px;color:#60758c;text-transform:uppercase;">Secure digital gifting, made simple</td></tr>
          <tr><td style="background:#081426;border-radius:20px 20px 0 0;padding:28px 28px 24px;text-align:center;">
            <img src="${LOGO_URL}" alt="RedeemCove — gift cards, digital codes, instant value" width="360" style="display:block;width:360px;max-width:100%;height:auto;margin:0 auto;" />
          </td></tr>
          <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:38px 34px 32px;border:1px solid #dce6ee;border-top:0;">
            <p style="margin:0 0 10px;text-align:center;color:#168ba5;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Welcome aboard</p>
            <h1 style="margin:0;text-align:center;color:#0b1b31;font-size:28px;line-height:1.2;font-weight:750;letter-spacing:-.4px;">Confirm your email address</h1>
            <p style="margin:18px 0 0;text-align:center;color:#52677c;font-size:16px;line-height:1.65;">Thanks for creating your RedeemCove account. Confirm your email to keep your account secure and unlock instant access to your digital codes.</p>
            <div style="padding:28px 0 24px;text-align:center;"><a href="${verificationUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-size:15px;font-weight:750;line-height:1;text-decoration:none;padding:16px 28px;border-radius:9px;box-shadow:0 5px 14px rgba(19,191,220,.22);">Verify my email</a></div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f8fb;border:1px solid #e1edf2;border-radius:12px;"><tr><td style="padding:15px 16px;color:#52677c;font-size:13px;line-height:1.55;"><strong style="color:#0b1b31;">What happens next?</strong><br />You&apos;ll be ready to shop trusted gift cards and receive your codes instantly.</td></tr></table>
            <p style="margin:24px 0 0;color:#7a8da0;font-size:12px;line-height:1.6;">If you didn&apos;t create a RedeemCove account, you can safely ignore this message. This verification link is unique to your account.</p>
          </td></tr>
          <tr><td style="padding:22px 12px 0;text-align:center;color:#71859a;font-size:12px;line-height:1.7;">RedeemCove.com<br /><a href="mailto:support@RedeemCove.com" style="color:#168ba5;text-decoration:none;">support@RedeemCove.com</a><br /><span style="font-size:11px;color:#91a1b0;">Digital value, delivered better.</span></td></tr>
        </table>
      </div>
    `,
    text: `Welcome to RedeemCove. Confirm your email address to secure your account and access your digital codes: ${verificationUrl}\n\nWhat happens next? You will be ready to shop trusted gift cards and receive your codes instantly.\n\nIf you did not create a RedeemCove account, you can safely ignore this message.\n\nRedeemCove.com · support@RedeemCove.com`,
  })

  if (error) {
    console.error("[v0] Failed to send verification email:", error)
    throw new Error("Could not send the verification email. Please try again later.")
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your RedeemCove password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 24px;">
          We received a request to reset the password for your RedeemCove account. Click the button below to
          choose a new password. This link expires in 15 minutes.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          Reset password
        </a>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          If you didn't request this, you can safely ignore this email — your password will not be changed.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          RedeemCove &middot; Support@RedeemCove.com
        </p>
      </div>
    `,
    text: `Reset your RedeemCove password by visiting this link (expires in 15 minutes): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
  })

  if (error) {
    console.error("[v0] Failed to send password reset email:", error)
    throw new Error("Could not send the password reset email. Please try again later.")
  }
}

interface OrderConfirmationItem {
  productName: string
  licenseType: string
  quantity: number
}

function formatLicenseLabel(licenseType: string) {
  return licenseType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getSiteUrl() {
  return process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
}

export async function sendAbandonedCartEmail(to: string, recoveryUrl: string, subtotalUsd: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your RedeemCove cart is waiting",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a"><h1 style="font-size:22px;margin:0 0 12px">Your cart is waiting</h1><p style="font-size:14px;line-height:1.6;color:#4a4a4a">You left digital value behind. Your saved cart is ready whenever you are.</p><p style="font-weight:700">Cart total: $${subtotalUsd.toFixed(2)}</p><a href="${recoveryUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:8px">Return to cart</a><p style="font-size:12px;color:#8a8a8a;margin-top:24px">RedeemCove · Instant digital delivery</p></div>`,
    text: `Your RedeemCove cart is waiting. Cart total: $${subtotalUsd.toFixed(2)}. Return to your cart: ${recoveryUrl}`,
  })
  if (error) { console.error("[v0] Failed to send abandoned cart email:", error); return false }
  return true
}

export async function sendAbandonedCartReminderEmail(to: string, recoveryUrl: string, subtotalUsd: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Still thinking it over? Your cart is still here",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a"><h1 style="font-size:22px;margin:0 0 12px">A quick reminder</h1><p style="font-size:14px;line-height:1.6;color:#4a4a4a">The items in your RedeemCove cart haven&apos;t been claimed yet. Complete your order before availability changes.</p><p style="font-weight:700">Cart total: $${subtotalUsd.toFixed(2)}</p><a href="${recoveryUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:8px">Complete my order</a><p style="font-size:12px;color:#8a8a8a;margin-top:24px">RedeemCove · Instant digital delivery</p></div>`,
    text: `A quick reminder: the items in your RedeemCove cart haven't been claimed yet. Cart total: $${subtotalUsd.toFixed(2)}. Complete your order: ${recoveryUrl}`,
  })
  if (error) { console.error("[v0] Failed to send abandoned cart reminder email:", error); return false }
  return true
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  items: OrderConfirmationItem[],
) {
  const libraryUrl = `${getSiteUrl()}/account/library`

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #1a1a1a;">
            ${item.productName} ${item.quantity > 1 ? `x${item.quantity}` : ""}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #4a4a4a; text-align: right;">
            ${formatLicenseLabel(item.licenseType)} license
          </td>
        </tr>`,
    )
    .join("")

  const itemsText = items
    .map((item) => `${item.productName} x${item.quantity} — ${formatLicenseLabel(item.licenseType)} license`)
    .join("\n")

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your order ${orderNumber} is ready to download`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Order confirmed</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 24px;">
          Order <strong>${orderNumber}</strong> — here&apos;s what you bought. Everything is ready in your library now.
        </p>
        <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
        <div style="padding: 24px 0 8px; text-align: center;">
          <a href="${libraryUrl}" style="display: inline-block; background: #13bfdc; color: #061426; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 24px; border-radius: 8px;">Go to My Library</a>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          Sign in and open My Library to download your files anytime — every download is tied to your account, not a link that can expire or be shared away.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          DistroSource &middot; Support@DistroSource.com
        </p>
      </div>
    `,
    text: `Order ${orderNumber} confirmed. Here's what you bought:\n\n${itemsText}\n\nEverything is ready in your library now: ${libraryUrl}`,
  })

  if (error) {
    console.error("[v0] Failed to send order confirmation email:", error)
    return false
  }
  return true
}

export async function sendRefundConfirmationEmail(to: string, orderNumber: string, totalUsd: number, reason?: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your RedeemCove order ${orderNumber} has been refunded`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Refund confirmed</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
          Order <strong>${orderNumber}</strong> for <strong>$${totalUsd.toFixed(2)}</strong> has been refunded. Download access for the products on this order has been revoked and they&apos;ve been removed from your library.
        </p>
        ${reason ? `<p style="font-size: 13px; line-height: 1.6; color: #6a6a6a; margin: 0 0 16px;">Reason: ${reason}</p>` : ""}
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          If you have questions about this refund, reply to this email or contact support.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          DistroSource &middot; Support@DistroSource.com
        </p>
      </div>
    `,
    text: `Order ${orderNumber} for $${totalUsd.toFixed(2)} has been refunded. Download access for the products on this order has been revoked.${reason ? `\n\nReason: ${reason}` : ""}\n\nDistroSource · Support@DistroSource.com`,
  })

  if (error) {
    console.error("[v0] Failed to send refund confirmation email:", error)
    return false
  }
  return true
}

export async function sendReferralRewardEmail(to: string, couponCode: string, discountPercent: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You earned a referral reward on RedeemCove",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Your referral paid off</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
          A friend just completed their first order using your referral link. As a thank-you, here&apos;s a
          <strong>${discountPercent}% off</strong> coupon for your next order.
        </p>
        <p style="font-size: 18px; font-weight: 700; font-family: monospace; background: #f3f3f3; padding: 12px 16px; border-radius: 8px; margin: 0 0 16px;">${couponCode}</p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          Keep sharing your referral link from your RedeemCove account to earn more rewards.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          RedeemCove &middot; Support@RedeemCove.com
        </p>
      </div>
    `,
    text: `A friend just completed their first order using your referral link. As a thank-you, here's a ${discountPercent}% off coupon: ${couponCode}\n\nKeep sharing your referral link to earn more rewards.\n\nRedeemCove · Support@RedeemCove.com`,
  })

  if (error) {
    console.error("[v0] Failed to send referral reward email:", error)
    return false
  }
  return true
}

