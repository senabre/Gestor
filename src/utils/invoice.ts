import jsPDF from 'jspdf';
import { Invoice } from '../types';

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();
  
  // Configuración inicial
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  
  // Título
  doc.text("FACTURA", 105, 20, { align: "center" });
  
  // Marco
  doc.rect(20, 40, 170, 220);
  
  // Información de la factura
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº Factura: ${invoice.number}`, 25, 50);
  doc.text(`Fecha: ${new Date(invoice.date).toLocaleDateString()}`, 25, 60);
  
  // Datos del cliente
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE", 25, 80);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.client_name, 25, 90);
  if (invoice.client_nif) doc.text(`NIF/CIF: ${invoice.client_nif}`, 25, 100);
  if (invoice.client_address) {
    const lines = doc.splitTextToSize(invoice.client_address, 160);
    doc.text(lines, 25, 110);
  }
  
  // Tabla de conceptos
  doc.setFont("helvetica", "bold");
  doc.text("CONCEPTO", 25, 140);
  doc.text("CANT.", 130, 140);
  doc.text("PRECIO", 150, 140);
  doc.text("IMPORTE", 170, 140);
  
  // Líneas de la factura
  doc.setFont("helvetica", "normal");
  let y = 150;
  invoice.items.forEach((item) => {
    const description = doc.splitTextToSize(item.description, 100);
    doc.text(description, 25, y);
    doc.text(item.quantity.toString(), 130, y, { align: "right" });
    doc.text((item.price).toFixed(2), 150, y, { align: "right" });
    doc.text((item.amount / 100).toFixed(2), 170, y, { align: "right" });
    y += 10 * Math.max(description.length, 1);
  });
  
  // Totales
  y = Math.max(y + 20, 220);
  doc.line(25, y - 10, 185, y - 10);
  
  doc.text("Base Imponible:", 130, y);
  doc.text(`${(invoice.subtotal / 100).toFixed(2)} €`, 170, y, { align: "right" });
  
  doc.text(`IVA (${invoice.tax_rate}%):`, 130, y + 10);
  doc.text(`${(invoice.tax_amount / 100).toFixed(2)} €`, 170, y + 10, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 130, y + 20);
  doc.text(`${(invoice.total / 100).toFixed(2)} €`, 170, y + 20, { align: "right" });
  
  // Notas
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const notes = doc.splitTextToSize(invoice.notes, 160);
    doc.text(notes, 25, y + 40);
  }
  
  doc.save(`factura-${invoice.number}.pdf`);
}