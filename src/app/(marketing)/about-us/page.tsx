import { Star, Shield, Users } from "lucide-react";

export default function AboutUsPage() {
    return (
        <div className="flex flex-col min-h-screen pt-24 pb-20">
            {/* Hero */}
            <div className="container mx-auto px-4 md:px-6 mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Empowering Local Businesses</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    We believe excellent service deserves excellent recognition. Turn your happy customers into your most powerful marketing asset.
                </p>
            </div>

            {/* Content blocks */}
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-8 bg-card border rounded-2xl shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Star className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            To bridge the gap between offline real-world customer satisfaction and online digital reputation metrics.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-8 bg-card border rounded-2xl shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                            <Users className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Our Platform</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            An intelligent system that removes the friction of typing, using advanced AI models to craft authentic feedback.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-8 bg-card border rounded-2xl shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                            <Shield className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Our Guarantee</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Strict adherence to Google Workspace policies while safeguarding enterprise security data points globally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
