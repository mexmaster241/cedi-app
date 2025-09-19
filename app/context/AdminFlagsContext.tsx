'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react'
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
    fetchFlags: () => Promise<AdminFlags>
}

const AdminFlagsContext = createContext<AdminFlagsContextType | undefined>(undefined)

export function AdminFlagsProvider({ children }: { children: ReactNode }) {
    const [flags, setFlags] = useState<AdminFlags>({
        maintenanceMode: false,
        transactions_enabled: true, // Default to enabled until we fetch from DB
        user_registration: true, // Default to enabled until we fetch from DB
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasFetched, setHasFetched] = useState(false)
    const isLoadingRef = useRef(false)

    const fetchFlags = useCallback(async (): Promise<AdminFlags> => {
        // Reset loading ref to allow fresh fetches
        isLoadingRef.current = false

        // Allow fetching if not currently loading
        if (isLoadingRef.current) {
            // Return current flags if already loading
            return flags
        }

        try {
            isLoadingRef.current = true
            setLoading(true)
            setError(null)

            // Fetch settings from database
            const settings = await db.settings.getSettings()

            // Convert settings array to flags object
            const flagsData: AdminFlags = {
                maintenanceMode: false,
                transactions_enabled: false,
                user_registration: false,
            }

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

            setFlags(flagsData)
            setHasFetched(true)
            return flagsData
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch flags')
            console.error('Error fetching admin flags:', err)
            // Return safe defaults if there's an error
            const defaultFlags = {
                maintenanceMode: false,
                transactions_enabled: true,
                user_registration: true,
            }
            setFlags(defaultFlags)
            return defaultFlags
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }, [flags])

    return (
        <AdminFlagsContext.Provider value={{ flags, loading, error, fetchFlags }}>
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