/**
 * Transaction Orchestrator types.
 * Contract for the cedi-backend-transaction-orchestrator microservice.
 */

export type TransferAccountType = 'clabe' | 'tarjeta';

/** Request body for creating an outbound transfer (SPEI or internal). */
export interface CreateTransferRequest {
  userId: string;
  amount: number;
  accountType: TransferAccountType;
  /** CLABE (18 digits) or card number (16 digits). */
  recipientAccount: string;
  beneficiaryName: string;
  concept: string;
  concept2?: string;
  rfcCurp?: string;
  /** Required for accountType === 'tarjeta'. */
  institutionCode?: string;
  saveAccount?: boolean;
  contactAlias?: string;
}

/** Response from the transaction orchestrator after creating a transfer. */
export interface CreateTransferResponse {
  success: boolean;
  claveRastreo?: string;
  message?: string;
  newBalance?: number;
  error?: string;
}

/** Status of a transfer (for polling). */
export interface TransferStatusResponse {
  claveRastreo: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  message?: string;
}
