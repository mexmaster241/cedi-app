import { db, supabaseAdmin } from '../src/db'
import { getCurrentSession } from '../src/db'

interface ContactData {
  name: string
  bank: string
  clabe?: string
  card?: string
  alias?: string
  userId?: string
}

export async function createContact(data: ContactData) {
  try {
    // Try getting user from session first
    let userId = ''
    if (data.userId) {
      userId = data.userId
    } else {
      const session = await getCurrentSession()
      if (!session?.user?.id) throw new Error('Unauthorized')
      userId = session.user.id
    }

    // Validate that at least one of CLABE or card is provided
    if (!data.clabe && !data.card) {
      throw new Error('Debe proporcionar CLABE o número de tarjeta')
    }

    // Validate formats if provided
    if (data.clabe && data.clabe.length !== 18) {
      throw new Error('CLABE debe tener 18 dígitos')
    }
    if (data.card && data.card.length !== 16) {
      throw new Error('Tarjeta debe tener 16 dígitos')
    }

    // Check if contact already exists
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .or(`clabe.eq.${data.clabe},card.eq.${data.card}`)
      .single()

    if (existingContact) {
      throw new Error('Este contacto ya existe')
    }

    // Use supabaseAdmin for creating contact
    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        user_id: userId,
        name: data.name.trim(),
        bank: data.bank,
        clabe: data.clabe || null,
        card: data.card || null,
        alias: data.alias?.trim()
      })
      .select()
      .single()

    if (error) throw error

    return { 
      success: true, 
      data: contact,
      message: 'Contacto creado exitosamente'
    }
  } catch (error) {
    console.error('Create contact error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear el contacto' 
    }
  }
}

export async function deleteContact(contactId: string, userId?: string) {
  try {
    // Try getting user from session first
    let authenticatedUserId = ''
    if (userId) {
      authenticatedUserId = userId
    } else {
      const session = await getCurrentSession()
      if (!session?.user?.id) throw new Error('Unauthorized')
      authenticatedUserId = session.user.id
    }

    // Verify the contact belongs to the user using supabaseAdmin
    const { data: contact } = await supabaseAdmin
      .from('contacts')
      .select('user_id')
      .eq('id', contactId)
      .single()

    if (!contact) {
      throw new Error('Contacto no encontrado')
    }

    if (contact.user_id !== authenticatedUserId) {
      throw new Error('No autorizado para eliminar este contacto')
    }

    // Use supabaseAdmin for deletion instead of db.contacts.delete
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', contactId)

    if (error) throw error

    return { 
      success: true,
      message: 'Contacto eliminado exitosamente'
    }
  } catch (error) {
    console.error('Delete contact error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar el contacto' 
    }
  }
}

export async function listContacts(userId?: string) {
  try {
    // Try getting user from session first
    let authenticatedUserId = ''
    if (userId) {
      authenticatedUserId = userId
    } else {
      const session = await getCurrentSession()
      if (!session?.user?.id) throw new Error('Unauthorized')
      authenticatedUserId = session.user.id
    }

    const contacts = await db.contacts.list(authenticatedUserId)
    
    // Sort contacts by name
    const sortedContacts = contacts.sort((a, b) => 
      (a.alias || a.name).localeCompare(b.alias || b.name)
    )

    return { 
      success: true, 
      data: sortedContacts,
      message: 'Contactos obtenidos exitosamente'
    }
  } catch (error) {
    console.error('List contacts error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al obtener los contactos' 
    }
  }
}

// New helper function to update contact
export async function updateContact(
  contactId: string, 
  data: Partial<ContactData>,
  userId?: string
) {
  try {
    // Try getting user from session first
    let authenticatedUserId = ''
    if (userId) {
      authenticatedUserId = userId
    } else {
      const session = await getCurrentSession()
      if (!session?.user?.id) throw new Error('Unauthorized')
      authenticatedUserId = session.user.id
    }

    // Verify the contact belongs to the user
    const { data: contact } = await supabaseAdmin
      .from('contacts')
      .select('user_id')
      .eq('id', contactId)
      .single()

    if (!contact) {
      throw new Error('Contacto no encontrado')
    }

    if (contact.user_id !== authenticatedUserId) {
      throw new Error('No autorizado para actualizar este contacto')
    }

    const updatedContact = await db.contacts.update(contactId, {
      name: data.name?.trim(),
      alias: data.alias?.trim(),
      bank: data.bank,
      clabe: data.clabe,
      card: data.card
    })

    return { 
      success: true, 
      data: updatedContact,
      message: 'Contacto actualizado exitosamente'
    }
  } catch (error) {
    console.error('Update contact error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar el contacto' 
    }
  }
}