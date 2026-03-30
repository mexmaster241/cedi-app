/**
 * Payment Services API Service
 *
 * Simple API service that handles all HTTP calls for Payment Services via gateway.
 * Aligned with payment-services-orchestrator (cediOs). Gateway handles encryption;
 * this layer sends/receives plain JSON.
 */

import { getPaymentServicesClient } from './client';
import type {
  ApiResponse,
  ListProductCategoriesParams,
  ProductCategoryResponse,
  SendTransactionRequest,
  SendTransactionResponse,
  TransactionHistoryItem,
  VerifyReferenceRequest,
  VerifyReferenceResponse,
  ServiceCategory,
  ServiceProvider,
  BillInquiryRequest,
  BillInquiryResponse,
  PayServiceRequest,
  PayServiceResponse,
} from './payment-services.types';

/** Orchestrator path constants (same as cediOs, no leading slash for gateway). */
const CATEGORIES_BASE = 'api/payment-services/categories';
const TRANSACTION_SEND = 'api/payment-services/transactions/send';
const TRANSACTION_HISTORY = 'api/payment-services/transactions/history';
const VERIFY_REFERENCE = 'api/payment-services/verify-reference';

/** Map UI category id to orchestrator code. */
const CATEGORY_TO_ORCHESTRATOR: Record<string, string> = {
  'tiempo-aire': 'TA',
  'ta': 'TA',
  'agua': 'Agua',
  'luz-gas': 'ServicesPay',
  'pago de servicios': 'ServicesPay',
  'servicespay': 'ServicesPay',
  'gobierno': 'Gobierno',
  'Gobierno': 'Gobierno',
  'TA': 'TA',
  'Agua': 'Agua',
  'ServicesPay': 'ServicesPay',
};

/** Gateway returns decrypted orchestrator response: { status, message, data }. */
function unwrapResponseData<T>(res: ApiResponse<unknown> & { data?: T }): T {
  const status = res?.status ?? 0;
  if (status >= 200 && status < 300) {
    if (res.data !== undefined) return res.data as T;
    return res as unknown as T;
  }
  const msg = (res as { message?: string }).message ?? (res as { exception?: string }).exception ?? `Error ${status}`;
  throw new Error(msg);
}

/**
 * Normaliza data URL de imagen: el orquestador puede devolver "data:image/png;base64XXXX"
 * sin coma; el estándar es "data:image/png;base64,XXXX". Inserta la coma sin truncar el payload.
 */
function normalizeBase64DataUrl(str: string): string {
  if (typeof str !== 'string' || !str.startsWith('data:image/')) return str;
  if (/^data:image\/[^;]+;base64[^,]/.test(str)) {
    return str.replace(/^(data:image\/[^;]+;base64)(?=[A-Za-z0-9+/=])/, '$1,');
  }
  return str;
}

/**
 * List available category codes (dinámico: lo que devuelve el orquestador).
 * GET /api/payment-services/categories
 * Usar los códigos devueltos aquí como argumento de listProductCategories.
 */
export async function listCategories(): Promise<string[]> {
  const client = await getPaymentServicesClient();
  const res = await client.get<ApiResponse<string[]>>(CATEGORIES_BASE);
  const data = unwrapResponseData<string[]>(res);
  return Array.isArray(data) ? data : [];
}

/**
 * List products for a category with optional filters.
 * GET /api/payment-services/categories/{category}/products?idService=...&idCatTipoServicio=...
 * @param category - Código de categoría tal como lo devuelve listCategories() (ej. TA, Agua, ServicesPay, Gobierno)
 */
export async function listProductCategories(
  category: string,
  params?: ListProductCategoriesParams
): Promise<ProductCategoryResponse[]> {
  const searchParams = new URLSearchParams();
  if (params?.idService != null) searchParams.set('idService', String(params.idService));
  if (params?.idCatTipoServicio != null) searchParams.set('idCatTipoServicio', String(params.idCatTipoServicio));
  const query = searchParams.toString();
  const url = `${CATEGORIES_BASE}/${encodeURIComponent(category)}/products${query ? `?${query}` : ''}`;
  const client = await getPaymentServicesClient();
  const res = await client.get<ApiResponse<ProductCategoryResponse[]>>(url);
  const data = unwrapResponseData<ProductCategoryResponse[]>(res);
  const items = Array.isArray(data) ? data : [];
  return items.map((item) => ({
    ...item,
    image: item.image ? normalizeBase64DataUrl(item.image) : item.image,
  }));
}

