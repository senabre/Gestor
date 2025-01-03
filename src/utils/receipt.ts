import jsPDF from 'jspdf';
import { Payment, Player, Team } from '../types';

export function generateReceipt(payment: Payment, player: Player, team: Team) {
  const doc = new jsPDF();
  
  // Configuración inicial
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  
  // Título
  doc.text("RECIBO", 105, 20, { align: "center" });
  
  // Información del recibo
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  // Marco
  doc.rect(20, 40, 170, 160);
  
  // Datos del club
  doc.setFont("helvetica", "bold");
  doc.text("Club Deportivo", 25, 50);
  
  // Información del recibo
  doc.setFont("helvetica", "normal");
  doc.text(`Nº Recibo: ${payment.receipt_number}`, 25, 65);
  doc.text(`Fecha: ${new Date(payment.payment_date).toLocaleDateString()}`, 25, 75);
  
  // Línea separadora
  doc.line(25, 85, 185, 85);
  
  // Datos del jugador
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL JUGADOR", 25, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${player.name}`, 25, 115);
  doc.text(`Equipo: ${team.name}`, 25, 125);
  if (player.email) doc.text(`Email: ${player.email}`, 25, 135);
  if (player.phone) doc.text(`Teléfono: ${player.phone}`, 25, 145);
  
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
  doc.text("Gracias por su pago", 105, 250, { align: "center" });
  
  return doc;
}