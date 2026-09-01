import { OnboardingClient } from "./OnboardingClient"
import { getBrandSettings } from "@/lib/brand"
import { completeOnboarding } from "./actions"

export default async function OnboardingPage() {
    const brandSettings = await getBrandSettings()

    return <OnboardingClient brandSettings={brandSettings} />
}
