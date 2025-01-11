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
  payment_method: 'cash' | 'transfer';
  document_url: string | null;
  created_at: string;
}

export interface PlayerSalaryPayment {
  id: string;
  player_id: string;
  amount: number;
  payment_date: string;
  receipt_number: string;
  notes: string | null;
  payment_method: 'cash' | 'transfer';
  document_url: string | null;
  created_at: string;
}

// ... (keep rest of the types)