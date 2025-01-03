// Email template functions
export function generateReceiptEmailTemplate(
  playerName: string,
  receiptNumber: string,
  amount: number,
  date: Date
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .details { margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recibo de Pago</h1>
          </div>
          <div class="details">
            <p>Estimado/a ${playerName},</p>
            <p>Se ha registrado correctamente su pago con los siguientes detalles:</p>
            <ul>
              <li>Número de recibo: ${receiptNumber}</li>
              <li>Importe: ${(amount / 100).toFixed(2)}€</li>
              <li>Fecha: ${date.toLocaleDateString()}</li>
            </ul>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br>Club Deportivo</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generatePaymentReminderTemplate(
  playerName: string,
  amount: number,
  dueDate: Date
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .details { margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recordatorio de Pago</h1>
          </div>
          <div class="details">
            <p>Estimado/a ${playerName},</p>
            <p>Le recordamos que tiene un pago pendiente:</p>
            <ul>
              <li>Importe pendiente: ${(amount / 100).toFixed(2)}€</li>
              <li>Fecha límite: ${dueDate.toLocaleDateString()}</li>
            </ul>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br>Club Deportivo</p>
          </div>
        </div>
      </body>
    </html>
  `;
}