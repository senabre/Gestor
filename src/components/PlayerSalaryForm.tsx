import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Player } from '../types';

interface PlayerSalaryFormProps {
  player: Player;
  currentSalary: number;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PlayerSalaryForm({
  player,
  currentSalary,
  onClose,
  onSubmit
}: PlayerSalaryFormProps) {
  const [salary, setSalary] = useState(currentSalary / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase
      .from('player_salaries')
      .insert([{
        player_id: player.id,
        salary: Math.round(salary * 100)
      }]);
    
    if (error) {
      console.error('Error updating salary:', error);
      return;
    }
    
    onSubmit();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Actualizar Salario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salario Mensual (€)
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              min="0"
              step="0.01"
              required
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}