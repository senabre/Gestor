import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { StaffMember, Team } from '../types';

interface StaffFormProps {
  staff: StaffMember | null;
  teams: Team[];
  onClose: () => void;
  onSubmit: () => void;
}

export default function StaffForm({ staff, teams, onClose, onSubmit }: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    position: staff?.position || '',
    salary: staff?.salary ? staff.salary / 100 : 0,
    team_id: staff?.team_id || ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const staffData = {
      ...formData,
      salary: Math.round(formData.salary * 100)
    };

    if (staff) {
      const { error } = await supabase
        .from('staff')
        .update(staffData)
        .eq('id', staff.id);
      
      if (error) {
        console.error('Error updating staff:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('staff')
        .insert([staffData]);
      
      if (error) {
        console.error('Error creating staff:', error);
        return;
      }
    }
    
    onSubmit();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {staff ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h2>
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
              required
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
              Cargo
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Seleccionar cargo</option>
              <option value="Entrenador">Entrenador</option>
              <option value="Asistente">Asistente</option>
              <option value="Preparador Físico">Preparador Físico</option>
              <option value="Fisioterapeuta">Fisioterapeuta</option>
              <option value="Administrativo">Administrativo</option>
            </select>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Equipo
            </label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              <option value="">Sin equipo asignado</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
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
              {staff ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}