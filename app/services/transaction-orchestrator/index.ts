/**
 * Transaction Orchestrator service.
 * Connects to cedi-backend-transaction-orchestrator for transfers.
 */

export { getTransactionOrchestratorClient } from './client';
export { createTransfer as createTransferViaOrchestrator, getTransferStatus } from './transaction-orchestrator.api';
export type {
  CreateTransferRequest,
  CreateTransferResponse,
  TransferAccountType,
  TransferStatusResponse,
} from './transaction-orchestrator.types';
