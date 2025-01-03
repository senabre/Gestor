import jsPDF from 'jspdf';
import { StaffPayment, StaffMember } from '../types';

export function generateStaffPaymentPDF(payment: StaffPayment, staff: StaffMember) {
  const doc = new jsPDF();
  
  // Configuración inicial
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  
  // Título
  doc.text("RECIBO DE PAGO - PERSONAL", 105, 20, { align: "center" });
  
  // Marco
  doc.rect(20, 40, 170, 160);
  
  // Datos del club
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Club Deportivo", 25, 50);
  
  // Información del recibo
  doc.setFont("helvetica", "normal");
  doc.text(`Nº Recibo: ${payment.receipt_number}`, 25, 65);
  doc.text(`Fecha: ${new Date(payment.payment_date).toLocaleDateString()}`, 25, 75);
  
  // Línea separadora
  doc.line(25, 85, 185, 85);
  
  // Datos del empleado
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL EMPLEADO", 25, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${staff.name}`, 25, 115);
  doc.text(`Cargo: ${staff.position}`, 25, 125);
  doc.text(`Email: ${staff.email}`, 25, 135);
  if (staff.phone) doc.text(`Teléfono: ${staff.phone}`, 25, 145);
  
  // Línea separadora
  doc.line(25, 155, 185, 155);
  
  // Importe
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTE", 25, 170);
  doc.setFontSize(16);
  doc.text(`${(payment.amount / 100).toFixed(2)} €`, 25, 185);
  
  // Notas
  if (payment.notes) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Notas:", 25, 205);
    doc.setFont("helvetica", "normal");
    doc.text(payment.notes, 25, 215);
  }
  
  // Pie de página
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento sirve como comprobante de pago", 105, 250, { align: "center" });
  
  return doc;
}