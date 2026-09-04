import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap, MessageSquare, QrCode, CheckCircle2 } from "lucide-react";
import { getTrialDuration } from "@/app/superadmin/pricing/actions";

export default async function LandingPage() {
  const trialDuration = await getTrialDuration();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-x-hidden">




      <main className="relative z-10 pt-24 pb-16">

        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 lg:pt-32 pb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Zap className="h-4 w-4" /> Powered by Google Gemini AI
          </div>
          <h1 className="max-w-4xl mx-auto text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 mb-6 leading-tight">
            Turn Happy Customers Into <br className="hidden md:block" /> <span className="text-primary">5-Star Google Reviews</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Stop losing out on valuable online feedback. Our frictionless QR-code wizard crafts authentic, personalized reviews in seconds using AI—eliminating typing for your customers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full md:w-auto">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto rounded-xl px-8 h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                Start {trialDuration}-Day Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl px-8 h-14 text-base font-semibold bg-background border-border hover:bg-muted/50 transition-all">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex items-center -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 123}`} alt="User avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </span>
              Trusted by 100+ local businesses
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 md:px-6 py-24 border-t border-border/50">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">A Zero-Friction Feedback Engine</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We removed every hurdle between your customer and a published 5-star review.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Scan & Tap UX",
                desc: "Customers simply scan a QR code at checkout. No downloads, no sign-ups required. Instantly launches the review wizard."
              },
              {
                icon: MessageSquare,
                title: "Multiple-Choice Buttons",
                desc: "Typing is hard work. We replace text boxes with engaging interactive tags (e.g., 'Great Food', 'Fast Service') for 1-tap feedback."
              },
              {
                icon: Zap,
                title: "Instant AI Generation",
                desc: "Google Gemini AI connects their multi-choice clicks into a beautifully written, authentic paragraph in milliseconds."
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className={`flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-8 duration-700`} style={{ animationDelay: `${(i + 1) * 200}ms` }}>
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Steps */}
        <section className="container mx-auto px-4 md:px-6 py-12">
          <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-white/10 rotate-12 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Stop Begging For Reviews.</h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mb-10 relative z-10 leading-relaxed">
              Join the businesses dominating local SEO by automating their Google My Business reputation through artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center relative z-10">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full h-14 px-8 text-base font-semibold bg-background text-foreground hover:bg-background/90 shadow-xl">
                  Get Started for Free
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm font-medium text-primary-foreground/70 relative z-10">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No Credit Card Required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Cancel Anytime</span>
            </div>
          </div>
        </section>

      </main>


    </div >
  );
}
