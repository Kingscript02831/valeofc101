
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const loadUserThemePreference = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', session.user.id)
          .single()

        if (profile?.theme_preference) {
          setTheme(profile.theme_preference as Theme)
        }
      }
    }

    loadUserThemePreference()
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      
      // Add compact-ui class for better organization
      root.classList.add("compact-ui")
    } else {
      root.classList.add(theme)
      
      // Add compact-ui class for better organization
      root.classList.add("compact-ui")
    }

    // Atualizar as cores do fundo e texto com base no tema
    if (theme === "light") {
      document.body.style.backgroundColor = "white"
      document.body.style.color = "black"
    } else {
      document.body.style.backgroundColor = "black"
      document.body.style.color = "white"
    }
  }, [theme])

  const value = {
    theme,
    setTheme: async (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', session.user.id)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
