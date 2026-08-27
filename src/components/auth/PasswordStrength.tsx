'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const hasLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    const strength = [hasLength, hasUppercase, hasNumber].filter(Boolean).length

    const getStrengthText = () => {
        if (password.length === 0) return 'Password strength'
        if (strength === 0) return 'Weak'
        if (strength === 1) return 'Weak'
        if (strength === 2) return 'Good'
        return 'Strong'
    }

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-muted'
        if (strength === 1) return 'bg-red-500'
        if (strength === 2) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    return (
        <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{getStrengthText()}</span>
                {password.length > 0 && <span>{strength}/3</span>}
            </div>

            <div className="flex gap-1 h-1.5 w-full">
                <div className={cn("flex-1 rounded-full transition-all duration-300", password.length > 0 ? getStrengthColor() : "bg-muted")} />
                <div className={cn("flex-1 rounded-full transition-all duration-300", strength >= 2 ? getStrengthColor() : "bg-muted")} />
                <div className={cn("flex-1 rounded-full transition-all duration-300", strength >= 3 ? getStrengthColor() : "bg-muted")} />
                <div className={cn("flex-1 rounded-full transition-all duration-300", "bg-muted hidden")} />
            </div>

            {password.length > 0 && (
                <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className={cn("flex items-center gap-2", hasLength && "text-green-500")}>
                        <Check className="w-3.5 h-3.5" />
                        <span>At least 8 characters</span>
                    </div>
                    <div className={cn("flex items-center gap-2", hasUppercase && "text-green-500")}>
                        <Check className="w-3.5 h-3.5" />
                        <span>One uppercase letter</span>
                    </div>
                    <div className={cn("flex items-center gap-2", hasNumber && "text-green-500")}>
                        <Check className="w-3.5 h-3.5" />
                        <span>One number</span>
                    </div>
                </div>
            )}
        </div>
    )
}
