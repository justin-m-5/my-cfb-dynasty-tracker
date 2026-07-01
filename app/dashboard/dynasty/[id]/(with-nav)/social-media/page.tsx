// app/dashboard/dynasty/[id]/(with-nav)/social-media/page.tsx

import { SocialMedia } from '@/components/dynasty/sections/social-media'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SocialMediaPage({ params }: PageProps) {
    const { id } = await params
    return <SocialMedia dynastyId={id} />
}
