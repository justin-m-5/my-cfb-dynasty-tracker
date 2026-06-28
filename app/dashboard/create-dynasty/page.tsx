// app/dashboard/create-dynasty/page.tsx

import { CreateDynastyForm } from '@/components/forms/create-dynasty-form'
import PageContainer from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'

export default function CreateDynastyPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Create Dynasty"
                description="Choose a conference, pick a team, and start your dynasty."
            />

            <CreateDynastyForm />
        </PageContainer>
    )
}
