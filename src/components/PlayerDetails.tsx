import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Player, Payment, Team } from '../types';
import { generateReceipt } from '../utils/receipt';
import PlayerForm from './PlayerForm';
import PaymentList from './PaymentList';
import { useTranslation } from '../hooks/useTranslation';

export default function PlayerDetails() {
  const { t } = useTranslation();
  const { playerId } = useParams<{ playerId: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    notes: '',
    payment_method: 'cash' as 'cash' | 'transfer',
    document: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayerAndTeam();
      fetchPayments();
    }
  }, [playerId]);

  async function fetchPlayerAndTeam() {
    try {
      setLoading(true);
      setError(null);

      // Fetch player with team data in a single query
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams:team_id (*)
        `)
        .eq('id', playerId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Jugador no encontrado');

      setPlayer(data);
      setTeam(data.teams);
    } catch (err: any) {
      console.error('Error fetching player:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
      setUploading(true);
      let document_url = null;

      // Upload document if payment is by transfer and there's a file
      if (paymentData.payment_method === 'transfer' && paymentData.document) {
        const fileName = `${Date.now()}-${paymentData.document.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-documents')
          .upload(fileName, paymentData.document);

        if (uploadError) throw uploadError;
        document_url = uploadData.path;
      }

      const receiptNumber = `REC-${Date.now()}`;
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          player_id: playerId,
          amount: Math.round(paymentData.amount * 100),
          receipt_number: receiptNumber,
          notes: paymentData.notes,
          payment_method: paymentData.payment_method,
          document_url
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
      setPaymentData({ amount: 0, notes: '', payment_method: 'cash', document: null });
      fetchPlayerAndTeam();
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a equipos</span>
        </Link>
      </div>
    );
  }

  if (!player || !team) return null;

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
          onDelete={(paymentId) => {
            setPayments(payments.filter(p => p.id !== paymentId));
            fetchPlayerAndTeam(); // Refresh player data to update paid amount
          }}
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
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Método de pago
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ 
                    ...paymentData, 
                    payment_method: e.target.value as 'cash' | 'transfer',
                    document: e.target.value === 'cash' ? null : paymentData.document
                  })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={uploading}
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              {paymentData.payment_method === 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Justificante de transferencia (PDF)
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPaymentData({ 
                        ...paymentData, 
                        document: e.target.files?.[0] || null 
                      })}
                      className="hidden"
                      id="document-upload"
                      required={paymentData.payment_method === 'transfer'}
                      disabled={uploading}
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <FileText className="h-5 w-5" />
                      <span>{paymentData.document ? paymentData.document.name : 'Subir documento'}</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('notes')}
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  disabled={uploading}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({ amount: 0, notes: '', payment_method: 'cash', document: null });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                  disabled={uploading}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>{t('registerPayment')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
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
              fetchPlayerAndTeam();
            } catch (error) {
              console.error('Error updating player:', error);
              alert('Error al actualizar el jugador');
            }
          }}
        />
      )}
    </div>
  );
}