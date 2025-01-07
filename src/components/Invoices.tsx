import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { generateInvoicePDF } from '../utils/invoice';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_nif: '',
    client_address: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    tax_rate: 21,
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
      return;
    }
    
    setInvoices(data);
  }

  function calculateTotals(items: typeof formData.items) {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity * item.price * 100), 0);
    const taxAmount = Math.round(subtotal * (formData.tax_rate / 100));
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const items = formData.items.map(item => ({
      ...item,
      amount: item.quantity * item.price * 100
    }));
    
    const { subtotal, taxAmount, total } = calculateTotals(formData.items);
    
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    
    const { error } = await supabase
      .from('invoices')
      .insert([{
        number: invoiceNumber,
        ...formData,
        items,
        subtotal,
        tax_amount: taxAmount,
        total
      }]);
    
    if (error) {
      console.error('Error creating invoice:', error);
      return;
    }
    
    setShowModal(false);
    setFormData({
      client_name: '',
      client_nif: '',
      client_address: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      tax_rate: 21,
      notes: ''
    });
    fetchInvoices();
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nueva Factura</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="min-w-full">
          <div className="bg-gray-50 border-b">
            <div className="grid grid-cols-7 md:grid-cols-8 gap-2 px-4 py-3">
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Número</div>
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Cliente</div>
              <div className="hidden md:block text-xs font-medium text-gray-500 uppercase">Base</div>
              <div className="text-xs font-medium text-gray-500 uppercase">IVA</div>
              <div className="text-xs font-medium text-gray-500 uppercase">Total</div>
              <div className="text-right text-xs font-medium text-gray-500 uppercase">Acciones</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-7 md:grid-cols-8 gap-2 px-4 py-3 hover:bg-gray-50">
                <div className="col-span-2 truncate">{invoice.number}</div>
                <div className="col-span-2 truncate">{invoice.client_name}</div>
                <div className="hidden md:block">{(invoice.subtotal / 100).toFixed(2)}€</div>
                <div>{(invoice.tax_amount / 100).toFixed(2)}€</div>
                <div>{(invoice.total / 100).toFixed(2)}€</div>
                <div className="text-right">
                  <button
                    onClick={() => generateInvoicePDF(invoice)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Descargar PDF"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nueva Factura</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIF/CIF</label>
                  <input
                    type="text"
                    value={formData.client_nif}
                    onChange={(e) => setFormData({ ...formData, client_nif: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <textarea
                  value={formData.client_address}
                  onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Líneas de Factura
                </label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].description = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="Descripción"
                          className="w-full border rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="Cantidad"
                          className="w-full border rounded-lg px-3 py-2"
                          min="1"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].price = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="Precio"
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full text-red-600 hover:text-red-800 px-3 py-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...formData.items, { description: '', quantity: 1, price: 0 }]
                  })}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Añadir línea
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">IVA (%)</label>
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    rows={1}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      client_name: '',
                      client_nif: '',
                      client_address: '',
                      items: [{ description: '', quantity: 1, price: 0 }],
                      tax_rate: 21,
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Crear Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}