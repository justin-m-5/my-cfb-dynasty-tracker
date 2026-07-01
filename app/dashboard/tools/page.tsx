// app/dashboard/tools/page.tsx

import { Tools } from '@/components/dynasty/sections/tools'
import PageContainer from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

export default function ToolsPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Dynasty Tools"
                description="Access various tools to manage your dynasty."
            />

            <Tools />
        </PageContainer>
    )
}
