import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StaffMember, Team, StaffPayment } from '../types';
import StaffForm from './StaffForm';
import StaffPaymentForm from './StaffPaymentForm';
import { generateStaffPaymentPDF } from '../utils/staffPayment';

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [payments, setPayments] = useState<Record<string, StaffPayment[]>>({});

  useEffect(() => {
    fetchStaff();
    fetchTeams();
  }, []);

  async function fetchStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('*, teams(*)');
    
    if (error) {
      console.error('Error fetching staff:', error);
      return;
    }
    
    setStaff(data);
    
    // Fetch payments for each staff member
    data.forEach(member => {
      fetchPayments(member.id);
    });
  }

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    
    setTeams(data);
  }

  async function fetchPayments(staffId: string) {
    const { data, error } = await supabase
      .from('staff_payments')
      .select('*')
      .eq('staff_id', staffId)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }
    
    setPayments(prev => ({
      ...prev,
      [staffId]: data
    }));
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) return;
    
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting staff member:', error);
      return;
    }
    
    fetchStaff();
  }

  function handlePrintReceipt(payment: StaffPayment, member: StaffMember) {
    try {
      const doc = generateStaffPaymentPDF(payment, member);
      doc.save(`recibo-${payment.receipt_number}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personal</h1>
        <button
          onClick={() => {
            setEditingStaff(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Añadir Empleado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{member.name}</h2>
                <p className="text-gray-600">{member.position}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedStaff(member);
                    setShowPaymentModal(true);
                  }}
                  className="text-gray-600 hover:text-green-600"
                  title="Registrar pago"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingStaff(member);
                    setShowModal(true);
                  }}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {member.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Teléfono:</span> {member.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">Salario:</span>{' '}
                {(member.salary / 100).toFixed(2)}€
              </p>
              {member.team_id && (
                <p className="text-sm">
                  <span className="font-medium">Equipo:</span>{' '}
                  {teams.find(t => t.id === member.team_id)?.name}
                </p>
              )}
            </div>

            {/* Historial de pagos */}
            {payments[member.id] && payments[member.id].length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Últimos pagos</h3>
                <div className="space-y-2">
                  {payments[member.id].slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-600">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </span>
                        <span className="ml-2 font-medium">
                          {(payment.amount / 100).toFixed(2)}€
                        </span>
                      </div>
                      <button
                        onClick={() => handlePrintReceipt(payment, member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <StaffForm
          staff={editingStaff}
          teams={teams}
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
          }}
          onSubmit={() => {
            setShowModal(false);
            setEditingStaff(null);
            fetchStaff();
          }}
        />
      )}

      {showPaymentModal && selectedStaff && (
        <StaffPaymentForm
          staff={selectedStaff}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStaff(null);
          }}
          onSubmit={() => {
            setShowPaymentModal(false);
            setSelectedStaff(null);
            fetchPayments(selectedStaff.id);
          }}
        />
      )}
    </div>
  );
}