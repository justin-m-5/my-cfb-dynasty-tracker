// app/dashboard/create/page.tsx

import { CreateDynastyForm } from '@/components/dashboard/create-dynasty-form'
import PageContainer from '@/components/ui/page-container'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/dal/features/auth/server'

export default async function CreateDynastyPage() {
    const { session } = await getServerAuthSession()

    if (!session) {
        redirect('/')
    }

    return (
        <PageContainer>
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-text">Create Dynasty</h1>
                <p className="text-sm text-text/80">
                    Choose a conference, pick a team, and start your dynasty.
                </p>
            </header>

            <CreateDynastyForm />
        </PageContainer>
    )
}
