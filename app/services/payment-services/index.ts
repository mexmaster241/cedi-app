/**
 * Payment Services (Pago de Servicios)
 *
 * Public API for the payment-services-orchestrator.
 */

export { getPaymentServicesClient } from './client';
export {
  getCategories,
  getProviders,
  listCategories,
  listProductCategories,
  getTransactionHistory,
  verifyReference,
  inquireBill,
  payService,
} from './payment-services.api';
export type {
  ServiceCategory,
  ServiceProvider,
  ListProductCategoriesParams,
  ProductCategoryResponse,
  SendTransactionRequest,
  SendTransactionResponse,
  VerifyReferenceRequest,
  VerifyReferenceResponse,
  VerifyReferenceMensaje,
  TransactionHistoryItem,
  ApiResponse,
  BillInquiryRequest,
  BillInquiryResponse,
  PayServiceRequest,
  PayServiceResponse,
} from './payment-services.types';
