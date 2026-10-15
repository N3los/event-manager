# POOR DECISIONS — Event Manager & Calculator 🎟️💶

Web aplikacija za vođenje popisa gostiju na ulazu, evidenciju izdanih narukvica i automatski financijski obračun zajedničke blagajne za event **POOR DECISIONS**.

---

## ⚡ Ključne značajke

- **📱 Mobile-First Door Check-In**:
  - Brza tražilica gostiju (pretraživanje po imenu, stolu, timu ili napomeni).
  - Čista lista s krupnim imenima i detaljima (stol, pozivatelj, ulaznica, napomene).
  - Klik na gosta otvara **Bottom Sheet** s detaljima i brzim izmjenama.
  - Veliki dodirni gumbi za palac: `POTVRDI & NAPLATI 39 €` / `POTVRDI BESPLATAN ULAZ` / `STORNO`.
  - Plutajući navigacijski bar: `Ulaz`, `Stolovi`, `+ Novi gost` (walk-in).
- **💰 Financijski obračun i raspodjela**:
  - Ulaznica: **39 €** (25 € Ugostiteljstvo, 14 € Organizacija).
  - Zajednička gotovinska blagajna na ulazu.
  - Automatski proračun međusobnih dugovanja za gratis goste (Ela/Joe vs Dupli/Silvaši).
  - Matematička ravnoteža: $\text{Neto}_{org} + \text{Neto}_{ugost} \equiv \text{Gotovina u blagajni}$.
- **📥 Uvoz gostiju**:
  - Direktno učitavanje iz **Google Sheets javnog linka**.
  - Podrška za `.csv` datoteke i ručno lijepljenje teksta.
- **🗺️ Raspored po stolovima**:
  - Grupiranje gostiju po stolovima (`Stol 1`, `Stol 2`...) s postotkom dolaska.
- **📄 Zaključak eventa & PDF izvještaj**:
  - Brojanje gotovine u blagajni i provjera viška/manjka.
  - Formatiran A4 PDF pregled za ispis i slanje na WhatsApp.
- **🔐 PIN Zaštita**:
  - Sigurnosni Login / Lock screen (Zadani PIN: `1234`).
  - Brza tipka za odjavu i zaključavanje ekrana.

---

## 🛠️ Tehnologije

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Jezik**: TypeScript
- **Stilovi**: Tailwind CSS
- **Baza podataka**: [Neon PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`) s automatskim lokalnim fallbackom
- **Ikone**: Lucide React

---

## 🚀 Pokretanje lokalno

1. **Instalacija paketa**:
   ```bash
   npm install
   ```

2. **Konfiguracija varijabli okruženja (opcionalno)**:
   Kopirajte `.env.example` u `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *Napomena: Ako `DATABASE_URL` nije postavljen, aplikacija automatski koristi lokalnu pohranu u `.data/store.json`.*

3. **Pokretanje razvojnog poslužitelja**:
   ```bash
   npm run dev
   ```

   Otvorite [http://localhost:3000](http://localhost:3000) (ili `http://localhost:3001`).

---

## 🧪 Testovi

Provjera matematičkog modela i API-ja:
```bash
npx tsx scripts/test-calculator.ts
npx tsx scripts/test-api-e2e.ts
```
