import React from 'react';
import { Trash2, FileText, Download } from 'lucide-react';
import { Payment } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';

interface PaymentListProps {
  payments: Payment[];
  onDelete: (paymentId: string) => void;
  onPrintReceipt: (payment: Payment) => void;
}

export default function PaymentList({ payments, onDelete, onPrintReceipt }: PaymentListProps) {
  const { t } = useTranslation();

  async function handleDelete(paymentId: string) {
    if (!confirm(t('confirmDeletePayment'))) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
      onDelete(paymentId);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert(t('errorDeletingPayment'));
    }
  }

  async function handleDownloadDocument(payment: Payment) {
    if (!payment.document_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('payment-documents')
        .download(payment.document_url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `justificante-${payment.receipt_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento');
    }
  }

  if (payments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4 dark:text-gray-400">
        {t('noPayments')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left py-3 px-4">{t('date')}</th>
            <th className="text-left py-3 px-4">{t('amount')}</th>
            <th className="text-left py-3 px-4">{t('receiptNumber')}</th>
            <th className="text-left py-3 px-4">Método</th>
            <th className="text-left py-3 px-4">{t('notes')}</th>
            <th className="text-right py-3 px-4">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b dark:border-gray-700">
              <td className="py-3 px-4">
                {new Date(payment.payment_date).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                {(payment.amount / 100).toFixed(2)}€
              </td>
              <td className="py-3 px-4">{payment.receipt_number}</td>
              <td className="py-3 px-4">
                {payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
              </td>
              <td className="py-3 px-4">{payment.notes}</td>
              <td className="py-3 px-4 text-right space-x-2">
                <button
                  onClick={() => onPrintReceipt(payment)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title={t('printReceipt')}
                >
                  <FileText className="h-5 w-5" />
                </button>
                {payment.document_url && (
                  <button
                    onClick={() => handleDownloadDocument(payment)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Descargar justificante"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title={t('delete')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}