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
    const [theme, setThemeState] = useState<Theme>('system')

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setThemeState(stored)
            applyTheme(stored)
        }
    }, [])

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
