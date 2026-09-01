import { Resend } from "resend"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured")
  return new Resend(apiKey)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "RedeemCove <support@redeemcove.com>"
const LOGO_URL = "https://redeemcove.com/images/logos/redeemcove-main-logo.png"

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your RedeemCove email",
    html: `
      <div style="background:#07111f;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f8fafc;">
        <div style="max-width:520px;margin:0 auto;background:#0d1b2f;border:1px solid #1e3a5f;border-radius:18px;padding:32px 28px;">
          <img src="${LOGO_URL}" alt="RedeemCove" style="display:block;width:260px;max-width:100%;height:auto;margin:0 auto 28px;" />
          <h1 style="font-size:24px;line-height:1.25;text-align:center;margin:0 0 14px;">Confirm your email</h1>
          <p style="font-size:15px;line-height:1.7;color:#b7c5d8;margin:0 0 26px;text-align:center;">Thanks for joining RedeemCove. Verify your email to secure your account and access your digital codes.</p>
          <div style="text-align:center;"><a href="${verificationUrl}" style="display:inline-block;background:#16c7e8;color:#06101d;font-weight:700;font-size:15px;text-decoration:none;padding:13px 24px;border-radius:10px;">Verify my email</a></div>
          <p style="font-size:12px;line-height:1.6;color:#8294aa;margin:26px 0 0;">If you didn&apos;t create a RedeemCove account, you can safely ignore this email.</p>
          <p style="font-size:12px;color:#8294aa;margin:18px 0 0;text-align:center;">RedeemCove.com · support@RedeemCove.com</p>
        </div>
      </div>
    `,
    text: `Confirm your RedeemCove email by visiting this link: ${verificationUrl}\n\nIf you did not create this account, you can safely ignore this email.\n\nRedeemCove.com`,
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
  denominationLabel: string
  quantity: number
  redemptionCode: string
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  items: OrderConfirmationItem[],
) {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #1a1a1a;">
            ${item.productName} — ${item.denominationLabel} ${item.quantity > 1 ? `x${item.quantity}` : ""}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; font-family: monospace; color: #4a4a4a; text-align: right;">
            ${item.redemptionCode}
          </td>
        </tr>`,
    )
    .join("")

  const itemsText = items
    .map((item) => `${item.productName} — ${item.denominationLabel} x${item.quantity}: ${item.redemptionCode}`)
    .join("\n")

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your RedeemCove order ${orderNumber} — codes inside`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Order confirmed</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 24px;">
          Order <strong>${orderNumber}</strong> — your codes are below. Keep this email for your records.
        </p>
        <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 24px 0 0;">
          Redeem each code at checkout or in the brand's app under Redeem Gift Card / Enter Code.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8a8a; margin: 16px 0 0;">
          RedeemCove &middot; Support@RedeemCove.com
        </p>
      </div>
    `,
    text: `Order ${orderNumber} confirmed. Your codes:\n\n${itemsText}\n\nRedeem each code at checkout or in the brand's app under Redeem Gift Card / Enter Code.`,
  })

  if (error) {
    console.error("[v0] Failed to send order confirmation email:", error)
    return false
  }
  return true
}
