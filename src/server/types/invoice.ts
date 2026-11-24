export type PaymentRequestStatus = 'unpaid' | 'paid' | 'cancelled';
export type PaymentRequestMethod = 'mada' | 'creditcard' | 'applepay' | 'office' | null;

export interface PaymentRequest {
  id: string; // Internal sequential accounting ID e.g. PR-2026-0001
  token: string; // Cryptographic url-safe lookup token (32 chars base64url)
  clientName: string;
  clientPhone: string; // E.164 e.g. +9665XXXXXXXX
  serviceCategory: string; // Generic label e.g., "دراسة قضية واستشارة نظامية"
  amountSar: number;
  amountMinor: number; // amountSar * 100 in Halalas
  description: string; // Public brief (strictly non-confidential)
  status: PaymentRequestStatus;
  moyasarPaymentId?: string | null;
  paymentMethod?: PaymentRequestMethod;
  paidAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  notes?: string; // Internal admin notes (not shown to client)
}

export interface CreatePaymentRequestInput {
  clientName: string;
  clientPhone: string;
  serviceCategory: string;
  amountSar: number;
  description?: string;
  notes?: string;
  expiresInDays?: number;
}
