// app/dashboard/profile/page.tsx

import PageContainer from '@/components/ui/page-container'
import { EditProfileForm } from '@/components/dashboard/edit-profile-form'

export default function ProfilePage() {
    return (
        <PageContainer>
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-text">Edit Profile</h1>
                <p className="text-sm text-text/80">
                    Update your display name or avatar.
                </p>
            </header>

            <EditProfileForm />
        </PageContainer>
    )
}
