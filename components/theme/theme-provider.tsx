// components/theme/theme-provider.tsx

'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setTheme: () => {},
})

export function useTheme() {
    return useContext(ThemeContext)
}

function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === 'system') {
        root.removeAttribute('data-theme')
    } else {
        root.setAttribute('data-theme', theme)
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system'
        const stored = localStorage.getItem('theme') as Theme | null
        return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system'
    })

    // Apply theme on mount and when it changes
    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    }, [])

    return (
        <ThemeContext value={{ theme, setTheme }}>
            {children}
        </ThemeContext>
    )
}
