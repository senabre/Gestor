import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerFormProps {
  player: Player;
  onSubmit: (data: Partial<Player>) => Promise<void>;
  onCancel: () => void;
}

export default function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [formData, setFormData] = useState({
    name: player.name,
    email: player.email || '',
    phone: player.phone || '',
    total_fee: player.total_fee / 100, // Convertir de centavos a euros
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      total_fee: formData.total_fee * 100, // Convertir de euros a centavos
    });
  };

  return (
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
          Cuota Total (€)
        </label>
        <input
          type="number"
          value={formData.total_fee}
          onChange={(e) => setFormData({ ...formData, total_fee: Number(e.target.value) })}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
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
  );
}