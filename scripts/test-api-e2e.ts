import { initDb, addGuest, getGuests, checkInGuest, undoCheckIn, closeEvent, reopenEvent, getEventMeta } from '../src/lib/db';
import { calculateFinancials } from '../src/lib/calculator';

async function runEndToEndTest() {
  console.log('=== STARTING END-TO-END VERIFICATION TEST ===\n');

  // 1. Init DB
  await initDb();
  console.log('1. Database initialized successfully.');

  // 2. Add regular walk-in guest
  const walkin1 = await addGuest({
    name: 'Marko Marković (Walk-in)',
    team: 'Regularni',
    ticket_type: 'placa',
    table_name: 'Stol 1',
    note: 'Ulaz na licu mjesta',
    is_checked_in: false,
  });
  console.log('2. Added walk-in guest:', walkin1.name, 'ID:', walkin1.id);

  // 3. Add Ela's free guest
  const elaGuest = await addGuest({
    name: 'Dora Doranović',
    team: 'Ela',
    ticket_type: 'gratis',
    table_name: 'Stol 2',
    note: 'Prijateljica od Ele',
    is_checked_in: false,
  });
  console.log('3. Added Ela free guest:', elaGuest.name, 'ID:', elaGuest.id);

  // 4. Add Dupli's free guest
  const dupliGuest = await addGuest({
    name: 'Goran Horvat',
    team: 'Dupli',
    ticket_type: 'gratis',
    table_name: 'Stol 3',
    note: 'Brat od Duplog',
    is_checked_in: false,
  });
  console.log('4. Added Dupli free guest:', dupliGuest.name, 'ID:', dupliGuest.id);

  // 5. Check in Marko (paying 39 €)
  await checkInGuest(walkin1.id);
  console.log('5. Checked in Marko (Paid 39 €).');

  // 6. Check in Dora (Free Ela guest)
  await checkInGuest(elaGuest.id);
  console.log('6. Checked in Dora (Free Ela guest).');

  // 7. Check in Goran (Free Dupli guest)
  await checkInGuest(dupliGuest.id);
  console.log('7. Checked in Goran (Free Dupli guest).');

  // 8. Calculate stats
  let guests = await getGuests();
  let meta = await getEventMeta();
  let stats = calculateFinancials(guests, meta);

  console.log('\n--- TRENUTNO STANJE OBRAČUNA ---');
  console.log('Ukupno u dvorani:', stats.checkedInGuests);
  console.log('Plaćenih narukvica:', stats.paidGuests);
  console.log('Gotovina u blagajni (1 × 39 €):', stats.totalCashExpected, '€');
  console.log('Dug Organizacije prema Ugostiteljstvu (1 × 25 €):', stats.orgOwesCatering, '€');
  console.log('Dug Ugostiteljstva prema Organizaciji (1 × 14 €):', stats.cateringOwesOrg, '€');
  console.log('Ugostiteljstvo neto: (25 + 25 - 14) =', stats.cateringNet, '€');
  console.log('Organizacija neto: (14 + 14 - 25) =', stats.orgNet, '€');
  console.log('Zbroj neto iznosa:', stats.cateringNet + stats.orgNet, '€ ===', stats.totalCashExpected, '€ gotovine');

  if (stats.cateringNet !== 36 || stats.orgNet !== 3) {
    throw new Error(`Krivi izračun! Ugostiteljstvo: ${stats.cateringNet} (očekivano 36), Organizacija: ${stats.orgNet} (očekivano 3)`);
  }

  // 9. Test Undo / Storno
  console.log('\n9. Testiranje storna (poništenje unosa za Gorana)...');
  await undoCheckIn(dupliGuest.id);
  guests = await getGuests();
  stats = calculateFinancials(guests, meta);
  console.log('Nakon storna Gorana: u dvorani:', stats.checkedInGuests, 'Ugostiteljstvo duguje:', stats.cateringOwesOrg, '€ (očekivano 0 €)');
  if (stats.cateringOwesOrg !== 0) throw new Error('Storno nije ispravno resetirao dug!');

  // 10. Close Event with cash count
  console.log('\n10. Testiranje zaključivanja eventa s gotovinom u blagajni...');
  const closedMeta = await closeEvent(39, 'Sve točno prebrojano');
  stats = calculateFinancials(guests, closedMeta);
  console.log('Event zaključen:', stats.isClosed);
  console.log('Prebrojana gotovina:', stats.actualCashCounted, '€, Razlika:', stats.cashDifference, '€');
  if (!stats.isClosed || stats.cashDifference !== 0) throw new Error('Zaključivanje eventa nije uspjelo!');

  // 11. Reopen Event
  console.log('\n11. Ponovno otvaranje eventa...');
  const reopened = await reopenEvent();
  stats = calculateFinancials(guests, reopened);
  console.log('Event ponovno otvoren:', !stats.isClosed);
  if (stats.isClosed) throw new Error('Otvaranje eventa nije uspjelo!');

  console.log('\n🎉 SVI END-TO-END TESTOVI USPJEŠNO PROŠLI BEZ GREŠKE!');
}

runEndToEndTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
