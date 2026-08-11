# LaOgrada

Site de prezentare și rezervări pentru **LaOgrada**, cu disponibilitate
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
    (site)/
      page.tsx            — pagina principală (compune secțiunile de mai jos)
      layout.tsx           — header + footer public, cu conținut din Supabase
    admin/
      login/               — autentificare (Supabase Auth)
      (protected)/          — protejat: rezervări, conținut, galerie (necesită login)
    layout.tsx              — layout global minim, metadata, fonturi, Toaster
    api/
      availability/        — GET: date ocupate, sincronizate din Booking + Airbnb
      bookings/             — POST: cerere de rezervare (validare + Supabase + email)
      contact/               — POST: formular de contact (email via Resend)
      admin/
        bookings/[id]/       — PATCH: schimbă statusul unei rezervări
        content/             — PUT: salvează textele/prețurile/facilitățile
        gallery/             — POST: încarcă o poză · [id] DELETE: șterge o poză
      payments/netopia/
        initiate/            — POST: pornește o plată NETOPIA pentru o rezervare
        ipn/                 — POST: notificare server-to-server de la NETOPIA
  components/
    site-header.tsx, site-footer.tsx
    sections/               — Hero, Facilități, Galerie, Rezervare, Prețuri, Contact
    admin/                  — formulare și acțiuni din panoul de admin
    ui/                     — componente shadcn/ui
  lib/
    ical.ts                 — descarcă + combină feed-urile iCal
    resend.ts               — emailuri tranzacționale
    netopia.ts               — integrare NETOPIA Payments API v2 (schelet)
    site-content.ts          — citește conținutul editabil din Supabase (cu fallback)
    amenity-icons.ts         — set fix de iconițe selectabile pentru facilități
    admin-auth.ts            — verifică login + lista de emailuri permise
    supabase/               — clienți Supabase (browser, server, admin)
  proxy.ts                  — reîmprospătează sesiunea Supabase, protejează /admin
  types/booking.ts          — scheme zod + tipuri partajate
supabase/schema.sql          — schema (bookings, site_settings, amenities, gallery_images)
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
   - **Resend** (trimitere email-uri): generează o cheie API în `RESEND_API_KEY`.
     `CONTACT_EMAIL_TO` e adresa unde ajung notificările (cereri de rezervare +
     mesaje de contact) — poate fi orice email funcțional (Gmail etc.), nu
     trebuie să fie neapărat `@laograda.ro`. Pentru a trimite chiar din
     `@laograda.ro` (`EMAIL_FROM`), după ce cumpărați domeniul trebuie să-l
     verificați în Resend (Domains → Add Domain → adăugați înregistrările DNS
     cerute); până atunci rămâne pe adresa implicită `onboarding@resend.dev`.
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

## Panou de admin (/admin)

Pentru ca proprietarii să poată edita singuri textele, prețurile,
facilitățile și pozele galeriei, fără să atingă codul:

1. Ai nevoie de un proiect Supabase configurat (vezi mai sus) — panoul de
   admin nu funcționează fără el.
2. În **Supabase Studio → Authentication → Providers → Email**, dezactivează
   "Allow new users to sign up" (nu vrem înregistrări publice).
3. În **Authentication → Users → Add user**, creează manual contul (email +
   parolă) pentru persoana care va administra site-ul.
4. Adaugă acel email în variabila `ADMIN_EMAILS` (separă prin virgulă dacă
   sunt mai multe conturi).
5. Intră pe `/admin/login` cu acel cont. De acolo poți:
   - **Rezervări** — confirmă sau anulează cererile primite prin site.
   - **Conținut** — editează textele, prețurile pe noapte și lista de facilități.
   - **Galerie** — încarcă sau șterge poze (stocate în Supabase Storage,
     bucket `gallery`, creat automat de `supabase/schema.sql`).

Accesul e verificat de două ori, independent (o practică de securitate
standard): o dată în [src/proxy.ts](src/proxy.ts) (redirect rapid dacă nu ești
autentificat) și o dată în fiecare pagină/rută din `/admin` prin
[requireAdminUser](src/lib/admin-auth.ts) — chiar dacă cineva ar ocoli
prima verificare, a doua tot blochează accesul.

