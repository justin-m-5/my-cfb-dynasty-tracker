// app/page.tsx

import { SignInForm } from '@/components/forms/sign-in-form'

export default function HomePage() {
    return (
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <SignInForm />
            </div>
        </div>
    )
}
