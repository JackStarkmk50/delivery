# Salem pilot account setup

Use one domain and one host for the first pilot. The current production Compose file runs the app, PostgreSQL, and Caddy on the same server. This keeps the first deployment simple but makes off-host database backups essential.

## Order

1. Register a domain and set its DNS with Cloudflare. Add an `A` record for the app subdomain pointing to the server address. Keep the domain and registrar login under the business owner's control.
2. Create a DigitalOcean account and a 2 vCPU / 4 GiB Basic Droplet in Bangalore. Install Docker Engine and the Compose plugin, enable the cloud firewall for SSH, 80, and 443 only, and add an SSH key. Keep PostgreSQL off public ports.
3. Create a Resend account, verify the sending domain with its DNS records, and make an SMTP API key. Use `smtp.resend.com`, port `587`, username `resend`, and the API key as password. Use a sender address on the verified domain.
4. Copy `docs/production.env.example` to a private `.env` on the host and replace every placeholder. `DOMAIN` is the app subdomain, `APP_ORIGIN` is set by Compose, and `DATABASE_URL` uses the host `database`. Keep the database password URL-safe or encode it in the URL. Never commit the filled file.
5. Deploy with `docker compose -f compose.production.yaml up -d --build`. Check `/api/health`, migrations, email verification, a test customer link, and a private proof photo. Create the platform operator using `npm run admin:setup` inside the app container with temporary `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` environment variables.
6. Schedule off-host encrypted database backups, test restoration into a separate database, schedule `proofs:prune`, and watch health, disk space, SMTP failures, and backup age.
7. Configure Expo/EAS signing and Android test builds with `EXPO_PUBLIC_API_URL` set to the HTTPS app address. Test both roles on physical devices in Salem before public distribution.

## Payments

The operator dashboard can record trial, active, unpaid, and externally paid accounts with a change history. Decide the plan price, billing cycle, tax handling, and invoice issuer before enabling payment collection. Razorpay is a possible India payment provider after business KYC. Do not label a client paid merely because service is active. Integrate payment webhooks only after the merchant account and pricing are finalized; verify signatures and make event handling idempotent.

## Account ownership

The domain purchase, cloud billing account, SMTP domain verification, and payment KYC require the owner's legal identity, payment method, and access to email or phone verification. Keep those accounts in the owner's name and use separate project credentials for deployment.
