# Assessment upgrade coverage and checks

| Route / state | Upgrade |
|---|---|
| `/` | Architectural concept image, editorial hierarchy, structured report/routing explanation |
| `/audit` | All six sections, 25 question groups (27 fields), desktop rail, operable mobile section navigation, progress summary, input/selected/error/focus states |
| Audit analysis/error | Framed analysis panel, reduced motion, 60-second request timeout with saved-answer recovery |
| `/results` | Overview, dimensional scores, team recommendations, agents, next steps, chapter navigation, print/PDF styling |
| `/dashboard` | Semantic labeled login form; connecting/error states; authenticated controls, summaries, filters, expandable report, outreach and contact-status failure recovery |
| Unknown route | Branded 404 with audit recovery links |
| Shared | Header/footer, skip link, local fonts, responsive typography, visible focus |

`npm run build` and TypeScript pass. `tools/verify-experience.cjs` checks keyboard rating selection and focus, one tab stop, six-section/27-field schema, deterministic score bounds, and all five lowest-score division mappings using jsdom. Run with jsdom installed or set `JSDOM_PATH`.

The start-hub agent reviewed implementation and identified smooth validation scrolling and an unbounded assessment request. Both were corrected. No scoring, database schema, lead payload, or credential contract changed. No real lead or dashboard mutation was submitted during tests.

Browser rendering, actual production AI/Supabase responses, authenticated admin data, and physical mobile performance need independent verification. DOM tests do not establish layout or visual quality.
