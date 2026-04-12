

# MOTORUL aplikacijos dokumentacija – PDF

## Aprašymas
Sukursiu išsamų PDF dokumentą lietuvių kalba, kuriame bus aprašyta visa MOTORUL programa – puslapiai, funkcijos, veikimo principai, dizainas ir AI logika.

## Dokumento struktūra

**1. Įvadas** – kas yra MOTORUL, kokia programa, kam skirta

**2. Puslapių aprašymas:**
- **Pagrindinis puslapis (/)** – hero sekcija, 6 funkcijų kortelės, automobilio animacija, analizės pavyzdys, konsultacijos pavyzdys, atsiliepimai
- **Autentifikacija (/auth)** – prisijungimas, registracija, slaptažodžio atkūrimas
- **Profilis (/profile)** – vartotojo paskyra, kreditų balansas, atsijungimas
- **Analizės (/analyses)** – analizės istorija, naujos analizės pradėjimas
- **Konsultacijos (/consultations)** – pokalbių sąrašas, naujų konsultacijų kūrimas
- **Kainos (/prices)** – paslaugų pirkimas, paketai
- **Apie mus (/about)** – misija, komanda, vertybės
- **Verslui (/business)** – B2B pasiūlymai
- **Atsiliepimai (/testimonials)** – vartotojų atsiliepimai

**3. Funkcijų detalus aprašymas:**
- Automobilio analizė (AI edge function, nuotraukų/aprašymo siuntimas, JSON rezultatas)
- Techninė konsultacija (AI chat su streaming, žinučių limitas 30/konsultaciją, [UNCLEAR] logika)
- Kreditų sistema (analizės kreditai, konsultacijų kreditai, žinučių limitas per konsultaciją)
- Daugiakalbystė (24 kalbos)

**4. Dizainas** – tamsus fonas, raudona/juoda spalvų schema, glass-card kortelės, animacijos

**5. Technologijos** – React, TypeScript, Tailwind CSS, Lovable Cloud (Supabase), Lovable AI Gateway

## Techninis planas
- Naudosiu Python `reportlab` biblioteką PDF kūrimui
- Profesionalus formatavimas su antraštėmis, lentelėmis, spalvomis
- Failas bus išsaugotas `/mnt/documents/MOTORUL_dokumentacija.pdf`
- QA: konvertuosiu į paveikslėlius ir patikrinsiu kiekvieną puslapį

