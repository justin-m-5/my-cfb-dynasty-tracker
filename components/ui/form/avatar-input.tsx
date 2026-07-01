// components/ui/avatar-input.tsx

import Image from "next/image"
import React from "react"

interface AvatarInputProps {
    /** The URL of the image preview to display */
    previewUrl: string | null
    /** Callback fired when a file is selected */
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    /** Optional fallback image if no preview is available */
    fallbackImage?: string
    /** Unique ID for the input (useful if you have multiple on a page) */
    id?: string
}

export function AvatarInput({
    previewUrl,
    onChange,
    fallbackImage = "/images/default_avatar.jpg",
    id = "avatar-dropzone"
}: AvatarInputProps) {
    return (
        <div className="flex flex-col gap-3">
            <label
                htmlFor={id}
                className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-muted-foreground/50 transition-colors hover:border-muted-foreground"
            >
                <Image
                    src={previewUrl || fallbackImage}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                    unoptimized
                />

                {/* Dark overlay that appears on hover to indicate it's clickable */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Change
                </div>
            </label>

            {/* Hidden actual file input */}
            <input
                id={id}
                type="file"
                accept="image/*"
                onChange={onChange}
                className="hidden"
            />
        </div>
    )
}