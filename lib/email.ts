import { Resend } from "resend"
import { getAuthBaseUrl } from "@/lib/env"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured")
  return new Resend(apiKey)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "DistroSource <support@distrosource.com>"

// Email clients fetch images over the public internet, so this must be an
// absolute URL — never a bare "/images/..." path. Resolved lazily (not at
// module load) since getAuthBaseUrl() can throw if misconfigured, and that
// must only surface when an email actually sends, not on import. Uses the
// real DistroSource logo (white "Distro" wordmark) shipped in /public, sized
// for the dark header used in these templates. Do not point this at any
// other brand's asset — it was previously (incorrectly) pointing at a
// RedeemCove logo.
function getLogoUrl() {
  return `${getAuthBaseUrl()}/images/distro-source-logo-dark.png`
}

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to DistroSource — verify your email",
    html: `
      <div style="margin:0;padding:32px 12px;background:#eef4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0b1b31;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;margin:0 auto;border-collapse:separate;">
          <tr><td style="padding:0 0 18px;text-align:center;font-size:12px;letter-spacing:1.5px;color:#60758c;text-transform:uppercase;">Digital products, licensed and delivered instantly</td></tr>
          <tr><td style="background:#081426;border-radius:20px 20px 0 0;padding:28px 28px 24px;text-align:center;">
            <img src="${getLogoUrl()}" alt="DistroSource — templates, tools, and digital assets" width="360" style="display:block;width:360px;max-width:100%;height:auto;margin:0 auto;" />
          </td></tr>
          <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:38px 34px 32px;border:1px solid #dce6ee;border-top:0;">
            <p style="margin:0 0 10px;text-align:center;color:#168ba5;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Welcome aboard</p>
            <h1 style="margin:0;text-align:center;color:#0b1b31;font-size:28px;line-height:1.2;font-weight:750;letter-spacing:-.4px;">Confirm your email address</h1>
            <p style="margin:18px 0 0;text-align:center;color:#52677c;font-size:16px;line-height:1.65;">Thanks for creating your DistroSource account. Confirm your email to keep your account secure and unlock instant access to your library and licenses.</p>
            <div style="padding:28px 0 24px;text-align:center;"><a href="${verificationUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-size:15px;font-weight:750;line-height:1;text-decoration:none;padding:16px 28px;border-radius:9px;box-shadow:0 5px 14px rgba(19,191,220,.22);">Verify my email</a></div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f8fb;border:1px solid #e1edf2;border-radius:12px;"><tr><td style="padding:15px 16px;color:#52677c;font-size:13px;line-height:1.55;"><strong style="color:#0b1b31;">What happens next?</strong><br />You&apos;ll be ready to browse templates and tools and download your purchases instantly.</td></tr></table>
            <p style="margin:24px 0 0;color:#7a8da0;font-size:12px;line-height:1.6;">If you didn&apos;t create a DistroSource account, you can safely ignore this message. This verification link is unique to your account.</p>
          </td></tr>
          <tr><td style="padding:22px 12px 0;text-align:center;color:#71859a;font-size:12px;line-height:1.7;">DistroSource.com<br /><a href="mailto:support@distrosource.com" style="color:#168ba5;text-decoration:none;">support@distrosource.com</a><br /><span style="font-size:11px;color:#91a1b0;">Digital products, delivered better.</span></td></tr>
        </table>
      </div>
    `,
    text: `Welcome to DistroSource. Confirm your email address to secure your account and access your library: ${verificationUrl}\n\nWhat happens next? You will be ready to browse templates and tools and download your purchases instantly.\n\nIf you did not create a DistroSource account, you can safely ignore this message.\n\nDistroSource.com · support@distrosource.com`,
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
    subject: "Reset your DistroSource password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 24px;">
          We received a request to reset the password for your DistroSource account. Click the button below to
          choose a new password. This link expires in 15 minutes.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          Reset password
        </a>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          If you didn't request this, you can safely ignore this email — your password will not be changed.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          DistroSource &middot; support@distrosource.com
        </p>
      </div>
    `,
    text: `Reset your DistroSource password by visiting this link (expires in 15 minutes): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
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
  // Centralized so an emailed link can never point a real customer at
  // localhost. getAuthBaseUrl() throws in production rather than sending a
  // password-reset or cart-recovery link nobody can open.
  return getAuthBaseUrl()
}

