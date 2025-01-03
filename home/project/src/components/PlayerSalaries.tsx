import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Team, Player, PlayerSalaryPayment } from '../types';
import SalaryTeamForm from './SalaryTeamForm';
import SalaryPlayerForm from './SalaryPlayerForm';
import PlayerSalaryPaymentForm from './PlayerSalaryPaymentForm';
import { generatePlayerSalaryPaymentPDF } from '../utils/playerSalaryPayment';

export default function PlayerSalaries() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Record<string, Player[]>>({});
  const [salaries, setSalaries] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<Record<string, PlayerSalaryPayment[]>>({});
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    fetchSalaryTeams();
  }, []);

  async function fetchSalaryTeams() {
    const { data, error } = await supabase
      .from('salary_teams')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching salary teams:', error);
      return;
    }
    
    setTeams(data);
    data.forEach(team => {
      fetchTeamPlayers(team.id);
    });
  }

  async function fetchTeamPlayers(teamId: string) {
    const { data, error } = await supabase
      .from('salary_players')
      .select('*')
      .eq('team_id', teamId)
      .order('name');
    
    if (error) {
      console.error('Error fetching team players:', error);
      return;
    }
    
    setPlayers(prev => ({
      ...prev,
      [teamId]: data
    }));

    data.forEach(player => {
      fetchPlayerSalary(player.id);
      fetchPlayerPayments(player.id);
    });
  }

  async function fetchPlayerSalary(playerId: string) {
    const { data, error } = await supabase
      .from('player_salaries')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching salary:', error);
      return;
    }
    
    setSalaries(prev => ({
      ...prev,
      [playerId]: data?.[0]?.salary || 0
    }));
  }

  async function fetchPlayerPayments(playerId: string) {
    const { data, error } = await supabase
      .from('player_salary_payments')
      .select('*')
      .eq('player_id', playerId)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }
    
    setPayments(prev => ({
      ...prev,
      [playerId]: data
    }));
  }

  function handlePrintReceipt(payment: PlayerSalaryPayment, player: Player, team: Team) {
    try {
      const doc = generatePlayerSalaryPaymentPDF(payment, player, team);
      doc.save(`recibo-${payment.receipt_number}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salarios de Jugadores</h1>
        <button
          onClick={() => setShowTeamModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Añadir Equipo</span>
        </button>
      </div>

      <div className="space-y-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <button
                onClick={() => {
                  setSelectedTeam(team);
                  setShowPlayerModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir Jugador</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Jugador</th>
                    <th className="text-left py-2">Salario</th>
                    <th className="text-right py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {players[team.id]?.map(player => (
                    <tr key={player.id} className="border-b">
                      <td className="py-2">{player.name}</td>
                      <td className="py-2">{(salaries[player.id] / 100).toFixed(2)}€</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowPaymentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Historial de pagos */}
            {players[team.id]?.map(player => (
              payments[player.id]?.length > 0 && (
                <div key={`payments-${player.id}`} className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    Pagos de {player.name}
                  </h3>
                  <div className="space-y-2">
                    {payments[player.id].map(payment => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <span className="text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </span>
                          <span className="ml-2 font-medium">
                            {(payment.amount / 100).toFixed(2)}€
                          </span>
                        </div>
                        <button
                          onClick={() => handlePrintReceipt(payment, player, team)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ))}
      </div>

      {/* Modales */}
      {showTeamModal && (
        <SalaryTeamForm
          onClose={() => setShowTeamModal(false)}
          onSubmit={() => {
            setShowTeamModal(false);
            fetchSalaryTeams();
          }}
        />
      )}

      {showPlayerModal && selectedTeam && (
        <SalaryPlayerForm
          team={selectedTeam}
          onClose={() => {
            setShowPlayerModal(false);
            setSelectedTeam(null);
          }}
          onSubmit={() => {
            setShowPlayerModal(false);
            setSelectedTeam(null);
            fetchTeamPlayers(selectedTeam.id);
          }}
        />
      )}

      {showPaymentModal && selectedPlayer && (
        <PlayerSalaryPaymentForm
          player={selectedPlayer}
          currentSalary={salaries[selectedPlayer.id]}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlayer(null);
          }}
          onSubmit={() => {
            setShowPaymentModal(false);
            setSelectedPlayer(null);
            fetchPlayerPayments(selectedPlayer.id);
          }}
        />
      )}
    </div>
  );
}