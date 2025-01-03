import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Team } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export default function Teams() {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    
    setTeams(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingTeam) {
      const { error } = await supabase
        .from('teams')
        .update({ name: teamName })
        .eq('id', editingTeam.id);
      
      if (error) {
        console.error('Error updating team:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('teams')
        .insert([{ name: teamName }]);
      
      if (error) {
        console.error('Error creating team:', error);
        return;
      }
    }
    
    setShowModal(false);
    setTeamName('');
    setEditingTeam(null);
    fetchTeams();
  }

  async function handleDelete(teamId: string) {
    if (!confirm(t('confirmDeleteTeam'))) return;
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    
    if (error) {
      console.error('Error deleting team:', error);
      return;
    }
    
    fetchTeams();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teams')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>{t('addTeam')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-800"
          >
            <div className="flex justify-between items-center">
              <Link
                to={`/teams/${team.id}`}
                className="text-xl font-semibold hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                {team.name}
              </Link>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTeam(team);
                    setTeamName(team.name);
                    setShowModal(true);
                  }}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title={t('edit')}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title={t('delete')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {editingTeam ? t('editTeam') : t('addTeam')}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={t('teamName')}
                className="w-full border rounded-lg px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setTeamName('');
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {editingTeam ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}