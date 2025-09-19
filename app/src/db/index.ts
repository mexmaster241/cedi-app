import { createClient } from '@supabase/supabase-js'
import { TeamMemberPermissions, teamPermissions } from '../types/team'

// This will work for both local (EXPO_PUBLIC_) and EAS builds (without prefix)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jxolxswcizkctuoskvfn.supabase.co'
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2x4c3djaXprY3R1b3NrdmZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODg5NjE5MiwiZXhwIjoyMDU0NDcyMTkyfQ.D0AwIVvebL_QUaHsRoSjEuAoQ8Ff5-dacBJ7E4v8PhI'

// Strict validation of required environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase configuration. Please check your environment variables.')
}

// Create regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseKey)

// Create service role client for privileged operations

if (!serviceRoleKey) {
  throw new Error('Missing Supabase service role key configuration')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export interface Movement {
  id?: string
  user_id: string
  category: 'WIRE' | 'INTERNAL' | 'COMMISSION'
  direction: 'INBOUND' | 'OUTBOUND'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
  amount: number
  commission: number
  final_amount: number
  clave_rastreo?: string
  external_reference?: string
  internal_reference?: string
  counterparty_name: string
  counterparty_bank: string
  counterparty_clabe?: string
  counterparty_card?: string
  counterparty_email?: string
  concept?: string
  concept2?: string
  metadata?: any
  mfa_enabled?: boolean
}

export interface Contact {
  id?: string
  user_id: string
  name: string
  bank: string
  clabe: string | null
  alias?: string
  email?: string
  card?: string | null
}

export interface PersonaMoral {
  id?: string
  user_id: string
  nombre_empresa: string
  rfc: string
  fecha_constitucion: string
  entidad_federativa: string
  calle: string
  numero_exterior: string
  numero_interior?: string
  colonia: string
  municipio: string
  codigo_postal: string
  telefono: string
}

export const db = {
  settings: {
    async getSettings() {
      const { data, error } = await supabase
        .from('settings')
        .select('setting, status')

      if (error) throw error
      return data || []
    }
  },

  users: {
    async createOrUpdate(userData: {
      id: string
      email: string
      given_name?: string
      family_name?: string
      company_name?: string
      clabe?: string
      balance?: number
      account_type?: 'FISICA' | 'MORAL' | 'PENDING'
      onboarding_status?: 'PENDING' | 'COMPLETED'
      account_status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      mfa_enabled?: boolean
    }) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    },

    async get(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getUserId(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (error) throw error
      return data?.id
    },

    list: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) throw error;
      return data;
    },

    getByClabe: async (clabe: string) => {
      console.log('Searching for CLABE:', clabe);
      const { data: accountData, error: accountError } = await supabase
        .from('transfer_accounts')
        .select('*')
        .eq('clabe', clabe)
        .single();

      if (accountError) {
        console.error('Account lookup error:', accountError);
        throw accountError;
      }

      // Only fetch balance info if account exists
      if (accountData) {
        const { data: validationData, error: validationError } = await supabase
          .from('transfer_validation')
          .select('balance, account_status')
          .eq('clabe', clabe)
          .single();

        if (validationError) {
          console.error('Balance validation error:', validationError);
          throw validationError;
        }

        // Combine the data
        return {
          ...accountData,
          balance: validationData.balance,
          account_status: validationData.account_status
        };
      }

      return null;
    },

    // Function to check balance without exposing full account details
    validateTransfer: async (clabe: string, amount: number) => {
      const { data, error } = await supabase
        .from('transfer_validation')
        .select('balance, account_status')
        .eq('clabe', clabe)
        .single();

      if (error) {
        console.error('Transfer validation error:', error);
        throw error;
      }

      return {
        isValid: data.balance >= amount && data.account_status === 'ACTIVE',
        hasBalance: data.balance >= amount,
        isActive: data.account_status === 'ACTIVE'
      };
    }
  },

  movements: {
    async create(data: Movement) {
      const { data: result, error } = await supabaseAdmin
        .from('movements')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },

    async list(userId: string) {
      // Regular operations still use normal client
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async updateStatus(id: string, status: Movement['status'], metadata?: any) {
      const { data, error } = await supabase
        .from('movements')
        .update({ 
          status,
          ...(metadata && { metadata }),
          ...(status === 'COMPLETED' && { completed_at: new Date().toISOString() }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async getByClaveRastreo(claveRastreo: string) {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('clave_rastreo', claveRastreo)

      if (error) throw error
      return data
    },

    async teamList(teamId: string) {
      const { data: teamMembers, error: errorTeamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          user:users (
            id,
            email
          )
        `)
        .eq('team_id', teamId)

      if (errorTeamMembers) throw errorTeamMembers

      const members = teamMembers || []
      const usersIds = members.map((m: any) => m.user_id)
      const userEmailMap = new Map(members.map((m: any) => [m.user_id, m.user?.email]))

      if (usersIds.length === 0) return []

      const { data: movements, error } = await supabase
        .from('movements')
        .select('*')
        .in('user_id', usersIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (movements || []).map((movement: any) => ({
        ...movement,
        user: { email: userEmailMap.get(movement.user_id) }
      }))
    },

    // Pending movements helpers
    async createPendingMovement(
      userId: string | undefined,
      amount: number,
      commission: number,
      finalAmount: number,
      counterpartyName: string,
      counterpartyRfcCurp: string | undefined,
      counterpartyBank: string | undefined,
      counterpartyClabe: string | undefined,
      concept: string,
      concept2: string | undefined,
      metadata: any
    ) {
      const { data, error } = await supabase
        .from('pending_movements')
        .insert({
          user_id: userId,
          category: 'WIRE',
          direction: 'OUTBOUND',
          status: 'PENDING',
          amount: amount,
          commission: commission,
          final_amount: finalAmount,
          counterparty_name: counterpartyName,
          counterparty_bank: counterpartyBank,
          counterparty_clabe: counterpartyClabe,
          counterparty_rfc_curp: counterpartyRfcCurp,
          concept: concept,
          concept2: concept2,
          metadata: metadata
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updatePendingMovement(pendingMovementId: string, data: Partial<any>) {
      const { data: updatedData, error } = await supabase
        .from('pending_movements')
        .update(data)
        .eq('id', pendingMovementId)
        .select()
        .single()

      if (error) throw error
      return updatedData
    },

    async deletePendingMovement(pendingMovementId: string) {
      const { error } = await supabase
        .from('pending_movements')
        .delete()
        .eq('id', pendingMovementId)

      if (error) throw error
    },

    async getPendingMovements(params: { page: number, itemsPerPage: number, teamId?: string | null, userId?: string | null }) {
      const { page, itemsPerPage, teamId, userId } = params

      const from = (page - 1) * itemsPerPage
      const to = page * itemsPerPage - 1

      let query = supabase
        .from('pending_movements')
        .select('*', { count: 'exact' })
        .eq('approved', false)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (teamId) {
        const ownerId = await db.teams.getIdOwner(teamId)
        if (ownerId) {
          query = query.eq('user_id', ownerId)
        }
      } else if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, count, error } = await query
      if (error) throw error

      return {
        data: (data || []) as any[],
        totalPages: Math.ceil(((count as number) || 0) / itemsPerPage)
      }
    }
  },

  contacts: {
    async create(data: Contact) {
      const { data: result, error } = await supabase
        .from('contacts')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },

    async list(userId: string) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },

    async update(id: string, data: Partial<Contact>) {
      const { data: result, error } = await supabase
        .from('contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    }
  },

  personaMoral: {
    async create(data: PersonaMoral) {
      const { data: result, error } = await supabase
        .from('persona_moral')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    async get(userId: string) {
      const { data, error } = await supabase
        .from('persona_moral')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },

    async update(userId: string, data: Partial<PersonaMoral>) {
      const { data: result, error } = await supabase
        .from('persona_moral')
        .update(data)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return result;
    }
  }
  ,

  teams: {
    async getTeamName(teamId: string) {
      const { data, error } = await supabaseAdmin
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single()

      if (error) throw error
      return data?.name
    },

    async get(id: string) {
      // First, get the team members with user_id
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, role, status')
        .eq('team_id', id)

      if (membersError) throw membersError

      // Then, get the team info
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (teamError) throw teamError

      // Get user details for each member, handling inactive users
      const membersWithUsers = await Promise.all(
        teamMembers.map(async (member) => {
          try {
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('email, account_status')
              .eq('id', member.user_id)
              .single()

            if (userError) {
              console.warn(`Failed to fetch user ${member.user_id}:`, userError)
              return {
                user_id: member.user_id,
                role: member.role,
                status: member.status,
                user: {
                  email: "Usuario no encontrado",
                  account_status: "UNKNOWN"
                }
              }
            }

            return {
              user_id: member.user_id,
              role: member.role,
              status: member.status,
              user: {
                email: user.email || "Sin email",
                account_status: user.account_status || "UNKNOWN"
              }
            }
          } catch (error) {
            console.error(`Error processing member ${member.user_id}:`, error)
            return {
              user_id: member.user_id,
              role: member.role,
              status: member.status,
              user: {
                email: "Error al cargar",
                account_status: "ERROR"
              }
            }
          }
        })
      )

      return {
        ...team,
        members: membersWithUsers
      }
    },

    async getTeam(id: string) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getTeamMemberships(userId: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          team_id,
          role,
          status,
          team:teams!inner(id, name)
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (error) throw error
      return data
    },

    async getTeamMembershipsWihoutOwner(userId: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          team_id,
          role,
          status,
          team:teams!inner(id, name)
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .neq('role', 'OWNER');

      if (error) throw error
      return data
    },

    async getMemberStatus(userId: string) {
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, status')
        .eq('user_id', userId)

      if (teamMemberError) throw teamMemberError
      return teamMemberData
    },

    async getIdOwner(id: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', id)
        .eq('role', 'OWNER')
        .single()

      if (error) throw error
      return data?.user_id
    },

    async isOwner(userId: string, teamId: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .eq('role', 'OWNER')

      if (error) throw error
      return data?.length > 0
    },

    async isMember(userId: string, teamId: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .neq('role', 'OWNER')

      if (error) throw error
      return data?.length > 0
    },

    async getPermissions(userId: string, teamId: string) {
      const { data, error } = await supabase
        .from('team_members')
        .select('permissions')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .eq('status', 'ACTIVE')
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      return data.permissions
    },

    async createTeamFromAdmin(name: string, userId: string) {
      const { data: teamData, error: teamError } = await supabaseAdmin
        .from('teams')
        .insert({
          name,
        })
        .select()
        .single()

      if (teamError) throw teamError

      const { error: memberError } = await supabaseAdmin
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: userId,
          role: 'OWNER',
          permissions: teamPermissions.OWNER,
          status: 'ACTIVE'
        })

      if (memberError) throw memberError

      return
    },

    async createTeam(name: string, userId: string) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Create team member relationship with full permissions
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: userId,
          role: 'OWNER',
          permissions: teamPermissions.OWNER,
          status: 'ACTIVE'
        })

      if (memberError) throw memberError

      return
    },

    async createTeamMember(teamId: string, userId: string, role: string) {
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role,
          permissions: teamPermissions[role as keyof typeof teamPermissions] as TeamMemberPermissions,
          status: 'ACTIVE'
        })

      if (memberError) throw memberError

      return
    },

    // Additional team management functions moved from utils/teams.ts
    async createTeamWithMetadata(data: {
      name: string
      metadata?: {
        description?: string
      }
      userId: string
    }) {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([data])
        .select()
        .single()

      if (teamError) throw teamError

      // Add the creator as an OWNER in team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: data.userId,
          role: 'OWNER',
          status: 'ACTIVE'
        }])

      if (memberError) throw memberError

      return team
    },

    async updateTeamWithMembers(
      id: string,
      data: {
        name: string
        metadata?: {
          description?: string
        }
      }
    ) {
      // First perform the update
      const { data: updatedTeam, error: updateError } = await supabase
        .from('teams')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          name,
          metadata,
          members:team_members(
            id,
            user_id,
            role,
            status,
            user:users(
              id,
              email,
              given_name,
              family_name,
              account_status
            )
          )
        `)
        .single()

      if (updateError) throw updateError

      // Transform the data to match the expected format
      return {
        ...updatedTeam,
        members: (updatedTeam.members as unknown as any[]).map(member => ({
          id: member.user?.id || 'Desconocido',
          email: member.user?.email || 'Desconocido',
          given_name: member.user?.given_name || 'Desconocido',
          family_name: member.user?.family_name || 'Desconocido',
          team_role: member.role,
          status: member.status,
          account_status: member.user?.account_status || 'Desconocido',
        }))
      }
    },

    async updateTeamMemberRole(
      teamId: string,
      userId: string,
      role: string
    ) {
      const { error } = await supabase
        .from('team_members')
        .update({ role, permissions: teamPermissions[role as keyof typeof teamPermissions] })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error
    },

    async inactivateMember(teamId: string, userId: string) {
      const { data: listFactors, error: errorListFactors } = await supabaseAdmin.auth.admin.mfa.listFactors({
        userId: userId,
      });

      if (errorListFactors) throw errorListFactors

      if (listFactors?.factors?.length) {
        for (const factor of listFactors?.factors) {
          const { error: errorDeleteFactor } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
            id: factor.id,
            userId: userId,
          })

          if (errorDeleteFactor) throw errorDeleteFactor
        }
      }

      const { error: errorTeamMember } = await supabase
        .from('team_members')
        .update({ status: 'INACTIVE' })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (errorTeamMember) throw errorTeamMember
    },

    async reactivateMember(teamId: string, userId: string) {
      const { error: errorTeamMember } = await supabase
        .from('team_members')
        .update({ status: 'ACTIVE' })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (errorTeamMember) throw errorTeamMember
    },

    async getAllTeams() {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          metadata,
          members:team_members (
            id,
            user_id,
            role,
            status,
            user:users (
              id,
              email,
              account_status
            )
          )
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching teams:', error)
        throw error
      }

      // Transform the data to match the expected format
      return teams.map(team => ({
        ...team,
        members: (team.members as unknown as any[]).map(member => ({
          id: member.user?.id || 'Desconocido',
          email: member.user?.email || 'Desconocido',
          team_role: member.role,
          account_status: member.user?.account_status || 'Desconocido',
          status: member.status
        }))
      }))
    },

    async getTeamWithMembers(id: string) {
      const { data: team, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          metadata,
          members:team_members (
            id,
            user_id,
            role,
            status,
            user:users (
              id,
              email,
              given_name,
              family_name,
              account_status
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Transform the data to match the expected format
      return {
        ...team,
        members: (team.members as unknown as any[]).map(member => ({
          id: member.user?.id || 'Desconocido',
          email: member.user?.email || 'Desconocido',
          given_name: member.user?.given_name || 'Desconocido',
          family_name: member.user?.family_name || 'Desconocido',
          team_role: member.role,
          status: member.status,
          account_status: member.user?.account_status || 'Desconocido'
        }))
      }
    },

    async checkUserExists(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error
      }

      return data
    },

    async updateMemberEmail(userId: string, newEmail: string) {
      const existingUser = await this.checkUserExists(newEmail)
      if (existingUser) {
        throw new Error('Este correo electrónico ya está en uso')
      }

      const { error: errorUpdateEmail } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: newEmail,
      })

      if (errorUpdateEmail) throw errorUpdateEmail

      const { error } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', userId)

      if (error) throw error
    },

    async getTeamStats(teamId: string, userFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE') {
      try {
        // Get team data and members
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            id,
            metadata,
            members:team_members (
              id,
              user_id,
              status,
              role,
              user:users (
                id,
                email,
                balance,
                account_status,
                inbound_limit_monthly
              )
            )
          `)
          .eq('id', teamId)
          .single()

        if (teamError) throw teamError

        const members = (team?.members || []) as unknown as any[]

        // Filter members based on status
        const filteredMembers = members.filter(member => {
          if (userFilter === 'ALL') return member.role !== 'OWNER'
          return member.role !== 'OWNER' && member.status === userFilter
        })

        // Calculate total balance from filtered team members
        const totalBalance = filteredMembers.reduce((sum, member) => sum + (member.user?.balance || 0), 0)

        // Get transaction limit from owner's settings
        const ownerMember = members.find(member => member.role === 'OWNER') as any
        const transactionLimit = ownerMember?.user?.inbound_limit_monthly || 3000000 // Default 3M if not set

        // Get transactions and filter by user status if needed
        const allTransactions = await db.movements.teamList(teamId)
        const recentTransactions = userFilter === 'ALL'
          ? (allTransactions || []).filter(transaction =>
            transaction.user_id !== ownerMember?.user_id
          )
          : (allTransactions || []).filter(transaction => {
            const member = members.find(m => m.user?.id === transaction.user_id)
            return member?.role !== 'OWNER' && member?.status === userFilter
          })

        return {
          totalBalance,
          transactionLimit,
          recentTransactions
        }
      } catch (error) {
        console.error('Error getting team stats:', error)
        // Return safe default values
        return {
          totalBalance: 0,
          transactionLimit: 3000000,
          recentTransactions: []
        }
      }
    },

    async deleteTeam(teamId: string) {
      try {
        // Get all team members
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            user:users (
              id,
              email
            )
          `)
          .eq('team_id', teamId)

        if (membersError) throw membersError

        // Deactivate all team members
        for (const member of members) {
          const { data: listFactors, error: errorListFactors } = await supabaseAdmin.auth.admin.mfa.listFactors({
            userId: member.user_id,
          })

          if (errorListFactors) throw errorListFactors

          if (listFactors?.factors?.length) {
            for (const factor of listFactors?.factors) {
              const { error: errorDeleteFactor } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
                id: factor.id,
                userId: member.user_id,
              })

              if (errorDeleteFactor) throw errorDeleteFactor
            }
          }

          // Update member status
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ status: 'INACTIVE' })
            .eq('id', member.id)

          if (updateError) throw updateError
        }

        // Delete the team (this will cascade delete team_members)
        const { error: deleteError } = await supabase
          .from('teams')
          .delete()
          .eq('id', teamId)

        if (deleteError) throw deleteError

        return { success: true }
      } catch (error) {
        console.error('Error deleting team:', error)
        return { success: false, error }
      }
    }
  }
} 