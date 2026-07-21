# Governed Social Media Operations

The supported backend is `/api/governed-content`. The generated broad feature routes and synchronous scheduler remain in the repository as prototype reference material but are not mounted by `backend/src/server.js`.

## Controlled setup

1. Copy `.env.example` into a secret-managed runtime environment and replace its placeholders.
2. Run `./scripts/bootstrap.sh` explicitly to install dependencies from lockfiles.
3. Apply `./scripts/migrate.sh apply-governed-social-001` through the normal database change-approval process.
4. Provision users, tenants, and memberships through an administrator-controlled channel. Public registration is disabled.
5. Enable providers only when their HTTPS endpoints and runtime credentials are configured. Provider readiness fails closed.
6. Run `./start.sh`. It refuses missing dependencies and occupied ports and does not install, seed, migrate, create databases, or terminate processes it did not start.

## Content lifecycle

Ingested sources require durable storage, content digests, current license evidence, and consent for identifiable people. Editors assemble immutable content versions from accessible assets and editable, non-overlapping timeline clips. Render requests specify deterministic dimensions, format, frame rate, preset, and codec version and enter a durable retry-bounded queue.

A successful render must pass timing, layout, accessibility, brand, multilingual, and export-compatibility measurement. Moderation and a reviewer or publisher independent of the creator must approve the exact evidence digests. AI-assisted output requires a disclosure label and watermark. Publication uses an idempotent outbox; authoritative outcomes and provider usage are retained, and failures become sanitized retry/dead-letter evidence.

Audience sentiment uses typed platform observations whose positive, neutral, and negative counts reconcile to their samples. Aggregates retain all source digests and explicitly report partial provider failures. Generic LLM output and missing credentials cannot produce sentiment records.

## Production validation still required

Local tests cover deterministic domain policy, authorization, provider failure, migration, API, and launcher contracts without external services. Production release still requires provider contract tests, licensed-media and consent-policy review, real render compatibility fixtures, accessibility and moderation owner sign-off, migration/restore rehearsal, security/access review, and end-to-end channel publishing in a controlled tenant.
