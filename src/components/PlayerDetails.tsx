import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Printer, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Player, Payment, Team } from '../types';
import { generateReceipt } from '../utils/receipt';
import PlayerForm from './PlayerForm';
import PaymentList from './PaymentList';
import { useTranslation } from '../hooks/useTranslation';

export default function PlayerDetails() {
  const { t } = useTranslation();
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    notes: ''
  });

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
      fetchPayments();
    }
  }, [playerId]);

  async function fetchPlayer() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, teams(*)')
        .eq('id', playerId)
        .single();
      
      if (error) throw error;
      
      setPlayer(data);
      setTeam(data.teams);
    } catch (error) {
      console.error('Error fetching player:', error);
    }
  }

  async function fetchPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('player_id', playerId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const receiptNumber = `REC-${Date.now()}`;
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          player_id: playerId,
          amount: Math.round(paymentData.amount * 100),
          receipt_number: receiptNumber,
          notes: paymentData.notes
        }]);
      
      if (paymentError) throw paymentError;

      // Update player's paid amount
      if (player) {
        const { error: playerError } = await supabase
          .from('players')
          .update({
            paid_amount: player.paid_amount + Math.round(paymentData.amount * 100)
          })
          .eq('id', playerId);
        
        if (playerError) throw playerError;
      }
      
      setShowPaymentModal(false);
      setPaymentData({ amount: 0, notes: '' });
      fetchPlayer();
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  }

  async function handlePaymentDelete(paymentId: string) {
    try {
      // Get payment amount before deleting
      const payment = payments.find(p => p.id === paymentId);
      if (!payment || !player) return;

      // Delete payment
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
      
      if (deleteError) throw deleteError;

      // Update player's paid amount
      const { error: updateError } = await supabase
        .from('players')
        .update({
          paid_amount: player.paid_amount - payment.amount
        })
        .eq('id', playerId);
      
      if (updateError) throw updateError;

      // Update local state
      setPayments(payments.filter(p => p.id !== paymentId));
      setPlayer(prev => prev ? {
        ...prev,
        paid_amount: prev.paid_amount - payment.amount
      } : null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert(t('errorDeletingPayment'));
    }
  }

  function handlePrintReceipt(payment: Payment) {
    if (!player || !team) return;
    try {
      const doc = generateReceipt(payment, player, team);
      doc.save(`recibo-${payment.receipt_number}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  }

  if (!player) return null;

  const pendingAmount = (player.total_fee - player.paid_amount) / 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={`/teams/${player.team_id}`}
            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">{player.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            title={t('edit')}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('totalFees')}
          </h3>
          <p className="text-3xl font-bold dark:text-white">
            {(player.total_fee / 100).toFixed(2)}€
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('collected')}
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {(player.paid_amount / 100).toFixed(2)}€
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('pending')}
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {pendingAmount.toFixed(2)}€
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold dark:text-white">{t('payments')}</h2>
        {pendingAmount > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{t('registerPayment')}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
        <PaymentList
          payments={payments}
          onDelete={handlePaymentDelete}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{t('registerPayment')}</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('amount')} (€)
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0.01"
                  max={pendingAmount}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('notes')}
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({ amount: 0, notes: '' });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {t('registerPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && player && (
        <PlayerForm
          player={player}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (data) => {
            try {
              const { error } = await supabase
                .from('players')
                .update(data)
                .eq('id', player.id);
              
              if (error) throw error;
              
              setShowEditModal(false);
              fetchPlayer();
            } catch (error) {
              console.error('Error updating player:', error);
            }
          }}
        />
      )}
    </div>
  );
}