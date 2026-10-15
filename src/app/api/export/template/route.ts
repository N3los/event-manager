import { NextResponse } from 'next/server';

export async function GET() {
  const sampleCsv = [
    'Ime i prezime,Rezervacija preko,Ulaznica,Cijena (€),Stol,Rezervacija,Napomena',
    'Aleksandra Žitko,Ela,Plaća,39.00 €,Stol 1,Na čekanju,Vidjeti koliko ljudi',
    'Bruno Antunac,Ela,Plaća,39.00 €,Stol 2,Potvrđeno,',
    'Darko Stojaković,Ela,Gratis,0.00 €,Stol 2,Potvrđeno,',
    'Mario Žužić,Joe,Plaća,39.00 €,Stol 2,Potvrđeno,"Ide popust na hordu, Joe obaviješten"',
    'Stribor Marinčić,Ela,Gratis,0.00 €,,Potvrđeno,Fotograf',
    'Maja Duplić,Dupli,Gratis,0.00 €,,Potvrđeno,',
    'Ivan Horvat,Silvaši,Gratis,0.00 €,,Potvrđeno,',
    'Marko Marković,Regularni,Plaća,39.00 €,,Potvrđeno,',
  ].join('\n');

  return new NextResponse(sampleCsv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="poor_decisions_guest_predlozak.csv"',
    },
  });
}
