import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, cc, subject, playerName, amount, receiptNumber, date, pdfBase64 } = await req.json();

    // Validar datos requeridos
    if (!to || !subject || !playerName || !amount || !receiptNumber || !date || !pdfBase64) {
      throw new Error('Faltan datos requeridos');
    }

    // Configurar cliente SMTP con manejo de errores mejorado
    const client = new SmtpClient();
    
    try {
      await client.connectTLS({
        hostname: Deno.env.get('SMTP_HOSTNAME') || '',
        port: Number(Deno.env.get('SMTP_PORT')) || 587,
        username: Deno.env.get('SMTP_USERNAME') || '',
        password: Deno.env.get('SMTP_PASSWORD') || '',
      });
    } catch (error) {
      console.error('Error de conexión SMTP:', error);
      throw new Error('No se pudo conectar al servidor de correo');
    }

    // Crear contenido del email con mejor formato
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            .details { background: #f3f4f6; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Recibo de Pago</h1>
            <p>Estimado/a ${playerName},</p>
            <p>Se ha registrado un pago por el siguiente importe:</p>
            <div class="details">
              <p><strong>Importe:</strong> ${(amount / 100).toFixed(2)}€</p>
              <p><strong>Número de recibo:</strong> ${receiptNumber}</p>
              <p><strong>Fecha:</strong> ${new Date(date).toLocaleDateString()}</p>
            </div>
            <p>Adjunto encontrará el recibo en formato PDF.</p>
            <div class="footer">
              <p>Saludos cordiales,<br>Club Deportivo</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email con mejor manejo de errores
    try {
      await client.send({
        from: Deno.env.get('SMTP_FROM') || '',
        to: [to],
        ...(cc && { cc: [cc] }),
        subject,
        html: htmlBody,
        attachments: [{
          filename: `recibo-${receiptNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf'
        }]
      });
    } catch (error) {
      console.error('Error al enviar el email:', error);
      throw new Error('No se pudo enviar el email');
    } finally {
      await client.close();
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error en el servidor:', error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});