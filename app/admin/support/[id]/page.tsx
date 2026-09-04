import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getSupportConversation } from "@/lib/actions/support-inbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupportConversationThread } from "@/components/admin/support-conversation-thread"

export const metadata = {
  title: "Conversation | DistroSource Admin",
  description: "Reply to a support conversation.",
}

export default async function AdminSupportConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/support")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { id } = await params
  const conversationId = Number(id)
  if (!Number.isInteger(conversationId) || conversationId <= 0) notFound()

  let conversation
  let messages
  try {
    const result = await getSupportConversation(conversationId)
    conversation = result.conversation
    messages = result.messages
  } catch {
    notFound()
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Support inbox</p>
          <h1 className="mt-2 truncate font-display text-2xl font-semibold tracking-tight text-foreground">{conversation.subject}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {conversation.customerName ? `${conversation.customerName} · ` : ""}
            {conversation.customerEmail}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={conversation.status === "closed" ? "secondary" : "default"}>{conversation.status}</Badge>
          <Button variant="outline" size="sm" render={<Link href="/admin/support" />} nativeButton={false}>
            Back to inbox
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportConversationThread conversationId={conversation.id} status={conversation.status} messages={messages} />
        </CardContent>
      </Card>
    </main>
  )
}
