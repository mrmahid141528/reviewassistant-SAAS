import { redirect } from "next/navigation"

export default function BillingRoot() {
    redirect("/dashboard/billing/subscription")
}
