// app/dashboard/create-dynasty/page.tsx

import { CreateDynastyForm } from '@/components/dashboard/create-dynasty-form'
import PageContainer from '@/components/ui/page-container'

export default function CreateDynastyPage() {
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
