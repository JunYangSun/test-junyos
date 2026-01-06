'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'
import { themes } from '@/config/themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeName, mode } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Only apply theme colors if not using the default 'slate' theme
    if (themeName !== 'slate') {
      const themeColors = themes[themeName][mode]

      // Apply theme colors
      root.style.setProperty('--primary', themeColors.primary)
      root.style.setProperty('--primary-foreground', themeColors.primaryForeground)
      root.style.setProperty('--secondary', themeColors.secondary)
      root.style.setProperty('--secondary-foreground', themeColors.secondaryForeground)
      root.style.setProperty('--accent', themeColors.accent)
      root.style.setProperty('--accent-foreground', themeColors.accentForeground)
      root.style.setProperty('--ring', themeColors.ring)
      root.style.setProperty('--chart-1', themeColors.chart1)
      root.style.setProperty('--chart-2', themeColors.chart2)
      root.style.setProperty('--chart-3', themeColors.chart3)
      root.style.setProperty('--chart-4', themeColors.chart4)
      root.style.setProperty('--chart-5', themeColors.chart5)
    } else {
      // Remove inline styles to use CSS defaults
      root.style.removeProperty('--primary')
      root.style.removeProperty('--primary-foreground')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--secondary-foreground')
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-foreground')
      root.style.removeProperty('--ring')
      root.style.removeProperty('--chart-1')
      root.style.removeProperty('--chart-2')
      root.style.removeProperty('--chart-3')
      root.style.removeProperty('--chart-4')
      root.style.removeProperty('--chart-5')
    }

    // Update dark mode class
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [themeName, mode])

  return <>{children}</>
}
