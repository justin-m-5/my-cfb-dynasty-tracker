// app/fonts.ts

import { Roboto, Roboto_Mono } from 'next/font/google'

export const robotoSans = Roboto({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto-sans',
})

export const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto-mono',
})
