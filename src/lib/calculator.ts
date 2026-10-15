import { Guest, FinancialStats, EventMeta } from './types';

export function calculateFinancials(guests: Guest[], meta?: EventMeta | null): FinancialStats {
  const ticketPrice = meta?.ticket_price || 39;
  const cateringSplit = meta?.catering_split || 25;
  const orgSplit = meta?.org_split || 14;

  const totalGuests = guests.length;
  
  // Only checked-in guests count towards cashbox and wristband totals on event night!
  const checkedIn = guests.filter(g => g.is_checked_in);
  const checkedInGuests = checkedIn.length;
  const pendingCheckIn = totalGuests - checkedInGuests;

  // Paid guests: checked in and paying (ticket_type === 'placa')
  const paid = checkedIn.filter(g => g.ticket_type === 'placa');
  const paidGuests = paid.length;

  // Free guests of Organizacija (Ela or Joe)
  const freeEla = checkedIn.filter(g => g.ticket_type === 'gratis' && g.team === 'Ela');
  const freeJoe = checkedIn.filter(g => g.ticket_type === 'gratis' && g.team === 'Joe');
  const freeOrgGuests = freeEla.length + freeJoe.length;

  // Free guests of Ugostiteljstvo (Dupli or Silvaši)
  const freeDupli = checkedIn.filter(g => g.ticket_type === 'gratis' && g.team === 'Dupli');
  const freeSilvasi = checkedIn.filter(g => g.ticket_type === 'gratis' && g.team === 'Silvaši');
  const freeCateringGuests = freeDupli.length + freeSilvasi.length;

  // Total cash in the cashbox
  const totalCashExpected = paidGuests * ticketPrice;

  // Gross revenue portions from paying guests
  const cateringGross = paidGuests * cateringSplit;
  const orgGross = paidGuests * orgSplit;

  // Debts between teams for their free guests
  // Organizacija owes Ugostiteljstvo 25 € for every free guest of Ela or Joe
  const orgOwesCatering = freeOrgGuests * cateringSplit;

  // Ugostiteljstvo owes Organizacija 14 € for every free guest of Dupli or Silvaši
  const cateringOwesOrg = freeCateringGuests * orgSplit;

  // Final net payouts
  const orgNet = orgGross + cateringOwesOrg - orgOwesCatering;
  const cateringNet = cateringGross + orgOwesCatering - cateringOwesOrg;

  const isClosed = meta?.is_closed ?? false;
  const actualCashCounted = meta?.actual_cash_counted;
  const cashDifference = (actualCashCounted !== undefined && actualCashCounted !== null)
    ? Number(actualCashCounted) - totalCashExpected
    : null;

  return {
    totalGuests,
    checkedInGuests,
    paidGuests,
    freeOrgGuests,
    freeCateringGuests,
    pendingCheckIn,

    freeElaCount: freeEla.length,
    freeJoeCount: freeJoe.length,
    freeDupliCount: freeDupli.length,
    freeSilvasiCount: freeSilvasi.length,

    ticketPrice,
    totalCashExpected,

    cateringGross,
    orgGross,

    orgOwesCatering,
    cateringOwesOrg,

    orgNet,
    cateringNet,

    isClosed,
    actualCashCounted,
    cashDifference,
  };
}
