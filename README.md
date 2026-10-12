# Funding Empire

A responsive emerald-and-lime landing page with CSS 3D artwork, nine configurable affiliate placements, a separate four-step internal inquiry, accessible native dialogs, input validation, review, and real server-confirmed submission states.

## Included

- `dist/`: complete static landing page; no framework or dependencies.
- `api/submit.js`: Vercel serverless endpoint with validation, origin check, honeypot, field allowlist, timeout, and private credentials.
- `integration/GoogleAppsScript.gs`: Google Sheet writer, secret validation, write lock, and formula-injection protection.
- `tests/submit.test.mjs`: endpoint checks using a mocked Google service.

## Deploy to Vercel

1. Unzip this project. Import it into a Git repository, then import that repository in Vercel, or run the Vercel CLI from this directory.
2. Set Framework Preset to **Other**. The included `vercel.json` sets build command `npm run build` and output directory `dist`.
3. Deploy. The website works in preview mode immediately; submitting the inquiry is intentionally disabled until configuration below is complete.
4. Add your domain in Vercel project Settings > Domains and follow the DNS instructions there.

This project has no runtime npm dependencies. It uses Node.js 22 or newer for the function. The `/api` directory must remain at the project root alongside `dist`; do not upload only `dist` if you need submissions.

## Connect your Google Sheet

1. Create a private Google Sheet. Open Extensions > Apps Script. Paste `integration/GoogleAppsScript.gs`.
2. In Apps Script Project Settings > Script Properties add:
   - `SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the Sheet URL.
   - `SHARED_SECRET`: a long random secret (for example, a password-manager-generated 48-character string).
3. Deploy the script as a Web App: execute as yourself, access **Anyone**. Authorize the script. The endpoint is publicly reachable but rejects writes without the secret. Never put the secret in browser code, URLs, or a public repository.
4. Copy the `/exec` deployment URL. In Vercel Environment Variables set:
   - `GOOGLE_SCRIPT_URL`: that `/exec` URL.
   - `SHEETS_SHARED_SECRET`: exactly the same secret.
   - `SITE_ORIGIN`: the site's exact origin, for example `https://fundingempire.com` (no trailing slash). A different preview origin will be rejected unless configured for that environment.
5. Finalize the operator disclosures below. Set `submissionEnabled: true` in `dist/config.js` and redeploy Vercel.
6. Submit sample information. Confirm a row appears in the `Inquiries` tab and that the website shows a received state. A successful HTTP response without `{ok:true}` is treated as a failure. No success is shown before Google confirms the write.
7. Delete test rows. Keep the Sheet private and restrict editor access.

Updates to Apps Script require updating its web-app deployment version. If a request times out after Google has written it, a manual retry can create a duplicate; this starter has no durable idempotency store. Google Apps Script quotas apply. Before public traffic, enable Vercel firewall rate limits/bot protection for `/api/submit` appropriate to your volume; the included origin check and honeypot alone do not stop scripted abuse.

## Add the nine affiliate offers

Replace the nine objects in `dist/config.js` with real `name`, `description`, `url` and `category` values. Use full `https://` tracking URLs. Unconfigured URLs remain non-clickable. Do not publish unsupported approval, speed, APR, or savings claims. Links include `rel="sponsored noopener noreferrer"` and open separately.

Example replacement for `offers` (include nine entries):

```js
offers: [
  { name: 'Your real partner name', description: 'Accurate provider description.', url: 'https://your-real-affiliate-url.example', category: 'Short-term borrowing' },
  // Add the other eight actual providers.
]
```

## Branding and pre-launch content

The chosen working brand is Funding Empire. To change it, edit `dist/index.html`, `dist/app.js`, and this README. Colors and 3D elements are in `dist/styles.css`; no image files are required. The Google Fonts import has local font fallbacks.

The supplied reference website was not included in the request, so this is an original flow. It collects preferred amount, purpose, name, email, phone, state, ZIP, earnings source, monthly earnings, frequency, and inquiry consent. It does not collect SSNs, birth dates, bank numbers, passwords, or credit-card information. No browser persistent storage, marketing pixels, automatic affiliate data sharing, or credit checks are implemented.

Before enabling live inquiries:

- Replace preview privacy/terms in `dist/app.js` with your actual legal operator, privacy contact, retention/deletion process, sharing practices, and service terms. Update the privacy FAQ and remove preview labels in `dist/index.html` once accurate.
- Confirm real providers, permitted referral relationships, state availability, and relevant disclosures for your business with your compliance adviser. No legal compliance certification is included.
- Add real operator contact information and business address where appropriate.
- The internal path is an inquiry to your connection service, not a claim that you lend directly. If your internal product is different, replace that content accordingly.
- The single consent covers inquiry storage and follow-up. No automated-call/SMS marketing consent is implemented.

## Verification

Run `npm run build` and `npm test`.
The automated tests cover validation, rejection of foreign origins, unavailable configuration, exclusion of extra data, confirmed write responses, and upstream failures.

The private Sites version is a visual and interactive preview only. Vercel runs the included `/api/submit` function. Google Sheets connection and real Vercel deployment must be tested after your credentials and domain are configured.

Official integration references:
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/project-configuration/vercel-json
- https://developers.google.com/apps-script/guides/content
"# Funding-Landing-Page" 
