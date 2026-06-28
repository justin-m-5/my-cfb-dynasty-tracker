// app/dashboard/profile/page.tsx

import PageContainer from '@/components/layout/page-container'
import { EditProfileForm } from '@/components/forms/edit-profile-form'
import { PageHeader } from '@/components/layout/page-header'

export default function ProfilePage() {
    return (
        <PageContainer>
            <PageHeader
                title="Edit Profile"
                description="Update your display name or avatar."
            />

            <EditProfileForm />
        </PageContainer>
    )
}
