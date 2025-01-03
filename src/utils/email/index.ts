import { supabase } from '../../lib/supabase';
import { Player, Payment } from '../../types';
import { generateReceiptEmailTemplate, generatePaymentReminderTemplate } from './templates';

const EMAIL_CONFIG = {
  from: 'senabre20@gmail.com'
};

export async function sendReceiptEmail(player: Player, payment: Payment) {
  if (!player.email) {
    console.warn('No email address available for player');
    return;
  }

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: player.email,
        from: EMAIL_CONFIG.from,
        subject: `Recibo de pago - ${payment.receipt_number}`,
        html: generateReceiptEmailTemplate(
          player.name,
          payment.receipt_number,
          payment.amount,
          new Date(payment.payment_date)
        )
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw new Error('No se pudo enviar el email del recibo. Por favor, inténtalo de nuevo.');
  }
}

export async function sendPaymentReminderEmail(player: Player, amount: number, dueDate: Date) {
  if (!player.email) {
    console.warn('No email address available for player');
    return;
  }

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: player.email,
        from: EMAIL_CONFIG.from,
        subject: 'Recordatorio de pago pendiente',
        html: generatePaymentReminderTemplate(player.name, amount, dueDate)
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw new Error('No se pudo enviar el email de recordatorio. Por favor, inténtalo de nuevo.');
  }
}