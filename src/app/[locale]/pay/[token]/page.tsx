import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import {
  buildPaymentRequestReceipt,
  getMoyasarPublishableKey,
  isPaymentsEnabled,
  reconcilePaidPaymentRequest,
} from '@/server/payments/moyasar';
import { PaymentRequestView } from '@/components/payment/PaymentRequestView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'بوابة السداد الإلكتروني' : 'Electronic Payment Request',
    description: isAr
      ? 'صفحة سداد طلب الأتعاب والخدمات القانونية عبر بوابة شركة رياض محمد الزهراني للمحاماة.'
      : 'Secure legal fee payment portal for Riyadh Mohammed Alzahrani Law Firm.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PaymentPage({
  params: { locale, token },
}: {
  params: { locale: string; token: string };
}) {
  setRequestLocale(locale);

  const pr = store.getPaymentRequestByToken(token);
  if (!pr) {
    notFound();
  }

  await reconcilePaidPaymentRequest(pr);
  const receipt = pr.status === 'paid' ? buildPaymentRequestReceipt(pr) : null;

  const settings = store.siteSettings || INITIAL_SETTINGS;
  const paymentsEnabled = isPaymentsEnabled();
  const publishableKey = paymentsEnabled ? getMoyasarPublishableKey() : '';
  const applePayEnabled = paymentsEnabled && (settings.applePayEnabled ?? false);
  const officialPhone = settings.phone || '+966 55 777 5504';
  const officialWhatsApp = settings.whatsapp || '+966 55 777 5504';

  const sanitizedData = {
    id: pr.id,
    token: pr.token,
    clientName: pr.clientName,
    payerName: pr.payerName || receipt?.payerName || pr.clientName,
    serviceCategory: pr.serviceCategory,
    amountSar: pr.amountSar,
    amountMinor: pr.amountMinor,
    currency: pr.currency || receipt?.currency || 'SAR',
    description: pr.description,
    status: pr.status,
    paymentMethod: pr.paymentMethod,
    maskedCard: pr.maskedCard || receipt?.maskedCard,
    paidAt: pr.paidAt,
    createdAt: pr.createdAt,
    expiresAt: pr.expiresAt,
    isExpired: pr.expiresAt ? new Date(pr.expiresAt).getTime() < Date.now() : false,
    moyasarPaymentId: pr.moyasarPaymentId,
    receipt,
  };

  return (
    <PaymentRequestView
      initialData={sanitizedData}
      locale={locale}
      paymentsEnabled={paymentsEnabled}
      publishableKey={publishableKey}
      applePayEnabled={applePayEnabled}
      officialPhone={officialPhone}
      officialWhatsApp={officialWhatsApp}
    />
  );
}
