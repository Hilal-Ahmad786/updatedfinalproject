
// 2. apps/admin/app/api/settings/route.ts
// Settings API with CORS support

import { NextRequest, NextResponse } from 'next/server'
import { settingsStore } from '@/lib/settings-store'

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    let responseData: any

    if (section && ['general', 'appearance', 'security', 'notifications', 'backup'].includes(section)) {
      responseData = {
        [section]: settingsStore.getSection(section as any),
        success: true
      }
    } else {
      responseData = {
        settings: settingsStore.getAll(),
        success: true
      }
    }

    const response = NextResponse.json(responseData)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch settings', success: false },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, settings: newSettings, action } = body

    let updatedSettings: any

    if (action === 'reset') {
      if (section) {
        updatedSettings = settingsStore.resetSection(section)
      } else {
        updatedSettings = settingsStore.reset()
      }
    } else if (section && newSettings) {
      // Update specific section
      updatedSettings = settingsStore.updateSection(section, newSettings)
    } else if (newSettings) {
      // Update all settings
      updatedSettings = settingsStore.updateAll(newSettings)
    } else {
      const response = NextResponse.json(
        { error: 'Invalid request body', success: false },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      settings: updatedSettings,
      success: true,
      message: 'Settings updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to update settings:', error)
    const response = NextResponse.json(
      { error: 'Failed to update settings', success: false },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, section, key, value } = body

    let result: any

    switch (action) {
      case 'updateSetting':
        if (!section || !key || value === undefined) {
          const response = NextResponse.json(
            { error: 'Section, key, and value are required', success: false },
            { status: 400 }
          )
          return addCorsHeaders(response)
        }
        result = settingsStore.updateSetting(section, key, value)
        break

      case 'backup':
        // Create a backup of current settings
        const currentSettings = settingsStore.getAll()
        result = {
          backup: currentSettings,
          timestamp: new Date().toISOString(),
          message: 'Settings backup created successfully'
        }
        break

      case 'restore':
        if (!body.backup) {
          const response = NextResponse.json(
            { error: 'Backup data is required', success: false },
            { status: 400 }
          )
          return addCorsHeaders(response)
        }
        result = settingsStore.updateAll(body.backup)
        break

      default:
        const response = NextResponse.json(
          { error: 'Invalid action', success: false },
          { status: 400 }
        )
        return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      ...result,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Settings action failed:', error)
    const response = NextResponse.json(
      { error: 'Settings action failed', success: false },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}