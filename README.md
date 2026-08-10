# La Ograda

Site de prezentare și rezervări pentru **La Ograda**, cu disponibilitate
sincronizată automat din Booking.com și Airbnb (import iCal) și plăți online
prin NETOPIA (activare ulterioară, după deschiderea contului de comerciant).

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (stil `base-nova`, bazat pe [Base UI](https://base-ui.com))
- **Backend:** Next.js Route Handlers
- **Bază de date:** [Supabase](https://supabase.com) (Postgres)
- **Email:** [Resend](https://resend.com)
- **Plăți:** [NETOPIA Payments](https://netopia-payments.com) (card + carduri de vacanță, configurate ulterior)
- **Calendar:** import iCal din Booking.com și Airbnb
- **Hosting:** [Vercel](https://vercel.com)

> Notă: scheletul a fost generat cu `create-next-app@latest`, care la data
> scrierii instalează Next.js 16 (nu 15) — variantă mai recentă și recomandată
> de `create-next-app` însuși.

## Structură

```
src/
  app/
    page.tsx              — pagina principală (compune secțiunile de mai jos)
    layout.tsx             — layout global, metadata, header/footer, fonturi
    api/
      availability/        — GET: date ocupate, sincronizate din Booking + Airbnb
      bookings/             — POST: cerere de rezervare (validare + Supabase + email)
      contact/               — POST: formular de contact (email via Resend)
      payments/netopia/
        initiate/            — POST: pornește o plată NETOPIA pentru o rezervare
        ipn/                 — POST: notificare server-to-server de la NETOPIA
  components/
    site-header.tsx, site-footer.tsx
    sections/               — Hero, Facilități, Galerie, Rezervare, Prețuri, Contact
    ui/                     — componente shadcn/ui
  lib/
    ical.ts                 — descarcă + combină feed-urile iCal
    resend.ts               — emailuri tranzacționale
    netopia.ts               — integrare NETOPIA Payments API v2 (schelet)
    supabase/               — clienți Supabase (browser, server, admin)
  types/booking.ts          — scheme zod + tipuri partajate
supabase/schema.sql          — schema inițială (tabele bookings, contact_messages)
```

## Configurare locală

1. Instalează dependențele:

   ```bash
   npm install
   ```

2. Copiază `.env.example` în `.env.local` și completează valorile disponibile
   (site-ul funcționează și fără ele — funcțiile care au nevoie de o cheie
   lipsă doar afișează un mesaj de eroare/avertisment în loc să pice tot
   site-ul):

   ```bash
   cp .env.example .env.local
   ```

   - **Supabase**: creează un proiect, rulează [supabase/schema.sql](supabase/schema.sql)
     în SQL Editor, apoi copiază URL-ul și cheile din Project Settings → API.
   - **Resend**: generează o cheie API și un domeniu/adresă de expediere.
   - **Booking.com / Airbnb**: din contul de gazdă, exportă link-ul iCal al
     calendarului (Booking: Extranet → Calendar → Sync calendars → Export;
     Airbnb: Calendar → Availability settings → Connect to another website).
   - **NETOPIA**: se configurează mai târziu, după deschiderea contului de
     comerciant și obținerea domeniului `.ro`.

3. Rulează serverul de dezvoltare:

   ```bash
   npm run dev
   ```

   Deschide [http://localhost:3000](http://localhost:3000).

## Comenzi utile

```bash
npm run dev     # server de dezvoltare
npm run build   # build de producție (verifică și tipurile TypeScript)
npm run start   # rulează build-ul de producție
npm run lint    # ESLint
```

## Deploy

Proiectul este pregătit pentru [Vercel](https://vercel.com): conectează
repo-ul, adaugă variabilele de mediu din `.env.example` în setările
proiectului și fiecare push pe `main` va genera un deploy.

