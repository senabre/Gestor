import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Team, Player } from '../types';

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [playerData, setPlayerData] = useState({
    name: '',
    email: '',
    phone: '',
    total_fee: 0
  });

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchPlayers();
    }
  }, [teamId]);

  async function fetchTeam() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (error) {
      console.error('Error fetching team:', error);
      return;
    }
    
    setTeam(data);
  }

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('name');
    
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    setPlayers(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase
      .from('players')
      .insert([{
        ...playerData,
        team_id: teamId,
        total_fee: playerData.total_fee * 100 // Convert to cents
      }]);
    
    if (error) {
      console.error('Error creating player:', error);
      return;
    }
    
    setShowModal(false);
    setPlayerData({ name: '', email: '', phone: '', total_fee: 0 });
    fetchPlayers();
  }

  if (!team) return null;

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/" className="text-gray-600 hover:text-blue-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{team.name}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Jugadores</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Añadir Jugador</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuota Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendiente
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    to={`/players/${player.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {player.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {(player.total_fee / 100).toFixed(2)}€
                </td>
                <td className="px-6 py-4">
                  {(player.paid_amount / 100).toFixed(2)}€
                </td>
                <td className="px-6 py-4">
                  {((player.total_fee - player.paid_amount) / 100).toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Jugador</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={playerData.name}
                    onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })}
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
                    value={playerData.email}
                    onChange={(e) => setPlayerData({ ...playerData, email: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={playerData.phone}
                    onChange={(e) => setPlayerData({ ...playerData, phone: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cuota Total (€)
                  </label>
                  <input
                    type="number"
                    value={playerData.total_fee}
                    onChange={(e) => setPlayerData({ ...playerData, total_fee: Number(e.target.value) })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPlayerData({ name: '', email: '', phone: '', total_fee: 0 });
                  }}
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
      )}
    </div>
  );
}