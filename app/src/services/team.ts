export interface TeamMember {
    id: string
    team_id: string
    user_id: string
    role: string
    status: string
    team: {
        id: string
        name: string
    }
}

export interface Team {
    id: string
    name: string
    members: Array<{
        id: string
        email: string
        team_role: string
        account_status: string
        status: string
    }>
}

export type TeamMemberPermissions = {
    can_transfer: boolean
    can_disperse: boolean
    can_see_movements: boolean
    can_invite_members: boolean
    can_edit_team: boolean
    can_delete_team: boolean
    can_create_pending_movements: boolean
    can_approve_pending_movements: boolean
    can_create_pending_dispersions: boolean
    can_approve_pending_dispersions: boolean
    can_create_scheduled_dispersions: boolean
    can_activate_scheduled_dispersions: boolean
}

export const ownerPermissions: TeamMemberPermissions = {
    can_transfer: true,
    can_disperse: true,
    can_see_movements: true,
    can_invite_members: true,
    can_edit_team: true,
    can_delete_team: true,
    can_create_pending_movements: true,
    can_approve_pending_movements: true,
    can_create_pending_dispersions: true,
    can_approve_pending_dispersions: true,
    can_create_scheduled_dispersions: true,
    can_activate_scheduled_dispersions: true
}

export const adminPermissions: TeamMemberPermissions = {
    can_transfer: true,
    can_disperse: true,
    can_see_movements: true,
    can_invite_members: true,
    can_edit_team: false,
    can_delete_team: false,
    can_create_pending_movements: false,
    can_approve_pending_movements: true,
    can_create_pending_dispersions: false,
    can_approve_pending_dispersions: true,
    can_create_scheduled_dispersions: true,
    can_activate_scheduled_dispersions: true
}

export const memberPermissions: TeamMemberPermissions = {
    can_transfer: false,
    can_disperse: false,
    can_see_movements: true,
    can_invite_members: false,
    can_edit_team: false,
    can_delete_team: false,
    can_create_pending_movements: true,
    can_approve_pending_movements: false,
    can_create_pending_dispersions: true,
    can_approve_pending_dispersions: false,
    can_create_scheduled_dispersions: true,
    can_activate_scheduled_dispersions: false
}

export const teamPermissions = {
    "OWNER": ownerPermissions,
    "ADMIN": adminPermissions,
    "MEMBER": memberPermissions,
}

export interface DatabaseTeamMember {
    id: string
    user_id: string
    role: string
    status: string
    user: {
        id: string
        email: string
        balance?: number
        account_status: string
        inbound_limit_monthly?: number
        given_name?: string
        family_name?: string
    }
}

export interface TransformedTeamMember {
    id: string
    email: string
    given_name?: string
    family_name?: string
    team_role: string
    account_status: string
    status: string
}

export interface TransformedTeam {
    id: string
    name: string
    metadata?: {
        description?: string
    }
    members: TransformedTeamMember[]
}

export interface TeamStats {
    totalBalance: number;
    transactionLimit: number;
    recentTransactions: any[];
}

export interface UserStats {
    balance: number;
    transactionLimit: number;
    recentTransactions: any[];
}