import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactUsPage() {
    return (
        <div className="flex flex-col min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-6 mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Get in Touch</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have a question, need enterprise billing support, or want a custom integration? We're here to help.
                </p>
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* Visual Callout */}
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Email Support</h3>
                                <p className="text-muted-foreground text-sm mb-2">Our team usually responds within 2 hours.</p>
                                <a href="mailto:support@reviewassistant.com" className="text-primary font-medium hover:underline">
                                    support@reviewassistant.com
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Phone Line</h3>
                                <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 9am to 6pm (EST).</p>
                                <a href="tel:+15550000000" className="text-primary font-medium hover:underline">
                                    +1 (555) 000-0000
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Headquarters</h3>
                                <p className="text-muted-foreground text-sm">
                                    123 Tech Avenue, Suite 400<br />
                                    New York, NY 10001
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder Form */}
                    <div className="bg-card border rounded-2xl shadow-sm p-8">
                        <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea className="w-full px-3 py-2 border rounded-lg bg-background min-h-[120px]" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="button" className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
