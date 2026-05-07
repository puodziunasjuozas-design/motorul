
## Apimtis

### 1. Atsiliepimų patvirtinimas admin lange
- Admin tab "Atsiliepimai": rodo visus (ir nepatvirtintus), su mygtukais **Patvirtinti / Atmesti / Trinti**.
- Naujas RLS policy: tik admin gali `UPDATE is_approved` ant `user_testimonials`.
- Naujas testimonial įrašomas su `is_approved = false` (jau taip).

### 2. Atsiliepimų rašymo sąlyga
- Pakeisti RLS `Users with purchases can insert testimonials`: reikalauti **purchase + bent 1 įrašas** `analysis_history` arba `chat_conversations`.
- Frontend `TestimonialForm`: tikrinti tą pačią sąlygą prieš rodant formą; jei neatlikta — rodyti žinutę „Pirma atlikite analizę ar konsultaciją".

### 3. GIF sumažinimas (~20%) prieš konsultaciją
- `ChatPreview` / konsultacijos atidarymo GIF: sumažinti `max-w` / `h` klasę 20%.

### 4. Lokalizacija ir formatai (responsive)
- Patikrinti `lt/en/ru` failus — pridėti trūkstamus raktus naujoms admin sekcijoms.
- Admin lentelės: pridėti `overflow-x-auto`, mobiliam — kortelių stilius (md:table).

### 5. Skelbimų auto-rinkimo botas
**Šaltiniai** (pagal user pasirinkimą): autoplius.lt, autogidas.lt, copart.com, iaai.com, mobile.de.
- Botas orientuotas į **daužtus** automobilius (filtrai: „avarinis", „damaged", „salvage").
- Naujas connector: **Firecrawl** (reikia user prijungti per Connectors).
- Nauja edge function `scrape-listings`:
  - Įvestis: `count` (10–100), `sources[]`.
  - Per Firecrawl `/search` ir `/scrape` ištraukia skelbimo URL + duomenis (make, model, year, mileage, price, description, images).
  - Kiekvienam skelbimui kviečia esamą `analyze-vehicle` funkciją.
  - Įrašo į naują `auto_analyses` lentelę su `listing_url`, `source`, `analysis_data`, `review_status` (`pending|good|bad`), `admin_notes`, `ai_corrections`.

### 6. Admin tab "Auto-analizės"
- Mygtukas „Paleisti botą" su slankikliu 10–100.
- Lentelė: data | šaltinis | nuoroda (atsidaro naujame tab'e) | analizės santrauka | statusas.
- Kiekvienam — mygtukai **Gerai / Blogai + komentaras**.
- „Blogai" pažymėti įrašai naudojami kaip few-shot pavyzdžiai (negative) `analyze-vehicle` system prompt'e; „Gerai" — kaip teigiami pavyzdžiai. Tam — nauja lentelė `analysis_feedback` arba laukai prie `auto_analyses`.

### 7. AI mokymasis iš feedback
- `analyze-vehicle` funkcija: prieš kvietimą į gateway įtraukia paskutinius 3–5 „good" pavyzdžius kaip referenciją system prompt'e ir 2 „bad" su admin komentarais kaip „venk šių klaidų".

### 8. GitHub
- Jau prijungta — nieko nedarom, viskas auto-syncinasi.

## Techninės detalės

**Naujos DB lentelės:**
- `auto_analyses` (listing_url, source, scraped_data jsonb, analysis_id fk, review_status enum, admin_notes, reviewed_by, reviewed_at)
- RLS: tik admin gali skaityti/rašyti.

**RLS pakeitimai:**
- `user_testimonials`: nauja `UPDATE` policy adminui; `INSERT` check papildoma analizės/konsultacijos sąlyga.

**Naujos edge functions:**
- `scrape-listings` (verify_jwt=true, admin only).
- `analyze-vehicle` — atnaujinti, kad įtrauktų feedback pavyzdžius.

**Konektoriai:**
- Reikės **Firecrawl** prijungimo per Connectors prieš pradedant 5 dalį.

## Apribojimai / rizikos
- **Copart/IAAI** dažnai reikalauja login — gali grąžinti tuščius rezultatus. Pasiūlysiu fallback į mobile.de.
- Firecrawl kreditai: 100 skelbimų ≈ 100–200 scrape kreditų.
- Automatinis paleidimas (cron) — **nedarysiu** be atskiro prašymo, tik rankinis mygtukas.

## Vykdymo eilė
1. DB migracija (lentelės + RLS).
2. Admin UI: testimonial patvirtinimas + auto-analizių tab.
3. GIF + frontend testimonial sąlyga + lokalizacija.
4. Firecrawl prijungimas (paprašysiu user'io).
5. `scrape-listings` edge function.
6. `analyze-vehicle` feedback loop.

Patvirtinus — pradedu nuo 1–3 žingsnio (be Firecrawl), o tada paprašysiu prijungti konektorių.
