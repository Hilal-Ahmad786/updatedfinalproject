// apps/admin/lib/settings-store.ts
// Fixed TypeScript errors for deployment

export interface SettingsData {
    general: {
      siteName: string
      siteDescription: string
      siteUrl: string
      adminEmail: string
      timezone: string
      language: string
    }
    appearance: {
      theme: 'light' | 'dark' | 'system'
      primaryColor: string
      logo: string
      favicon: string
    }
    security: {
      twoFactorEnabled: boolean
      passwordExpiry: number
      maxLoginAttempts: number
      sessionTimeout: number
    }
    notifications: {
      emailNotifications: boolean
      pushNotifications: boolean
      commentNotifications: boolean
      systemAlerts: boolean
    }
    backup: {
      autoBackup: boolean
      backupFrequency: 'daily' | 'weekly' | 'monthly'
      retentionDays: number
      cloudBackup: boolean
    }
  }
  
  // Storage key
  const SETTINGS_KEY = 'blog_settings'
  
  // Default settings
  const defaultSettings: SettingsData = {
    general: {
      siteName: '100lesme Blog',
      siteDescription: 'A modern blog admin system built with Next.js',
      siteUrl: 'https://100lesme-blog.com',
      adminEmail: 'admin@100lesme-blog.com',
      timezone: 'UTC',
      language: 'en'
    },
    appearance: {
      theme: 'system',
      primaryColor: '#3b82f6',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    security: {
      twoFactorEnabled: false,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      sessionTimeout: 30
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      commentNotifications: true,
      systemAlerts: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      cloudBackup: false
    }
  }
  
  // In-memory storage - never null, always initialized
  let settings: SettingsData = { ...defaultSettings }
  
  // Load from localStorage
  function loadSettings(): SettingsData {
    if (typeof window === 'undefined') {
      return { ...defaultSettings }
    }
  
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to ensure all properties exist
        settings = {
          general: { ...defaultSettings.general, ...parsed.general },
          appearance: { ...defaultSettings.appearance, ...parsed.appearance },
          security: { ...defaultSettings.security, ...parsed.security },
          notifications: { ...defaultSettings.notifications, ...parsed.notifications },
          backup: { ...defaultSettings.backup, ...parsed.backup }
        }
      } else {
        settings = { ...defaultSettings }
        saveSettings()
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      settings = { ...defaultSettings }
      saveSettings()
    }
  
    return settings
  }
  
  // Save to localStorage
  function saveSettings(): void {
    if (typeof window === 'undefined') return
  
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }
  
  // Initialize on import
  if (typeof window !== 'undefined') {
    loadSettings()
  } else {
    settings = { ...defaultSettings }
  }
  
  // Settings store API
  export const settingsStore = {
    // Get all settings - always returns valid SettingsData
    getAll: (): SettingsData => {
      // Ensure settings is never null
      if (!settings || typeof settings !== 'object') {
        settings = loadSettings()
      }
      return settings
    },
  
    // Get specific section
    getSection: <T extends keyof SettingsData>(section: T): SettingsData[T] => {
      const allSettings = settingsStore.getAll()
      return allSettings[section]
    },
  
    // Update entire settings
    updateAll: (newSettings: SettingsData): SettingsData => {
      settings = { ...newSettings }
      saveSettings()
      return settings
    },
  
    // Update specific section
    updateSection: <T extends keyof SettingsData>(
      section: T, 
      updates: Partial<SettingsData[T]>
    ): SettingsData => {
      // Ensure settings is initialized
      const currentSettings = settingsStore.getAll()
  
      settings = {
        ...currentSettings,
        [section]: {
          ...currentSettings[section],
          ...updates
        }
      }
  
      saveSettings()
      return settings
    },
  
    // Update single setting
    updateSetting: <T extends keyof SettingsData>(
      section: T,
      key: keyof SettingsData[T],
      value: any
    ): SettingsData => {
      // Ensure settings is initialized
      const currentSettings = settingsStore.getAll()
  
      settings = {
        ...currentSettings,
        [section]: {
          ...currentSettings[section],
          [key]: value
        }
      }
  
      saveSettings()
      return settings
    },
  
    // Reset to defaults
    reset: (): SettingsData => {
      settings = { ...defaultSettings }
      saveSettings()
      return settings
    },
  
    // Reset specific section
    resetSection: <T extends keyof SettingsData>(section: T): SettingsData => {
      const currentSettings = settingsStore.getAll()
  
      settings = {
        ...currentSettings,
        [section]: { ...defaultSettings[section] }
      }
  
      saveSettings()
      return settings
    }
  }