export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_fee: number;
  paid_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  player_id: string;
  amount: number;
  payment_date: string;
  receipt_number: string;
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  client_name: string;
  client_nif: string | null;
  client_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  salary: number;
  team_id: string | null;
  created_at: string;
  teams?: Team;
}

export interface StaffPayment {
  id: string;
  staff_id: string;
  amount: number;
  payment_date: string;
  receipt_number: string;
  notes: string | null;
  created_at: string;
}

export interface PlayerSalary {
  id: string;
  player_id: string;
  salary: number;
  created_at: string;
}

export interface PlayerSalaryPayment {
  id: string;
  player_id: string;
  amount: number;
  payment_date: string;
  receipt_number: string;
  notes: string | null;
  created_at: string;
}