export async function sendAbandonedCartEmail(to: string, recoveryUrl: string, subtotalUsd: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your DistroSource cart is waiting",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a"><h1 style="font-size:22px;margin:0 0 12px">Your cart is waiting</h1><p style="font-size:14px;line-height:1.6;color:#4a4a4a">You left some templates and tools behind. Your saved cart is ready whenever you are.</p><p style="font-weight:700">Cart total: $${subtotalUsd.toFixed(2)}</p><a href="${recoveryUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:8px">Return to cart</a><p style="font-size:12px;color:#8a8a8a;margin-top:24px">DistroSource · Instant digital delivery</p></div>`,
    text: `Your DistroSource cart is waiting. Cart total: $${subtotalUsd.toFixed(2)}. Return to your cart: ${recoveryUrl}`,
  })
  if (error) { console.error("[v0] Failed to send abandoned cart email:", error); return false }
  return true
}

export async function sendAbandonedCartReminderEmail(to: string, recoveryUrl: string, subtotalUsd: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Still thinking it over? Your cart is still here",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a"><h1 style="font-size:22px;margin:0 0 12px">A quick reminder</h1><p style="font-size:14px;line-height:1.6;color:#4a4a4a">The items in your DistroSource cart haven&apos;t been claimed yet. Complete your order before availability changes.</p><p style="font-weight:700">Cart total: $${subtotalUsd.toFixed(2)}</p><a href="${recoveryUrl}" style="display:inline-block;background:#13bfdc;color:#061426;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:8px">Complete my order</a><p style="font-size:12px;color:#8a8a8a;margin-top:24px">DistroSource · Instant digital delivery</p></div>`,
    text: `A quick reminder: the items in your DistroSource cart haven't been claimed yet. Cart total: $${subtotalUsd.toFixed(2)}. Complete your order: ${recoveryUrl}`,
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
          DistroSource &middot; support@distrosource.com
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
    subject: `Your DistroSource order ${orderNumber} has been refunded`,
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
          DistroSource &middot; support@distrosource.com
        </p>
      </div>
    `,
    text: `Order ${orderNumber} for $${totalUsd.toFixed(2)} has been refunded. Download access for the products on this order has been revoked.${reason ? `\n\nReason: ${reason}` : ""}\n\nDistroSource · support@distrosource.com`,
  })

  if (error) {
    console.error("[v0] Failed to send refund confirmation email:", error)
    return false
  }
  return true
}

// The domain that receives inbound mail for the support inbox. Root domain
// (distrosource.com) already has other mail on it, so inbound routing lives
// on a delegated subdomain instead of taking over the root MX records.
const SUPPORT_INBOUND_DOMAIN = process.env.RESEND_SUPPORT_INBOUND_DOMAIN ?? "mail.distrosource.com"

// A conversation-scoped Reply-To (conversation+<id>@mail.distrosource.com)
// is what lets a customer's plain "Reply" land back on the right thread —
// the inbound webhook parses the id out of the recipient address.
function conversationReplyTo(conversationId: number) {
  return `DistroSource Support <conversation+${conversationId}@${SUPPORT_INBOUND_DOMAIN}>`
}

export async function sendSupportReplyEmail(
  to: string,
  conversationId: number,
  subject: string,
  body: string,
  agentName?: string,
) {
  const paragraphsHtml = body
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#28384a;">${p
          .split("\n")
          .map((line) => line.trim())
          .join("<br />")}</p>`,
    )
    .join("")

  const signOff = agentName ? `${agentName}, DistroSource Support` : "DistroSource Support"

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: conversationReplyTo(conversationId),
    subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
    html: `
      <div style="margin:0;padding:32px 12px;background:#eef4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0b1b31;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;border-collapse:separate;">
          <tr><td style="padding:0 0 18px;text-align:center;font-size:12px;letter-spacing:1.5px;color:#60758c;text-transform:uppercase;">Support conversation</td></tr>
          <tr><td style="background:#081426;border-radius:20px 20px 0 0;padding:26px 28px 22px;text-align:center;">
            <img src="${getLogoUrl()}" alt="DistroSource — templates, tools, and digital assets" width="320" style="display:block;width:320px;max-width:100%;height:auto;margin:0 auto;" />
          </td></tr>
          <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:34px 32px 30px;border:1px solid #dce6ee;border-top:0;">
            <p style="margin:0 0 4px;color:#168ba5;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Re: ${subject}</p>
            <h1 style="margin:0 0 20px;color:#0b1b31;font-size:22px;line-height:1.3;font-weight:750;letter-spacing:-.3px;">A reply from our support team</h1>
            ${paragraphsHtml}
            <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#28384a;">${signOff}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:26px;background:#f3f8fb;border:1px solid #e1edf2;border-radius:12px;">
              <tr><td style="padding:14px 16px;color:#52677c;font-size:12.5px;line-height:1.55;">
                Just reply to this email — your message goes straight back into this same support conversation.
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:22px 12px 0;text-align:center;color:#71859a;font-size:12px;line-height:1.7;">DistroSource.com<br /><a href="mailto:support@distrosource.com" style="color:#168ba5;text-decoration:none;">support@distrosource.com</a><br /><span style="font-size:11px;color:#91a1b0;">Digital products, delivered better.</span></td></tr>
        </table>
      </div>
    `,
    text: `Re: ${subject}\n\n${body}\n\n${signOff}\n\n---\nJust reply to this email — your message goes straight back into this same support conversation.\n\nDistroSource.com · support@distrosource.com`,
  })

  if (error) {
    console.error("[v0] Failed to send support reply email:", error)
    throw new Error("Could not send the reply. Please try again later.")
  }
  return data?.id ?? null
}

export async function sendReferralRewardEmail(to: string, couponCode: string, discountPercent: number) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You earned a referral reward on DistroSource",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Your referral paid off</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px;">
          A friend just completed their first order using your referral link. As a thank-you, here&apos;s a
          <strong>${discountPercent}% off</strong> coupon for your next order.
        </p>
        <p style="font-size: 18px; font-weight: 700; font-family: monospace; background: #f3f3f3; padding: 12px 16px; border-radius: 8px; margin: 0 0 16px;">${couponCode}</p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          Keep sharing your referral link from your DistroSource account to earn more rewards.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          DistroSource &middot; support@distrosource.com
        </p>
      </div>
    `,
    text: `A friend just completed their first order using your referral link. As a thank-you, here's a ${discountPercent}% off coupon: ${couponCode}\n\nKeep sharing your referral link to earn more rewards.\n\nDistroSource · support@distrosource.com`,
  })

  if (error) {
    console.error("[v0] Failed to send referral reward email:", error)
    return false
  }
  return true
}
