// components/ui/modal.tsx

'use client'

import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return

        const originalOverflow = document.body.style.overflow
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen || typeof document === 'undefined') {
        return null
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <Card
                role="dialog"
                aria-modal="true"
                className={cn('my-auto w-full border-primary/10 bg-background shadow-2xl hover:shadow-2xl', maxWidth)}
            >
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-primary/10 px-4 py-3">
                    <CardTitle className="text-sm text-text sm:text-base">{title}</CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 text-text/60 hover:text-text"
                        aria-label="Close modal"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 pt-4">
                    {children}
                </CardContent>
            </Card>
        </div>,
        document.body
    )
}
