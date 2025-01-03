import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Team, Player } from '../types';
import { CreditCard } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface TeamWithStats {
  id: string;
  name: string;
  totalPlayers: number;
  totalFees: number;
  totalPaid: number;
  totalPending: number;
}

export default function Fees() {
  const { t } = useTranslation();
  const [teamsStats, setTeamsStats] = useState<TeamWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamsWithStats();
  }, []);

  async function fetchTeamsWithStats() {
    try {
      setLoading(true);
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      const stats = teams.map(team => {
        const teamPlayers = players.filter(p => p.team_id === team.id);
        const totalFees = teamPlayers.reduce((sum, p) => sum + p.total_fee, 0);
        const totalPaid = teamPlayers.reduce((sum, p) => sum + p.paid_amount, 0);

        return {
          id: team.id,
          name: team.name,
          totalPlayers: teamPlayers.length,
          totalFees,
          totalPaid,
          totalPending: totalFees - totalPaid
        };
      });

      setTeamsStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalStats = teamsStats.reduce(
    (acc, team) => ({
      players: acc.players + team.totalPlayers,
      fees: acc.fees + team.totalFees,
      paid: acc.paid + team.totalPaid,
      pending: acc.pending + team.totalPending
    }),
    { players: 0, fees: 0, paid: 0, pending: 0 }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('teamFees')}</h1>

      {/* General summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('totalPlayers')}
          </h3>
          <p className="text-2xl font-bold dark:text-white">{totalStats.players}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('totalFees')}
          </h3>
          <p className="text-2xl font-bold dark:text-white">
            {(totalStats.fees / 100).toFixed(2)}€
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('totalCollected')}
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(totalStats.paid / 100).toFixed(2)}€
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('totalPending')}
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {(totalStats.pending / 100).toFixed(2)}€
          </p>
        </div>
      </div>

      {/* Team list */}
      <div className="grid grid-cols-1 gap-6">
        {teamsStats.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold dark:text-white">{team.name}</h2>
              </div>
              <Link
                to={`/teams/${team.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('viewDetails')} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('players')}</p>
                <p className="text-lg font-semibold dark:text-white">{team.totalPlayers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalFees')}</p>
                <p className="text-lg font-semibold dark:text-white">
                  {(team.totalFees / 100).toFixed(2)}€
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('collected')}</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {(team.totalPaid / 100).toFixed(2)}€
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('pending')}</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {(team.totalPending / 100).toFixed(2)}€
                </p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 dark:bg-gray-700">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                      {t('collectionProgress')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                      {team.totalFees > 0
                        ? Math.round((team.totalPaid / team.totalFees) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900">
                  <div
                    style={{
                      width: `${team.totalFees > 0
                        ? Math.round((team.totalPaid / team.totalFees) * 100)
                        : 0}%`
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}