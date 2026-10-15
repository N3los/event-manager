import { calculateFinancials } from '../src/lib/calculator';
import { Guest, EventMeta } from '../src/lib/types';

function createGuest(id: number, name: string, team: any, ticket_type: 'placa' | 'gratis', is_checked_in = true): Guest {
  return {
    id,
    name,
    team,
    ticket_type,
    price: ticket_type === 'gratis' ? 0 : 39,
    table_name: 'Stol 1',
    reservation_status: 'potvrdjeno',
    is_checked_in,
    checked_in_at: new Date().toISOString(),
    payment_status: ticket_type === 'placa' ? 'placeno' : 'gratis',
    wristband_issued: is_checked_in,
    note: '',
  };
}

console.log('--- TEST 1: 100 regularnih plaćenih gostiju ---');
const guestsTest1: Guest[] = [];
for (let i = 1; i <= 100; i++) {
  guestsTest1.push(createGuest(i, `Gost ${i}`, 'Regularni', 'placa'));
}
const res1 = calculateFinancials(guestsTest1);
console.log('Gotovina u blagajni:', res1.totalCashExpected, '€ (Očekivano: 3900 €)');
console.log('Ugostiteljstvo neto:', res1.cateringNet, '€ (Očekivano: 2500 €)');
console.log('Organizacija neto:', res1.orgNet, '€ (Očekivano: 1400 €)');
console.log('Zbroj neto iznosa:', res1.cateringNet + res1.orgNet, '€ (Ravnoteža:', res1.cateringNet + res1.orgNet === res1.totalCashExpected, ')');
if (res1.totalCashExpected !== 3900 || res1.cateringNet !== 2500 || res1.orgNet !== 1400) {
  throw new Error('Test 1 failed!');
}

console.log('\n--- TEST 2: 70 plaćenih, 5 besplatnih Organizacije (Ela/Joe), 4 besplatna Ugostiteljstva (Dupli/Silvaši) ---');
const guestsTest2: Guest[] = [];
for (let i = 1; i <= 70; i++) guestsTest2.push(createGuest(i, `Plaćeni ${i}`, 'Regularni', 'placa'));
for (let i = 71; i <= 73; i++) guestsTest2.push(createGuest(i, `Ela gost ${i}`, 'Ela', 'gratis'));
for (let i = 74; i <= 75; i++) guestsTest2.push(createGuest(i, `Joe gost ${i}`, 'Joe', 'gratis'));
for (let i = 76; i <= 77; i++) guestsTest2.push(createGuest(i, `Dupli gost ${i}`, 'Dupli', 'gratis'));
for (let i = 78; i <= 79; i++) guestsTest2.push(createGuest(i, `Silvaši gost ${i}`, 'Silvaši', 'gratis'));

const res2 = calculateFinancials(guestsTest2);
console.log('Gotovina u blagajni:', res2.totalCashExpected, '€ (Očekivano: 2730 €)');
console.log('Dug Organizacije prema Ugostiteljstvu (5 × 25 €):', res2.orgOwesCatering, '€');
console.log('Dug Ugostiteljstva prema Organizaciji (4 × 14 €):', res2.cateringOwesOrg, '€');
console.log('Ugostiteljstvo neto:', res2.cateringNet, '€ (Očekivano: 1819 €)');
console.log('Organizacija neto:', res2.orgNet, '€ (Očekivano: 911 €)');
console.log('Zbroj neto iznosa:', res2.cateringNet + res2.orgNet, '€ (Ravnoteža:', res2.cateringNet + res2.orgNet === res2.totalCashExpected, ')');
if (res2.totalCashExpected !== 2730 || res2.cateringNet !== 1819 || res2.orgNet !== 911) {
  throw new Error('Test 2 failed!');
}

console.log('\n--- TEST 3: Provjera manjka/viška u blagajni (Zaključak eventa) ---');
const metaClosed: EventMeta = {
  id: 'current',
  name: 'POOR DECISIONS',
  ticket_price: 39,
  catering_split: 25,
  org_split: 14,
  is_closed: true,
  actual_cash_counted: 2691, // Fali točno 1 ulaznica (39 € manjak)
};
const res3 = calculateFinancials(guestsTest2, metaClosed);
console.log('Evidentirana gotovina:', res3.totalCashExpected, '€');
console.log('Prebrojana gotovina:', res3.actualCashCounted, '€');
console.log('Razlika (Manjak):', res3.cashDifference, '€ (Očekivano: -39 €)');
if (res3.cashDifference !== -39) {
  throw new Error('Test 3 failed!');
}

console.log('\n✅ SVI TESTOVI MATEMATIČKOG MODELA USPJEŠNO PROŠLI!');
