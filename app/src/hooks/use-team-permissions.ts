import { usePermissions, PermissionCheck } from './use-permissions'
import { TeamMemberPermissions } from '../types/team'
import { useEffect, useState } from 'react'
import { db } from '../db'
import { useAuth } from '../../context/AuthContext'

export function useTeamPermissions(teamId?: string) {
    const { user } = useAuth()
    const [teamPermissions, setTeamPermissions] = useState<TeamMemberPermissions | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get permissions from the main permissions hook
    const permissions = usePermissions(teamPermissions)

    useEffect(() => {
        if (!teamId || !user?.id) {
            setLoading(false)
            return
        }

        const fetchTeamPermissions = async () => {
            try {
                const permissions = await db.teams.getPermissions(user.id, teamId)

                setTeamPermissions(permissions || null)
            } catch (err) {
                console.error('Error fetching team permissions:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch team permissions')
            } finally {
                setLoading(false)
            }
        }

        fetchTeamPermissions()
    }, [teamId, user?.id])

    return {
        permissions,
        teamPermissions,
        loading,
        error,
        isTeamMember: teamPermissions !== null
    }
}

// Helper hook for checking specific permissions
export function usePermissionCheck(permission: keyof PermissionCheck, teamId?: string) {
    const { permissions, loading } = useTeamPermissions(teamId)

    return {
        hasPermission: permissions[permission],
        loading
    }
}

// Specific permission hooks for common use cases
export function useTransferPermission(teamId?: string) {
    return usePermissionCheck('canTransfer', teamId)
}

export function useDispersionPermission(teamId?: string) {
    return usePermissionCheck('canDisperse', teamId)
}

export function useTeamInvitePermission(teamId?: string) {
    return usePermissionCheck('canInviteMembers', teamId)
}

export function useTeamEditPermission(teamId?: string) {
    return usePermissionCheck('canEditTeam', teamId)
}