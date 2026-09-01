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
