import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Player } from '../types';

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
  const [formData, setFormData] = useState({
    amount: currentSalary / 100,
    notes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const receiptNumber = `REC-PLAYER-${Date.now()}`;
    
    const { error } = await supabase
      .from('player_salary_payments')
      .insert([{
        player_id: player.id,
        amount: Math.round(formData.amount * 100),
        receipt_number: receiptNumber,
        notes: formData.notes
      }]);
    
    if (error) {
      console.error('Error creating payment:', error);
      return;
    }
    
    onSubmit();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
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
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}