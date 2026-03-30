/**
 * Transaction Orchestrator API.
 * Transfer creation and status via the cedi-backend-transaction-orchestrator.
 */

import { getTransactionOrchestratorClient } from './client';
import type {
  CreateTransferRequest,
  CreateTransferResponse,
  TransferStatusResponse,
} from './transaction-orchestrator.types';

/** Create an outbound transfer (SPEI or internal). */
export async function createTransfer(
  request: CreateTransferRequest
): Promise<CreateTransferResponse> {
  const client = await getTransactionOrchestratorClient();
  const body = {
    userId: request.userId,
    amount: request.amount,
    accountType: request.accountType,
    recipientAccount: request.recipientAccount,
    beneficiaryName: request.beneficiaryName,
    concept: request.concept,
    concept2: request.concept2 ?? undefined,
    rfcCurp: request.rfcCurp ?? undefined,
    institutionCode: request.institutionCode ?? undefined,
    saveAccount: request.saveAccount ?? false,
    contactAlias: request.contactAlias ?? undefined,
  };
  return client.post<CreateTransferResponse>('/transfers', body);
}

/** Get transfer status by clave rastreo. */
export async function getTransferStatus(
  claveRastreo: string
): Promise<TransferStatusResponse> {
  const client = await getTransactionOrchestratorClient();
  return client.get<TransferStatusResponse>(
    `/transfers/${encodeURIComponent(claveRastreo)}/status`
  );
}
