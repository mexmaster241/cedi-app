/**
 * Payment Services Types
 *
 * Domain models and input types for Payment Services.
 * Aligned with payment-services-orchestrator API (cediOs).
 */

/** Wrapper used by payment-services-orchestrator API (categories, products, history). */
export interface ApiResponse<T> {
  status: number;
  exception?: string;
  message: string;
  data: T;
}

/** Category of service for UI (derived from listCategories). */
export interface ServiceCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  order?: number;
}

/** Service provider for UI (derived from listProductCategories). */
export interface ServiceProvider {
  id: string;
  categoryId: string;
  name: string;
  slug?: string;
  referenceLabel?: string;
  referencePlaceholder?: string;
  minAmount?: number;
  maxAmount?: number;
}

/** Query params for listing products by category. */
export interface ListProductCategoriesParams {
  idService?: number;
  idCatTipoServicio?: number;
}

/** Product from orchestrator GET /categories/{category}/products. */
export interface ProductCategoryResponse {
  serviceId: number;
  productId: number;
  service: string;
  image?: string;
  legend?: string;
  serviceTypeCategoryId?: number;
  frontType?: number;
  price?: string;
}

/** Body for POST /api/payment-services/transactions/send. */
export interface SendTransactionRequest {
  userId: string;
  productId: number;
  serviceId: number;
  serviceTypeCategoryId: number;
  referenceOrPhone: string;
  paymentAmount: number;
  frontType: number;
  channel: string;
  ipAddress: string;
}

/** Response of POST transaction/send (data from orchestrator). */
export interface SendTransactionResponse {
  status?: number;
  message?: string;
  exception?: string | null;
  data?: {
    numTransaction?: string;
    providerCode?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Body for POST /api/payment-services/verify-reference (frontType 2). */
export interface VerifyReferenceRequest {
  idProducto: number;
  idServicio: number;
  referencia: string;
}

/** Mensaje inside verify-reference response. Referencia válida: codigo "01", texto "Referencia Valida", saldo = monto a pagar. */
export interface VerifyReferenceMensaje {
  codigo: string;
  texto: string;
  saldo?: number;
  monto?: number;
}

/** Response of POST verify-reference. */
export interface VerifyReferenceResponse {
  status: number;
  exception?: string | null;
  message: string;
  data?: {
    mensaje: VerifyReferenceMensaje;
  };
}

/** Item from GET /transactions/history/{userId}. */
export interface TransactionHistoryItem {
  userId: string;
  productId: number;
  serviceId: number;
  catTypeServiceId: number;
  paymentReference: string;
  amount: number;
}

/** Legacy: request to inquire a bill (maps to VerifyReferenceRequest). */
export interface BillInquiryRequest {
  providerId: string;
  reference: string;
}

/** Legacy: response from bill inquiry (maps from VerifyReferenceResponse). */
export interface BillInquiryResponse {
  providerId: string;
  reference: string;
  amount: number;
  isValid: boolean;
  /** True when backend returns codigo "04" (servicio no disponible para verificación). Usuario puede ingresar monto manual. */
  verificationUnavailable?: boolean;
  errorMessage?: string;
}

/** Legacy: simplified pay request (maps to SendTransactionRequest). */
export interface PayServiceRequest {
  userId: string;
  productId: number;
  serviceId: number;
  serviceTypeCategoryId: number;
  referenceOrPhone: string;
  paymentAmount: number;
  frontType: number;
  channel: string;
  ipAddress: string;
}

/** Legacy: result of a payment (maps from SendTransactionResponse). */
export interface PayServiceResponse {
  transactionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  productId: number;
  serviceId: number;
  serviceTypeCategoryId: number;
  referenceOrPhone: string;
  paymentAmount: number;
  completedAt?: string;
  errorMessage?: string;
}
