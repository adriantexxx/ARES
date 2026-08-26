# Agentics · ARES AI

ARES is an evidence-led smartphone diagnostic and legitimate recovery product. This MVP includes a complete Samsung Boot Loop flow, adaptive questions, evidence/confidence/risk calculations, local session storage, optional Supabase persistence, and module boundaries for Knox Guard guidance, ARES PRO, and a signed desktop USB agent.

## Local run

```powershell
npm install
npm run dev
```

Without cloud credentials, sessions remain usable and are stored locally in the browser.

## Connect Supabase

1. Create a Supabase project in the company owner account.
2. In the SQL Editor, run `supabase/migrations/202608250001_ares_mvp.sql`.
3. Enable the Auth providers you intend to use (Email is a sensible production baseline).
4. Copy `.env.example` to `.env.local`, then add the Project URL and publishable/anon key from the API settings.
5. Add production sign-in UI before enabling remote session storage for end users. The RLS policies require a logged-in user.

Never expose a Supabase service-role key in a Vite/browser environment variable.

## Turn ARES into a paid service

The app includes a real service workflow:

`authenticated customer → support request → payment link → verified Stripe webhook → paid technician case`

1. Apply both SQL migrations, including `202608260001_commerce_and_cases.sql`.
2. Create your Agentics organisation row and add the owner to `organization_members`; place the organisation UUID in `VITE_SERVICE_ORGANIZATION_ID`.
3. In Stripe, create one Payment Link per package and place their public HTTPS URLs in the two `VITE_PAYMENT_LINK_*` variables. The app appends an opaque support-case reference, never customer email or secrets.
4. Deploy the Supabase Edge Function: `supabase functions deploy stripe-webhook --no-verify-jwt`.
5. Add these secrets only in Supabase Edge Function secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
6. In Stripe, add a webhook endpoint pointing to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`, listening for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

The browser never receives a Stripe secret key. The webhook verifies Stripe’s signature before marking a case paid.

## Put it on agentics.ro

You can deploy this project as `ares.agentics.ro` immediately, or integrate it at `www.agentics.ro/ares` if your current web host routes that path to this Vite application. The `public/_redirects` file provides SPA fallback for Netlify and Cloudflare Pages; configure the equivalent rewrite on another host.

Build with `npm run build`, then publish the generated `dist/` directory. Point the desired subdomain/domain DNS record at the hosting provider and configure HTTPS there. Do not replace the current `www.agentics.ro` site until it has a route/proxy plan for its existing pages.

## Connect GitHub

The repository is initialized locally. After signing in to GitHub and creating an empty `agentics` repository:

```powershell
git add .
git commit -m "feat: launch Agentics ARES MVP"
git branch -M main
git remote add origin https://github.com/YOUR_ORGANIZATION/agentics.git
git push -u origin main
```

## Safety boundary

ARES supports diagnosis and legitimate recovery only. It must not implement Knox Guard, FRP or MDM bypasses, IMEI modification, or unauthorised firmware/security modification.
