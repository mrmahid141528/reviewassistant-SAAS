import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { getBrandSettings } from "@/lib/brand";

export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const brandSettings = await getBrandSettings();
    return (
        <div className="flex flex-col min-h-screen">
            <Header brandSettings={brandSettings} />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
}
