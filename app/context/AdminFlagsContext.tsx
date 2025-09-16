'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { db } from '../src/db'

interface AdminFlags {
    maintenanceMode: boolean
    transactions_enabled: boolean
    user_registration: boolean
}

interface AdminFlagsContextType {
    flags: AdminFlags
    loading: boolean
    error: string | null
    refreshFlags: () => Promise<void>
}

const AdminFlagsContext = createContext<AdminFlagsContextType | undefined>(undefined)

export function AdminFlagsProvider({ children }: { children: ReactNode }) {
    const [flags, setFlags] = useState<AdminFlags>({
        maintenanceMode: false,
        transactions_enabled: false,
        user_registration: false,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchFlags = async () => {
        try {
            setLoading(true)
            // Fetch all settings and convert to flags object
            const settings = await db.settings.getSettings()

            // Convert settings array to flags object
            const flagsData: AdminFlags = {
                maintenanceMode: false,
                transactions_enabled: false,
                user_registration: false,
            }

            // Store the current state for comparison
            const oldFlags = { ...flags }

            settings?.forEach((setting: { setting: string, status: string }) => {
                switch (setting.setting) {
                    case 'maintenance_mode':
                        flagsData.maintenanceMode = setting.status === 'enabled'
                        break
                    case 'transactions_enabled':
                        flagsData.transactions_enabled = setting.status === 'enabled'
                        break
                    case 'user_registration':
                        flagsData.user_registration = setting.status === 'enabled'
                        break
                }
            })

            // Check if flags actually changed
            if (JSON.stringify(oldFlags) !== JSON.stringify(flagsData)) {
                // Force a re-render by creating a new object
                setFlags({ ...flagsData })
                // Store the update in localStorage to prevent duplicate processing
                localStorage.setItem('lastSettingsUpdate', JSON.stringify({
                    type: 'UPDATE',
                    table: 'settings',
                    schema: 'public',
                    record: flagsData
                }))
            }
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch flags')
            console.error('Error fetching admin flags:', err)
        } finally {
            setLoading(false)
        }
    }

    const refreshFlags = async () => {
        await fetchFlags()
    }

    useEffect(() => {
        // Initial fetch
        const loadFlags = async () => {
            setLoading(true)
            try {
                await fetchFlags()
            } catch (err) {
                console.error('Error loading initial flags:', err)
            } finally {
                setLoading(false)
            }
        }

        loadFlags()

        // Generate a unique channel name for this tab
        const channelName = `settings_changes_${Math.random().toString(36).slice(2, 11)}`

        // Set up real-time subscription
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'settings'
                },
                async (payload) => {
                    // Check if this is our own update
                    const lastUpdate = localStorage.getItem('lastSettingsUpdate')
                    if (lastUpdate === JSON.stringify(payload)) {
                        localStorage.removeItem('lastSettingsUpdate')
                        return
                    }

                    console.log('Settings updated:', payload)
                    // Refresh flags when settings change
                    window.location.reload()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'settings'
                },
                async (payload) => {
                    // Check if this is our own insert
                    const lastUpdate = localStorage.getItem('lastSettingsUpdate')
                    if (lastUpdate === JSON.stringify(payload)) {
                        localStorage.removeItem('lastSettingsUpdate')
                        return
                    }

                    console.log('Settings inserted:', payload)
                    await fetchFlags()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to settings changes on channel:', channelName)
                } else {
                    console.error('Failed to subscribe to settings changes:', status)
                }
            })

        // Also set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                // Reload flags when user logs in
                loadFlags()
            }
        })

        return () => {
            subscription.unsubscribe()
            supabase.removeChannel(channel)
        }
    }, [router])

    return (
        <AdminFlagsContext.Provider value={{ flags, loading, error, refreshFlags }}>
            {children}
        </AdminFlagsContext.Provider>
    )
}

export function useAdminFlags() {
    const context = useContext(AdminFlagsContext)
    if (context === undefined) {
        throw new Error('useAdminFlags must be used within an AdminFlagsProvider')
    }
    return context
}