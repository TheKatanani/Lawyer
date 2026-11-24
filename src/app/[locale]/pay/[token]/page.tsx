import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import { getMoyasarPublishableKey } from '@/server/payments/moyasar';
import { PaymentRequestView } from '@/components/payment/PaymentRequestView';

export const dynamic = 'force-dynamic';

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

  const settings = store.siteSettings || INITIAL_SETTINGS;
  const publishableKey = getMoyasarPublishableKey();
  const applePayEnabled = settings.applePayEnabled ?? false;
  const officialPhone = settings.phone || '+966 55 777 5504';
  const officialWhatsApp = settings.whatsapp || '+966 55 777 5504';

  const sanitizedData = {
    id: pr.id,
    token: pr.token,
    clientName: pr.clientName,
    serviceCategory: pr.serviceCategory,
    amountSar: pr.amountSar,
    amountMinor: pr.amountMinor,
    description: pr.description,
    status: pr.status,
    paymentMethod: pr.paymentMethod,
    paidAt: pr.paidAt,
    createdAt: pr.createdAt,
    expiresAt: pr.expiresAt,
    isExpired: pr.expiresAt ? new Date(pr.expiresAt).getTime() < Date.now() : false,
    moyasarPaymentId: pr.moyasarPaymentId,
  };

  return (
    <PaymentRequestView
      initialData={sanitizedData}
      locale={locale}
      publishableKey={publishableKey}
      applePayEnabled={applePayEnabled}
      officialPhone={officialPhone}
      officialWhatsApp={officialWhatsApp}
    />
  );
}
