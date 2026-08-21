import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from './actions'
import { Store } from 'lucide-react'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 h-screen mx-auto">
            <div className="flex flex-col items-center justify-center mb-8 gap-2">
                <Store className="h-12 w-12 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-center">
                    Review Assistant SaaS
                </h1>
                <p className="text-muted-foreground text-sm text-center">
                    Sign in or create an account to manage your business.
                </p>
            </div>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-muted/50 text-foreground text-center">
                        {searchParams.message}
                    </p>
                )}

                <Label className="text-md mt-4" htmlFor="email">
                    Email
                </Label>
                <Input
                    className="mb-4"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
                <Label className="text-md" htmlFor="password">
                    Password
                </Label>
                <Input
                    className="mb-4"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <div className="mt-6 flex flex-col gap-3">
                    <Button formAction={login} type="submit">
                        Sign In
                    </Button>
                    <Button formAction={signup} type="submit" variant="outline">
                        Sign Up
                    </Button>
                </div>
            </form>
        </div>
    )
}
