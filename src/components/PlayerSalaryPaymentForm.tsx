import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Player } from '../types';
import { useAuth } from '../lib/AuthContext';
import { createPaymentReceivedNotification } from '../utils/notifications';
import { sendReceiptEmail } from '../utils/email';

interface PlayerSalaryPaymentFormProps {
  player: Player;
  currentSalary: number;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PlayerSalaryPaymentForm({
  player,
  currentSalary,
  onClose,
  onSubmit
}: PlayerSalaryPaymentFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: currentSalary / 100,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const receiptNumber = `REC-PLAYER-${Date.now()}`;
      const amount = Math.round(formData.amount * 100);
      
      // Register payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('player_salary_payments')
        .insert([{
          player_id: player.id,
          amount,
          receipt_number: receiptNumber,
          notes: formData.notes
        }])
        .select()
        .single();
      
      if (paymentError) throw paymentError;

      // Create notification
      if (user) {
        await createPaymentReceivedNotification(
          user.id,
          player.name,
          amount
        );
      }

      // Send receipt email
      if (player.email && paymentData) {
        await sendReceiptEmail(player, paymentData);
      }
      
      onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Importe (€)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              min="0.01"
              step="0.01"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Registrar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}