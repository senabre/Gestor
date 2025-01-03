import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SalaryTeamFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function SalaryTeamForm({ onClose, onSubmit }: SalaryTeamFormProps) {
  const [name, setName] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase
      .from('salary_teams')
      .insert([{ name }]);
    
    if (error) {
      console.error('Error creating team:', error);
      return;
    }
    
    onSubmit();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nuevo Equipo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Equipo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
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
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}