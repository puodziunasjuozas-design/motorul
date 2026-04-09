

## Planas: Pakeisti AI modelį į Google Gemini 3

### Kas bus pakeista

Trys backend funkcijos naudoja skirtingus AI modelius. Visos bus atnaujintos į `google/gemini-3-flash-preview`:

| Funkcija | Dabartinis modelis | Naujas modelis |
|---|---|---|
| `chat` (konsultacijos) | `openai/gpt-5-nano` | `google/gemini-3-flash-preview` |
| `analyze-vehicle` (analizė) | `openai/gpt-5-mini` | `google/gemini-3-flash-preview` |
| `search-youtube` | `google/gemini-2.5-flash-lite` | `google/gemini-3-flash-preview` |

### Techniniai pakeitimai

1. **`supabase/functions/chat/index.ts`** — pakeisti modelį iš `openai/gpt-5-nano` į `google/gemini-3-flash-preview`
2. **`supabase/functions/analyze-vehicle/index.ts`** — pakeisti modelį iš `openai/gpt-5-mini` į `google/gemini-3-flash-preview`
3. **`supabase/functions/search-youtube/index.ts`** — pakeisti modelį iš `google/gemini-2.5-flash-lite` į `google/gemini-3-flash-preview`
4. Deplointi visas tris funkcijas

### Rezultatas

Visos AI funkcijos naudos naujausią ir greitesnį Google Gemini 3 modelį su geresniu teksto ir vaizdo supratimu.

