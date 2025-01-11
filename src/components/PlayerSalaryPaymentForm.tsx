import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Player } from '../types';
import { FileText } from 'lucide-react';

interface PlayerSalaryPaymentFormProps {
  player: Player;
  currentSalary: number;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PlayerSalaryPaymentForm({
  player,
  currentSalary,
  onClose,
  onSubmit
}: PlayerSalaryPaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: currentSalary / 100,
    notes: '',
    payment_method: 'cash' as 'cash' | 'transfer',
    document: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    
    try {
      let document_url = null;

      // Upload document if payment is by transfer and there's a file
      if (formData.payment_method === 'transfer' && formData.document) {
        const fileName = `${Date.now()}-${formData.document.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-documents')
          .upload(fileName, formData.document);

        if (uploadError) throw uploadError;
        document_url = uploadData.path;
      }

      const receiptNumber = `REC-PLAYER-${Date.now()}`;
      
      const { error: paymentError } = await supabase
        .from('player_salary_payments')
        .insert([{
          player_id: player.id,
          amount: Math.round(formData.amount * 100),
          receipt_number: receiptNumber,
          notes: formData.notes,
          payment_method: formData.payment_method,
          document_url
        }]);
      
      if (paymentError) throw paymentError;
      
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Importe (€)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              min="0.01"
              step="0.01"
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Método de pago
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ 
                ...formData, 
                payment_method: e.target.value as 'cash' | 'transfer',
                document: e.target.value === 'cash' ? null : formData.document
              })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              disabled={uploading}
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          {formData.payment_method === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Justificante de transferencia (PDF)
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    document: e.target.files?.[0] || null 
                  })}
                  className="hidden"
                  id="document-upload"
                  required={formData.payment_method === 'transfer'}
                  disabled={uploading}
                />
                <label
                  htmlFor="document-upload"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5" />
                  <span>{formData.document ? formData.document.name : 'Subir documento'}</span>
                </label>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
              disabled={uploading}
            >
              Cancelar
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
                <span>Registrar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}