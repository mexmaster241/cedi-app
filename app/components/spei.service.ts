import { generateToken } from '../src/utils/jwt-utils';
import axios, { AxiosError } from 'axios';

const SPEI_API_BASE_URL = process.env.EXPO_PUBLIC_SPEI_API_URL
//const SPEI_API_BASE_URL = 'http://localhost:3001/api/stp/';

export interface SpeiTransferPayload {
  claveRastreo: string;
  conceptoPago: string;
  cuentaOrdenante: string;
  cuentaBeneficiario: string;
  empresa: string;
  institucionContraparte: string;
  institucionOperante: string;
  monto: number;
  nombreBeneficiario: string;
  nombreOrdenante: string;
  referenciaNumerica: string;
  rfcCurpBeneficiario: string;
  rfcCurpOrdenante: string;
  tipoCuentaBeneficiario: string;
  tipoCuentaOrdenante: string;
  tipoPago: string;
}

export interface IncomingTransferValidation {
  cuentaBeneficiario: string;
  monto: number;
  nombreOrdenante: string;
  cuentaOrdenante: string;
  bankCode: string;
  concept?: string;
}

export interface IncomingSpeiTransfer {
  id: number;
  fechaOperacion: number;
  institucionOrdenante: number;
  institucionBeneficiaria: number;
  claveRastreo: string;
  monto: number;
  nombreOrdenante: string;
  tipoCuentaOrdenante: number;
  cuentaOrdenante: string;
  rfcCurpOrdenante: string;
  nombreBeneficiario: string;
  tipoCuentaBeneficiario: number;
  cuentaBeneficiario: string;
  nombreBeneficiario2?: string;
  tipoCuentaBeneficiario2?: number;
  cuentaBeneficiario2?: string;
  rfcCurpBeneficiario: string;
  conceptoPago: string;
  referenciaNumerica: number;
  empresa: string;
  tipoPago: number;
  tsLiquidacion: string;
  folioCodi?: string;
}

export class SpeiService {
  static async sendTransfer(payload: SpeiTransferPayload) {
    try {
      // console.log('🚀 Sending SPEI transfer:', {
      //   url: `${SPEI_API_BASE_URL}/transaction`,
      //   payload
      // });

      const token = generateToken();

      const transaction = await axios.post(
        `${SPEI_API_BASE_URL}transaction`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // console.log('📥 SPEI transaction:', transaction?.data);

      if (!transaction?.data?.trackingId || transaction?.data?.transactionStatus !== 'INITIALIZED') {
        return {
          success: false,
          error: 'Error en la validación SPEI'
        };
      }

      return {
        success: true,
        data: transaction?.data
      };

    } catch (error) {
      // console.error('❌ SPEI transfer error:', {
      //   error,
      //   message: error instanceof AxiosError ? error.response?.data : error
      // });

      return {
        success: false,
        error: error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : 'Error desconocido'
      };
    }
  }

  static async checkTransferStatus(claveRastreo: string, maxAttempts = 1): Promise<any> {
    try {
      const response = await axios.post(
        `${SPEI_API_BASE_URL}/transacciones`,
        { claveRastreo }
      );

      // console.log('📊 Transfer status check:', response.data);

      // Simplify the response handling
      return {
        success: response.data.estado === 'LQ',
        error: response.data.estado === 'D' ? response.data.causaDevolucion : undefined,
        data: response.data
      };

    } catch (error) {
      // console.error('Error checking transfer status:', error);
      return {
        success: false,
        error: error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : 'Error al verificar el estado de la transferencia'
      };
    }
  }

  static async listenForInboundTransfers(clabeAccount: string) {
    try {
      const response = await axios.post(
        `${SPEI_API_BASE_URL}/transacciones`,
        { cuentaBeneficiario: clabeAccount }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking inbound transfers:', error);
      throw error;
    }
  }

  static async validateIncomingTransfer(validationData: IncomingTransferValidation) {
    try {
      const response = await axios.post(
        `${SPEI_API_BASE_URL}/validar-abono`,
        validationData
      );
      return response.data;
    } catch (error) {
      console.error('Error validating incoming transfer:', error);
      throw error;
    }
  }
}