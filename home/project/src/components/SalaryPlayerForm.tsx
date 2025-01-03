import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Team } from '../types';

interface SalaryPlayerFormProps {
  team: Team;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SalaryPlayerForm({ team, onClose, onSubmit }: SalaryPlayerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: 0
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Create player
    const { data: playerData, error: playerError } = await supabase
      .from('salary_players')
      .insert([{
        team_id: team.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }])
      .select()
      .single();
    
    if (playerError) {
      console.error('Error creating player:', playerError);
      return;
    }

    // Create initial salary
    const { error: salaryError } = await supabase
      .from('player_salaries')
      .insert([{
        player_id: playerData.id,
        salary: Math.round(formData.salary * 100)
      }]);
    
    if (salaryError) {
      console.error('Error creating salary:', salaryError);
      return;
    }
    
    onSubmit();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nuevo Jugador</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salario Mensual (€)
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
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
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}