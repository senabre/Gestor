import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const SMTP_CONFIG = {
  hostname: 'smtp.gmail.com',
  port: 587,
  username: 'senabre20@gmail.com',
  password: Deno.env.get('GMAIL_APP_PASSWORD'),
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { to, subject, html, from } = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error('Missing required fields');
    }

    const client = new SmtpClient();

    try {
      await client.connectTLS(SMTP_CONFIG);
      await client.send({
        from: from || SMTP_CONFIG.username,
        to: [to],
        subject,
        content: html,
        html: true,
      });
      await client.close();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('SMTP error:', error);
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});