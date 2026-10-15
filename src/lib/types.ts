export type TeamType = 'Ela' | 'Joe' | 'Dupli' | 'Silvaši' | 'Regularni';

export type TicketType = 'placa' | 'gratis';

export type ReservationStatus = 'potvrdjeno' | 'na_cekanju';

export type PaymentStatus = 'placeno' | 'gratis' | 'neplaceno';

export interface Guest {
  id: number;
  name: string;
  team: TeamType;
  ticket_type: TicketType;
  price: number;
  table_name: string;
  reservation_status: ReservationStatus;
  is_checked_in: boolean;
  checked_in_at?: string | null;
  payment_status: PaymentStatus;
  wristband_issued: boolean;
  note: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventMeta {
  id: string;
  name: string;
  ticket_price: number;
  catering_split: number;
  org_split: number;
  is_closed: boolean;
  actual_cash_counted?: number | null;
  closed_at?: string | null;
  closed_notes?: string | null;
}

export interface FinancialStats {
  // Headcounts
  totalGuests: number;
  checkedInGuests: number;
  paidGuests: number;
  freeOrgGuests: number;       // Ela + Joe
  freeCateringGuests: number;  // Dupli + Silvaši
  pendingCheckIn: number;

  // Breakdown by person
  freeElaCount: number;
  freeJoeCount: number;
  freeDupliCount: number;
  freeSilvasiCount: number;

  // Financials
  ticketPrice: number;
  totalCashExpected: number;   // paidGuests * 39

  // Gross
  cateringGross: number;        // paidGuests * 25
  orgGross: number;             // paidGuests * 14

  // Debts
  orgOwesCatering: number;      // freeOrgGuests * 25
  cateringOwesOrg: number;      // freeCateringGuests * 14

  // Net payouts
  orgNet: number;               // orgGross + cateringOwesOrg - orgOwesCatering
  cateringNet: number;          // cateringGross + orgOwesCatering - cateringOwesOrg

  // Event close check
  isClosed: boolean;
  actualCashCounted?: number | null;
  cashDifference?: number | null; // actualCashCounted - totalCashExpected
}
