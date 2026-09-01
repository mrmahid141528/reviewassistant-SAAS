'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitSignup, continueWithGoogle } from '../actions'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { AlertCircle, Loader2, CheckCircle2, MailOpen } from 'lucide-react'

export default function SignupPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const plan = params.get('plan');
        if (plan) {
            localStorage.setItem('intendedPlanId', plan);
        }
    }, [])

    async function handleSignup(formData: FormData) {
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await submitSignup(formData)
            if (res?.error) {
                setError(res.error)
            } else if (res?.success) {
                setSuccess(true)
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-xl mx-auto flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Account created!</h2>
                <p className="text-muted-foreground mb-8 max-w-[280px]">
                    We've sent a verification link to your email address. Please verify your email before continuing.
                </p>
                <Link href="/" className="w-full">
                    <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11">
                        <MailOpen className="mr-2 h-4 w-4" />
                        Open Email
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-xl mx-auto flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Create your account</h2>
                <p className="text-muted-foreground text-sm">Start collecting better customer reviews today.</p>
            </div>

            <form action={continueWithGoogle}>
                <Button
                    variant="outline"
                    className="w-full bg-card border-border text-foreground hover:bg-muted hover:text-foreground"
                    type="submit"
                >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or sign up with email</span>
                </div>
            </div>

            <form action={handleSignup} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-destructive text-sm mb-4">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Full name</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="off"
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="off"
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <PasswordStrength password={password} />
                </div>

                <div className="space-y-2 pt-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm password</Label>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={password && confirmPassword && password !== confirmPassword ? 'border-destructive ring-destructive' : ''}
                    />
                </div>

                <div className="flex items-start gap-3 mt-4 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        required
                        className="w-4 h-4 mt-0.5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background accent-primary"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground">
                        I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 h-11"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Create Account →'
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium font-semibold">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
