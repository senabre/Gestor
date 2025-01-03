import { supabase } from '../lib/supabase';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      message
    }]);

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function createPaymentDueNotification(
  userId: string,
  playerName: string,
  amount: number,
  dueDate: Date
) {
  const title = 'Pago Pendiente';
  const message = `El pago de ${(amount / 100).toFixed(2)}€ para ${playerName} vence el ${dueDate.toLocaleDateString()}`;
  
  await createNotification(userId, 'payment_due', title, message);
}

export async function createPaymentReceivedNotification(
  userId: string,
  playerName: string,
  amount: number
) {
  const title = 'Pago Recibido';
  const message = `Se ha registrado un pago de ${(amount / 100).toFixed(2)}€ de ${playerName}`;
  
  await createNotification(userId, 'payment_received', title, message);
}

export async function checkMonthlyPayments(userId: string) {
  const { data: players, error } = await supabase
    .from('salary_players')
    .select(`
      id,
      name,
      player_salaries (salary),
      player_salary_payments (
        amount,
        payment_date
      )
    `);

  if (error) {
    console.error('Error checking monthly payments:', error);
    return;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  players?.forEach(player => {
    const salary = player.player_salaries?.[0]?.salary || 0;
    
    // Verificar pagos del mes actual
    const monthlyPayments = player.player_salary_payments?.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    });

    const paidAmount = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    if (paidAmount < salary) {
      createPaymentDueNotification(
        userId,
        player.name,
        salary - paidAmount,
        endOfMonth
      );
    }
  });
}