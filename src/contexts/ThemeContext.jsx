import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false)

  // Check for saved theme preference or default to system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    } else {
      setDarkMode(prefersDark)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.body.classList.remove('dark-mode')
    }
    
    // Save preference
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  const value = {
    darkMode,
    toggleTheme,
    theme: darkMode ? 'dark' : 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
