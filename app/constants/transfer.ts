import { SpeiService, SpeiTransferPayload } from '../components/spei.service'
import { db, supabaseAdmin } from '../src/db'
import { BANK_CODES, BANK_TO_INSTITUTION } from './banks'
import { createContact } from './contacts'
const COMMISSION_CLABE = '646180527800000009'

interface TransferResult {
  success: boolean
  newBalance?: number
  error?: string
  message?: string
  clave_rastreo?: string
}

export async function createTransfer(formData: FormData): Promise<TransferResult> {
  try {
    const userId = formData.get('userId') as string
    if (!userId) throw new Error('User ID is required')

    // Get sender data
    const { data: senderData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !senderData) throw new Error('Sender account not found')

    const amount = Number(formData.get('amount'))
    const accountType = formData.get('accountType') as 'clabe' | 'tarjeta'
    const recipientAccount = formData.get(accountType) as string // Get the correct input based on type
    const concept = formData.get('concept') as string
    const concept2 = formData.get('concept2') as string
    const beneficiaryName = formData.get('beneficiaryName') as string

    // Validate account format based on type
    if (accountType === 'clabe' && recipientAccount.length !== 18) {
      throw new Error('La CLABE debe tener 18 dígitos')
    } else if (accountType === 'tarjeta' && recipientAccount.length !== 16) {
      throw new Error('La tarjeta debe tener 16 dígitos')
    }

    // For cards, we need the selected institution
    let bankCode: string
    let bankName: string
    let institutionCode: string

    if (accountType === 'tarjeta') {
      const selectedInstitution = formData.get('institucionContraparte') as string;
      if (!selectedInstitution) {
        throw new Error('Debe seleccionar un banco para transferencias a tarjeta');
      }
      
      // Find the bank code by matching the institution code
      const bankCodeEntry = Object.entries(BANK_TO_INSTITUTION).find(
        ([_, instCode]) => instCode === selectedInstitution
      );
      
      if (bankCodeEntry) {
        bankCode = bankCodeEntry[0];
        bankName = BANK_CODES[bankCode]?.name || 'Unknown Bank';
        institutionCode = selectedInstitution;
      } else {
        throw new Error('Invalid institution code');
      }
    } else {
      // For CLABE, get bank from first 3 digits
      bankCode = recipientAccount.substring(0, 3)
      bankName = BANK_CODES[bankCode]?.name || 'Unknown Bank'
      institutionCode = BANK_TO_INSTITUTION[bankCode] || "90646"
    }

    const isInternalTransfer = recipientAccount.startsWith('6461805278')
    const appliedCommission = isInternalTransfer ? 0 : (senderData.outbound_commission_fixed ?? 5.80)
    const totalAmount = amount + appliedCommission

    // Validate balance
    if (totalAmount > (senderData.balance || 0)) {
      throw new Error('Insufficient funds')
    }

    const claveRastreo = `CEDI${Math.floor(10000000 + Math.random() * 90000000)}`

    // Get commission account first
    const { data: commissionAccount } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clabe', COMMISSION_CLABE)
      .single()

    if (!commissionAccount) {
      throw new Error('Commission account not found')
    }

    // For internal transfers, get recipient data first
    let recipientData = null
    if (isInternalTransfer) {
      const { data: recipient, error: recipientError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clabe', recipientAccount)
        .single()

      if (recipientError || !recipient) {
        throw new Error('Recipient account not found')
      }
      recipientData = recipient

      // Prevent self-transfers
      if (recipientData.id === userId) {
        throw new Error('Cannot transfer to your own account')
      }
    }

    // Handle SPEI for external transfers
    let speiResponse
    if (!isInternalTransfer) {
      const outboundPayload: SpeiTransferPayload = {
        claveRastreo,
        conceptoPago: concept,
        cuentaOrdenante: senderData.clabe!,
        cuentaBeneficiario: recipientAccount.toString(),
        empresa: "CEDI",
        institucionContraparte: institutionCode,
        institucionOperante: "90646",
        monto: amount,
        nombreBeneficiario: beneficiaryName,
        nombreOrdenante: `${senderData.given_name} ${senderData.family_name}`.trim(),
        referenciaNumerica: Math.floor(100000 + Math.random() * 900000).toString(),
        rfcCurpBeneficiario: "ND",
        rfcCurpOrdenante: "ND",
        tipoCuentaBeneficiario: accountType === 'tarjeta' ? "3" : "40",
        tipoCuentaOrdenante: "40",
        tipoPago: "1"
      }

      speiResponse = await SpeiService.sendTransfer(outboundPayload)
      
      if (!speiResponse.success) {
        throw new Error(speiResponse.error || 'SPEI transfer failed')
      }
    }

    // Create all movements array
    const movements = []

    // 1. Add sender's outbound movement
    movements.push(
      db.movements.create({
        user_id: userId,
        category: isInternalTransfer ? 'INTERNAL' : 'WIRE',
        direction: 'OUTBOUND',
        status: 'COMPLETED',
        amount: amount,
        commission: appliedCommission,
        final_amount: totalAmount,
        clave_rastreo: claveRastreo,
        counterparty_name: beneficiaryName,
        counterparty_bank: isInternalTransfer ? 'CEDI' : bankName,
        counterparty_clabe: recipientAccount,
        counterparty_card: undefined,
        concept: concept,
        concept2: concept2,
        metadata: isInternalTransfer ? {} : { 
          speiResponse: speiResponse?.data,
          accountType,
          institutionCode,
          bankCode,
          bankName
        }
      })
    )

    // 2. For internal transfers, create recipient's inbound movement
    if (isInternalTransfer && recipientData) {
      movements.push(
        db.movements.create({
          user_id: recipientData.id,
          category: 'INTERNAL',
          direction: 'INBOUND',
          status: 'COMPLETED',
          amount: amount,
          commission: 0,
          final_amount: amount,
          clave_rastreo: claveRastreo,
          counterparty_name: `${senderData.given_name} ${senderData.family_name}`,
          counterparty_bank: 'CEDI',
          counterparty_clabe: senderData.clabe,
          concept: concept,
          concept2: concept2,
          metadata: {}
        })
      )

      // Update recipient's balance
      await db.users.createOrUpdate({
        id: recipientData.id,
        email: recipientData.email,
        balance: (recipientData.balance || 0) + amount,
        clabe: recipientData.clabe
      })
    }

    // 3. Handle commission movement (for external transfers)
    if (!isInternalTransfer && appliedCommission > 0) {
      movements.push(
        db.movements.create({
          user_id: commissionAccount.id,
          category: 'COMMISSION',
          direction: 'INBOUND',
          status: 'COMPLETED',
          amount: appliedCommission,
          commission: 0,
          final_amount: appliedCommission,
          clave_rastreo: claveRastreo,
          counterparty_name: `${senderData.given_name} ${senderData.family_name}`,
          counterparty_bank: 'CEDI',
          counterparty_clabe: senderData.clabe,
          concept: 'Comisión por transferencia SPEI saliente',
          metadata: { 
            originalTransfer: {
              amount,
              beneficiary: beneficiaryName,
              bank: bankName,
              accountType
            }
          }
        })
      )

      // Update commission account balance
      await db.users.createOrUpdate({
        id: commissionAccount.id,
        email: commissionAccount.email,
        balance: (commissionAccount.balance || 0) + appliedCommission,
        clabe: commissionAccount.clabe
      })
    }

    // Handle contact saving if requested
    const saveAccount = formData.get('saveAccount') === 'on'
    if (saveAccount) {
      try {
        await createContact({
          userId,
          name: beneficiaryName,
          bank: isInternalTransfer ? 'CEDI' : bankName,
          clabe: accountType === 'clabe' ? recipientAccount : undefined,
          card: accountType === 'tarjeta' ? recipientAccount : undefined,
          alias: (formData.get('contactAlias') as string)?.trim() || beneficiaryName
        })
      } catch (contactError) {
        console.error('Error saving contact:', contactError)
        // Don't fail the transfer if contact saving fails
      }
    }

    // Create all movements first
    await Promise.all(movements)

    // Then update sender's balance
    const newSenderBalance = (senderData.balance || 0) - totalAmount
    await db.users.createOrUpdate({
      id: userId,
      email: senderData.email,
      balance: newSenderBalance,
      clabe: senderData.clabe
    })

    return { 
      success: true, 
      newBalance: newSenderBalance,
      message: 'Transferencia completada correctamente',
      clave_rastreo: claveRastreo
    }
  } catch (error) {
    console.error('Transfer error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Transfer failed'
    }
  }
}