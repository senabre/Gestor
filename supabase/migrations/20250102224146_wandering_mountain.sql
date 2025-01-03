/*
  # Sistema de Facturación

  1. Nueva Tabla
    - `invoices`
      - `id` (uuid, primary key)
      - `number` (text, número de factura)
      - `date` (timestamptz, fecha de emisión)
      - `client_name` (text, nombre del cliente)
      - `client_nif` (text, NIF/CIF del cliente)
      - `client_address` (text, dirección del cliente)
      - `items` (jsonb, líneas de factura)
      - `subtotal` (integer, subtotal en céntimos)
      - `tax_rate` (integer, porcentaje de IVA)
      - `tax_amount` (integer, importe de IVA en céntimos)
      - `total` (integer, total en céntimos)
      - `notes` (text, notas adicionales)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en la tabla `invoices`
    - Añadir política para usuarios autenticados
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  client_name text NOT NULL,
  client_nif text,
  client_address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal integer NOT NULL DEFAULT 0,
  tax_rate integer NOT NULL DEFAULT 21,
  tax_amount integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON invoices
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);