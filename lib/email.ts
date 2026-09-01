import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "RedeemCove <support@redeemcove.com>"

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { error } = await resend.emails.send({
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

  const { error } = await resend.emails.send({
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
