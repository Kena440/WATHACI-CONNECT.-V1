# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Payments

Integration steps and deployment details for Lenco payments are covered in the [Payment Integration Guide](docs/PAYMENT_INTEGRATION_GUIDE.md).

## Environment Configuration

Project settings are managed through environment variables. Copy the provided template and update values for your setup:

```bash
cp .env.example .env
```

Update the new `.env` file with production values:

- `VITE_SUPABASE_URL` – Supabase project URL.
- `VITE_SUPABASE_KEY` – Supabase anon key for client access.
- `VITE_LENCO_PUBLIC_KEY` – Lenco public API key (`pk_live_*` in production).
- `LENCO_SECRET_KEY` – Lenco secret API key (`sk_live_*` in production).
- `LENCO_WEBHOOK_SECRET` – Secret used to validate Lenco webhooks.
- `VITE_LENCO_API_URL` – Lenco API base URL, usually `https://api.lenco.ng/v1`.
- `VITE_PAYMENT_CURRENCY` – ISO currency code for payments, e.g. `ZMK`.
- `VITE_PAYMENT_COUNTRY` – ISO country code, e.g. `ZM`.
- `VITE_PLATFORM_FEE_PERCENTAGE` – Platform fee percentage applied to each payment.
- `VITE_MIN_PAYMENT_AMOUNT` – Minimum allowed payment amount.
- `VITE_MAX_PAYMENT_AMOUNT` – Maximum allowed payment amount.
- `VITE_APP_ENV` – Set to `production` for live deployments.
- `VITE_APP_NAME` – Application display name.

## Testing

Lighthouse and automated accessibility checks are available via npm scripts.

```bash
# Run accessibility tests powered by jest-axe
npm run test:accessibility

# Generate a Lighthouse report (requires a running dev server)
npm run test:lighthouse
```

Make sure project dependencies are installed before executing the test commands.

