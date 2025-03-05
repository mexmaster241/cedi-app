import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

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
} 