/**
 * Send a payment transaction (e.g. recarga, pago de servicio).
 * POST /api/payment-services/transactions/send
 */
export async function sendTransaction(body: SendTransactionRequest): Promise<SendTransactionResponse> {
  const client = await getPaymentServicesClient();
  const raw = await client.post<SendTransactionResponse>(TRANSACTION_SEND, body);
  return raw;
}

/**
 * Get transaction history for a user (last paid services).
 * GET /api/payment-services/transactions/history/{userId}
 */
export async function getTransactionHistory(userId: string): Promise<TransactionHistoryItem[]> {
  const client = await getPaymentServicesClient();
  const res = await client.get<ApiResponse<TransactionHistoryItem[]>>(
    `${TRANSACTION_HISTORY}/${encodeURIComponent(userId)}`
  );
  const data = unwrapResponseData<TransactionHistoryItem[]>(res);
  return Array.isArray(data) ? data : [];
}

/**
 * Verify reference for frontType 2 products (amount to pay comes from API).
 * POST /api/payment-services/verify-reference
 * Body: { idProducto, idServicio, referencia }
 */
export async function verifyReference(body: VerifyReferenceRequest): Promise<VerifyReferenceResponse> {
  const client = await getPaymentServicesClient();
  const raw = await client.post<VerifyReferenceResponse>(VERIFY_REFERENCE, body);
  return raw;
}

// ----- Backward compatibility (UI can keep using these) -----

/** Categories as ServiceCategory[] for UI (from listCategories). */
export async function getCategories(): Promise<ServiceCategory[]> {
  const list = await listCategories();
  return list.map((id, i) => ({
    id: id.toLowerCase().replace(/\s/g, '-'),
    name: id,
    order: i,
  }));
}

/** Products as ServiceProvider[] for UI (from listProductCategories). */
export async function getProviders(
  categoryId: string,
  params?: ListProductCategoriesParams
): Promise<ServiceProvider[]> {
  const list = await listProductCategories(categoryId, params);
  return list.map((p) => ({
    id: String(p.productId ?? p.serviceId),
    categoryId: categoryId,
    name: p.service ?? '',
    slug: p.service?.toLowerCase().replace(/\s/g, '-'),
  }));
}

/** Legacy: verify reference (maps to verifyReference).
 * Para frontType 2 de servicios, el orquestador requiere SOLO:
 * { idProducto: 597, idServicio: 166, referencia }.
 */
export async function inquireBill(request: BillInquiryRequest): Promise<BillInquiryResponse> {
  const idProducto = 597;
  const idServicio = 166;
  const res = await verifyReference({ idProducto, idServicio, referencia: request.reference });
  const mensaje = res?.data?.mensaje;
  const codigo = mensaje?.codigo ?? '';
  const verificationUnavailable = codigo === '04';
  const isValid = codigo === '01' || codigo === '0' || codigo === '00';
  const amount = Number(mensaje?.saldo ?? mensaje?.monto) || 0;
  return {
    providerId: request.providerId,
    reference: request.reference,
    amount,
    isValid: isValid || verificationUnavailable,
    verificationUnavailable,
    errorMessage: isValid ? undefined : verificationUnavailable ? mensaje?.texto : (mensaje?.texto ?? 'Referencia inválida'),
  };
}

/** Legacy: send transaction (maps to sendTransaction; builds body from PayServiceRequest). */
export async function payService(request: PayServiceRequest): Promise<PayServiceResponse> {
  const body: SendTransactionRequest = {
    userId: request.userId,
    productId: request.productId,
    serviceId: request.serviceId,
    serviceTypeCategoryId: request.serviceTypeCategoryId ?? 0,
    referenceOrPhone: request.referenceOrPhone,
    paymentAmount: request.paymentAmount,
    frontType: request.frontType ?? 1,
    channel: request.channel ?? 'APP_IOS',
    ipAddress: request.ipAddress ?? '0.0.0.0',
  };
  const res = await sendTransaction(body);
  const data = res?.data;
  const code = data?.providerCode != null ? String(data.providerCode) : '';
  const success = code === '1' || code === '01' || code === '0' || code === '00';
  return {
    transactionId: data?.numTransaction ?? '',
    status: success ? 'COMPLETED' : 'FAILED',
    productId: request.productId,
    serviceId: request.serviceId,
    serviceTypeCategoryId: request.serviceTypeCategoryId,
    referenceOrPhone: request.referenceOrPhone,
    paymentAmount: request.paymentAmount,
  };
}
