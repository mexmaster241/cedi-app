
import { useAdminFlags } from '@/app/context/AdminFlagsContext'
import { TeamMemberPermissions } from '../services/team'


export interface PermissionCheck {
    canTransfer: boolean
    canDisperse: boolean
    canSeeMovements: boolean
    canInviteMembers: boolean
    canEditTeam: boolean
    canDeleteTeam: boolean
    canCreatePendingMovements: boolean
    canApprovePendingMovements: boolean
    canCreatePendingDispersions: boolean
    canApprovePendingDispersions: boolean
    canCreateScheduledDispersions: boolean
    canActivateScheduledDispersions: boolean
}

export function usePermissions(teamPermissions: TeamMemberPermissions | null): PermissionCheck {
    const { flags, loading } = useAdminFlags()

    // If admin flags are loading, deny all permissions
    if (loading) {
        return {
            canTransfer: false,
            canDisperse: false,
            canSeeMovements: false,
            canInviteMembers: false,
            canEditTeam: false,
            canDeleteTeam: false,
            canCreatePendingMovements: false,
            canApprovePendingMovements: false,
            canCreatePendingDispersions: false,
            canApprovePendingDispersions: false,
            canCreateScheduledDispersions: false,
            canActivateScheduledDispersions: false
        }
    }

    // Check admin-level restrictions first
    const adminRestrictions = {
        maintenanceMode: flags.maintenanceMode,
        transactionsDisabled: !flags.transactions_enabled,
        userRegistrationDisabled: !flags.user_registration
    }

    // If in maintenance mode, deny all permissions
    if (adminRestrictions.maintenanceMode) {
        return {
            canTransfer: false,
            canDisperse: false,
            canSeeMovements: false,
            canInviteMembers: false,
            canEditTeam: false,
            canDeleteTeam: false,
            canCreatePendingMovements: false,
            canApprovePendingMovements: false,
            canCreatePendingDispersions: false,
            canApprovePendingDispersions: false,
            canCreateScheduledDispersions: false,
            canActivateScheduledDispersions: false
        }
    }

    // If no team permissions provided, check only admin flags
    if (!teamPermissions) {
        return {
            canTransfer: !adminRestrictions.transactionsDisabled,
            canDisperse: !adminRestrictions.transactionsDisabled,
            canSeeMovements: true, // Always allow viewing unless in maintenance mode
            canInviteMembers: true, // Allow team invites by default
            canEditTeam: true, // Allow team edits by default
            canDeleteTeam: true, // Allow team deletion by default
            canCreatePendingMovements: !adminRestrictions.transactionsDisabled,
            canApprovePendingMovements: !adminRestrictions.transactionsDisabled,
            canCreatePendingDispersions: !adminRestrictions.transactionsDisabled,
            canApprovePendingDispersions: !adminRestrictions.transactionsDisabled,
            canCreateScheduledDispersions: !adminRestrictions.transactionsDisabled,
            canActivateScheduledDispersions: !adminRestrictions.transactionsDisabled
        }
    }

    // Combine admin flags with team permissions
    return {
        canTransfer: teamPermissions.can_transfer && !adminRestrictions.transactionsDisabled,
        canDisperse: teamPermissions.can_disperse && !adminRestrictions.transactionsDisabled,
        canSeeMovements: teamPermissions.can_see_movements,
        canInviteMembers: teamPermissions.can_invite_members,
        canEditTeam: teamPermissions.can_edit_team,
        canDeleteTeam: teamPermissions.can_delete_team,
        canCreatePendingMovements: teamPermissions.can_create_pending_movements && !adminRestrictions.transactionsDisabled,
        canApprovePendingMovements: teamPermissions.can_approve_pending_movements && !adminRestrictions.transactionsDisabled,
        canCreatePendingDispersions: teamPermissions.can_create_pending_dispersions && !adminRestrictions.transactionsDisabled,
        canApprovePendingDispersions: teamPermissions.can_approve_pending_dispersions && !adminRestrictions.transactionsDisabled,
        canCreateScheduledDispersions: teamPermissions.can_create_scheduled_dispersions && !adminRestrictions.transactionsDisabled,
        canActivateScheduledDispersions: teamPermissions.can_activate_scheduled_dispersions && !adminRestrictions.transactionsDisabled
    }
}

export function useMovementPermissions() {
    const { flags, loading } = useAdminFlags()

    const canPerformMovement = () => {
        if (loading) return false
        return !flags.maintenanceMode && flags.transactions_enabled
    }

    const getMovementBlockReason = () => {
        if (flags.maintenanceMode) {
            return 'El sistema está en mantenimiento. Por favor, inténtalo de nuevo más tarde.'
        }
        if (!flags.transactions_enabled) {
            return 'Las transacciones están deshabilitadas por el momento.'
        }
        return null
    }

    return {
        canPerformMovement: canPerformMovement(),
        isMaintenanceMode: flags.maintenanceMode,
        areTransactionsDisabled: !flags.transactions_enabled,
        loading,
        getMovementBlockReason
    }
}