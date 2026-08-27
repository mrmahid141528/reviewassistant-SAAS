'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Star, ChevronLeft, Building2, MapPin, Search, Wand2, QrCode, Download, Link as LinkIcon, CheckCircle2 } from 'lucide-react'
import { completeOnboarding } from './actions'
import { QRCodeSVG } from 'qrcode.react'

type WizardData = {
    businessName: string
    category: string
    phone: string
    website: string
    address: string
    city: string
    state: string
    country: string
    logo: File | null
    googleReviewLink: string
    aiLanguage: string
    aiTone: string
    aiLength: string
    generatedSlug?: string
}

export default function OnboardingWizard() {
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<WizardData>({
        businessName: '',
        category: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        logo: null,
        googleReviewLink: '',
        aiLanguage: 'English',
        aiTone: 'Natural',
        aiLength: 'Medium'
    })

    const totalSteps = 5
    const progress = Math.round((step / totalSteps) * 100)

    const updateData = (fields: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...fields }))
    }

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        setError(null)
        try {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    // Ignore file for now if not implementing upload immediately
                    if (key !== 'logo') formData.append(key, value as string)
                }
            })

            const result = await completeOnboarding(formData)

            if (result?.error) {
                setError(result.error)
                setIsSubmitting(false)
            } else {
                updateData({ generatedSlug: result.slug })
                nextStep() // Go to Step 5 (QR / Success)
                setIsSubmitting(false)
            }
        } catch (e) {
            setError("Failed to set up business. Please try again.")
            setIsSubmitting(false)
        }
    }

    // -- Step Rendering Methods --

    const renderStep1 = () => (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to Smart Review Assistant 👋</h1>
            <p className="text-muted-foreground mb-10 max-w-md">
                Let's set up your business in a few quick steps. We'll have your AI review generation running in no time.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 bg-muted px-4 py-2 rounded-full border border-border">
                <span>Progress: 1 of {totalSteps}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>Estimated time: 2-3 minutes</span>
            </div>
            <Button onClick={nextStep} className="w-full sm:w-auto px-8 h-12 text-lg">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    )

    const renderStep2 = () => {
        const canContinue = data.businessName.trim() !== '' && data.category.trim() !== ''

        return (
            <div className="animate-in slide-in-from-right-8 duration-500 w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                    <p className="text-muted-foreground">These details help us customize the experience.</p>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="businessName"
                                value={data.businessName}
                                onChange={(e) => updateData({ businessName: e.target.value })}
                                placeholder="E.g., The Cozy Cafe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Business Category <span className="text-red-500">*</span></Label>
                            <select
                                id="category"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.category}
                                onChange={(e) => updateData({ category: e.target.value })}
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="Restaurant">Restaurant</option>
                                <option value="Hotel">Hotel</option>
                                <option value="Salon">Salon</option>
                                <option value="Clinic">Clinic</option>
                                <option value="Coaching Center">Coaching Center</option>
                                <option value="Retail Store">Retail Store</option>
                                <option value="Internet Cafe">Internet Cafe</option>
                                <option value="Service Business">Service Business</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Business Phone</Label>
                            <Input id="phone" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input id="website" value={data.website} onChange={(e) => updateData({ website: e.target.value })} placeholder="https://example.com" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <h3 className="text-sm font-medium mb-4 flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary" /> Location Details</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" value={data.address} onChange={(e) => updateData({ address: e.target.value })} placeholder="123 Main St" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={data.city} onChange={(e) => updateData({ city: e.target.value })} placeholder="City" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={data.state} onChange={(e) => updateData({ state: e.target.value })} placeholder="State" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" value={data.country} onChange={(e) => updateData({ country: e.target.value })} placeholder="Country" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10">
                    <Button variant="outline" onClick={nextStep}>Skip for now</Button>
                    <Button onClick={nextStep} disabled={!canContinue}>Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
            </div>
        )
    }

    const renderStep3 = () => (
        <div className="animate-in slide-in-from-right-8 duration-500 w-full">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-2xl font-bold">Connect Google Reviews</h2>
                </div>
                <p className="text-muted-foreground">Where should customers leave their review? This is the core of your campaign.</p>
            </div>

            <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-6 space-y-6">
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Paste your Google review link</Label>
                    <div className="flex gap-2">
                        <Input
                            value={data.googleReviewLink}
                            onChange={(e) => updateData({ googleReviewLink: e.target.value })}
                            placeholder="https://g.page/r/.../review"
                            className="font-mono text-sm"
                        />
                        <Button variant="secondary">Validate</Button>
                    </div>
                    <a href="#" className="text-sm text-primary hover:underline inline-flex items-center mt-1">
                        <Search className="w-3 h-3 mr-1" /> How to find my Google Review Link?
                    </a>
                </div>

                {data.googleReviewLink && (
                    <div className="p-4 bg-muted rounded-lg border border-border animate-in fade-in duration-300">
                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">Preview Link Routing to</p>
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center p-2 shadow-sm">
                                {/* Google "G" SVG Placeholder */}
                                <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            </div>
                            <div>
                                <h4 className="font-semibold">{data.businessName || 'Your Business'}</h4>
                                <div className="flex items-center text-sm">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                                    <span className="font-medium mr-1">4.X</span>
                                    <span className="text-muted-foreground">(Routing simulated)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-medium tracking-wide">Or connect directly</span></div>
            </div>

            <Button variant="outline" className="w-full h-12 border-dashed border-2 shadow-sm font-medium">
                Connect Google Business Profile <span className="ml-2 text-xs text-muted-foreground font-normal">(Coming Soon)</span>
            </Button>

            <div className="flex justify-between mt-10">
                <Button variant="ghost" onClick={prevStep}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={nextStep}>Skip for now</Button>
                    <Button onClick={nextStep}>Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="animate-in slide-in-from-right-8 duration-500 w-full">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Wand2 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Customize your AI reviews</h2>
                </div>
                <p className="text-muted-foreground">The AI will produce human-sounding, unique reviews for each customer based on these settings.</p>
            </div>

            <div className="space-y-8">
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Preferred Language</Label>
                    <select
                        className="flex h-10 w-full sm:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={data.aiLanguage}
                        onChange={(e) => updateData({ aiLanguage: e.target.value })}
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Hinglish">Hinglish</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Odia">Odia</option>
                        <option value="Assamese">Assamese</option>
                        <option value="Urdu">Urdu</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold">Tone of Voice</Label>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {['Natural', 'Professional', 'Friendly'].map(tone => (
                            <div
                                key={tone}
                                onClick={() => updateData({ aiTone: tone })}
                                className={`border ${data.aiTone === tone ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-zinc-500'} cursor-pointer rounded-xl p-4 transition-all`}
                            >
                                <h4 className="font-semibold mb-1">{tone}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {tone === 'Natural' && 'Sounds like a real, authentic customer.'}
                                    {tone === 'Professional' && 'Polished, structured and business-focused.'}
                                    {tone === 'Friendly' && 'Warm, emotional and conversational.'}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-md text-xs">
                        <strong>Note:</strong> We explicitly instruct the AI to generate uniquely styled reviews full of human emotion for each customer, avoiding a repetitive format.
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-base font-semibold">Review Length</Label>
                    <div className="flex bg-muted p-1 rounded-lg w-fit">
                        {['Short', 'Medium', 'Detailed'].map(len => (
                            <button
                                key={len}
                                onClick={() => updateData({ aiLength: len })}
                                className={`px-4 py-2 text-sm rounded-md transition-all ${data.aiLength === len ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {len}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="flex justify-between mt-10">
                <Button variant="ghost" onClick={prevStep} disabled={isSubmitting}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleFinalSubmit} disabled={isSubmitting}>Skip & Finish</Button>
                    <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Finish Setup'} <CheckCircle2 className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )

    const renderStep5 = () => (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 pt-4">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <h1 className="text-4xl font-extrabold tracking-tight relative">Your business is ready! 🎉</h1>
                <p className="text-muted-foreground mt-4 relative">Your permanent QR code has been generated.</p>
            </div>

            <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-xl overflow-hidden mb-10">
                <div className="p-6 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-xl">{data.businessName || 'Your Business'}</h3>
                    <div className="flex items-center justify-center gap-1 mt-2 text-yellow-500 font-medium">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="text-foreground ml-1">4.8</span>
                    </div>
                </div>
                <div className="py-10 px-8 flex flex-col items-center justify-center bg-white">
                    {/* Authentic QR code visualization */}
                    <div className="relative p-2 bg-white rounded-xl shadow-sm border border-zinc-200">
                        {data.generatedSlug ? (
                            <QRCodeSVG
                                value={typeof window !== 'undefined' ? `${window.location.origin}/review/${data.generatedSlug}` : ''}
                                size={192}
                                level="H"
                                includeMargin={false}
                            />
                        ) : (
                            <QrCode className="w-48 h-48 text-zinc-900" strokeWidth={1} />
                        )}
                        <div className="absolute inset-0 border-4 border-dashed border-zinc-200 pointer-events-none rounded-xl" style={{ margin: '-1rem' }} />
                    </div>
                </div>
                <div className="p-4 bg-muted/50 text-xs text-muted-foreground">
                    This QR code is uniquely tied to your business and will not change even if you update your details later. Place it on your physical table boards!
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button variant="outline" className="flex-1 h-12 bg-background border-border">
                    <Download className="mr-2 w-4 h-4" /> Download QR
                </Button>
                <Button variant="outline" className="flex-1 h-12 bg-background border-border">
                    <LinkIcon className="mr-2 w-4 h-4" /> Copy Link
                </Button>
            </div>

            <Button className="w-full max-w-md h-12 mt-4 text-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push('/dashboard')}>
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    )

    return (
        <div className="w-full">
            {step > 1 && step < 5 && (
                <div className="mb-10 animate-in fade-in">
                    <div className="flex items-center justify-between text-sm font-medium mb-3 text-muted-foreground">
                        <span>Step {step - 1} of 3</span>
                        <span>{progress}% complete</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="bg-background sm:bg-card sm:border border-border sm:shadow-lg rounded-2xl sm:p-10 transition-all duration-300">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
        </div>
    )
}
