Perfect — let’s fully spec and blueprint the **Tourist Flow (post-login)** so you can implement it cleanly, one file at a time, with Copilot or by hand. I’ll make this exhaustive: DB, APIs, client files, UI behavior, offline/resilience, i18n keys, security/compliance notes, tests, demo scripts, and commit messages. Follow it step-by-step and you’ll have a judge-ready Tourist portal.

# Tourist Flow — High Level

After login the tourist sees the **Tourist Dashboard** (landing for logged-in tourists) with a floating SOS, quick safety stats, and navigation to Profile, SOS History, and E-FIR Records. The tourist app must be offline-friendly, privacy-first (DPDPA compliant), multilingual, and accessible.

---

# 1 — Data Model (Supabase / Postgres)

Create/ensure these tables (RLS policies described later).

<pre class="overflow-visible!" data-start="813" data-end="1925"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>-- sos_alerts</span><span>
</span><span>CREATE</span><span></span><span>TABLE</span><span> sos_alerts (
  id uuid </span><span>PRIMARY</span><span> KEY </span><span>DEFAULT</span><span> gen_random_uuid(),
  tourist_id uuid </span><span>REFERENCES</span><span> digital_tourist_ids(id),
  lat </span><span>double precision</span><span></span><span>NOT</span><span></span><span>NULL</span><span>,
  lng </span><span>double precision</span><span></span><span>NOT</span><span></span><span>NULL</span><span>,
  address text,
  type text </span><span>NOT</span><span></span><span>NULL</span><span>, </span><span>-- panic|medical|security|other</span><span>
  battery </span><span>smallint</span><span>,
  network_strength </span><span>smallint</span><span>,
  audio_url text,
  audio_shared </span><span>boolean</span><span></span><span>DEFAULT</span><span></span><span>false</span><span>,
  escalation text, </span><span>-- ranger|police</span><span>
  safety_score </span><span>numeric</span><span></span><span>DEFAULT</span><span></span><span>0</span><span>,
  blockchain_hash text,
  status text </span><span>DEFAULT</span><span></span><span>'active'</span><span>, </span><span>-- active|acknowledged|responded|resolved|cancelled</span><span>
  created_at timestamptz </span><span>DEFAULT</span><span> now()
);

</span><span>-- efir_records</span><span>
</span><span>CREATE</span><span></span><span>TABLE</span><span> efir_records (
  id uuid </span><span>PRIMARY</span><span> KEY </span><span>DEFAULT</span><span> gen_random_uuid(),
  sos_id uuid </span><span>REFERENCES</span><span> sos_alerts(id),
  author_id uuid, </span><span>-- authority who generated/edited</span><span>
  efir_payload jsonb,
  pdf_url text,
  status text </span><span>DEFAULT</span><span></span><span>'draft'</span><span>, </span><span>-- draft|filed</span><span>
  created_at timestamptz </span><span>DEFAULT</span><span> now()
);

</span><span>-- digital_tourist_ids (if not present)</span><span>
</span><span>-- store only minimal PII, keep real PII encrypted off-chain</span><span>
</span><span>-- assume existing table with columns id, tourist_name, hash, valid_from, valid_to</span><span>
</span></span></code></div></div></pre>

RLS (recommended):

- `sos_alerts`: tourists can INSERT when `auth.uid() = tourist_id`; tourists can SELECT their own rows; authorities read by role.
- `efir_records`: only authority/admin INSERT/UPDATE; tourists SELECT their own efirs (read-only).
- Enforce with Supabase policies and server-side checks for stronger guarantees.

---

# 2 — Backend APIs (Edge Functions / Serverless)

Place in `supabase/functions/sos/` and `supabase/functions/efir/`

## Endpoints

1. `POST /api/sos` — create SOS
   - Auth: Bearer JWT (tourist)
   - Body: `{ touristId, lat, lng, type, battery, network_strength, audio_blob?, audio_shared? }`
   - Server work:
     - Validate JWT & touristId
     - Run `computeSafetyScore()` (server rule-based or ML call)
     - Run server-side geofence check → set `escalation`
     - Save audio blob to storage (if any) → audio_url
     - Call `blockchain-operations/createHash` (or signature) → blockchain_hash
     - Insert into `sos_alerts` with `status = 'active'`
     - Log notification(s) to `notification_log`, call `notifications/send` (push + fallback)
     - Return `{ sosId, escalation, blockchainHash, createdAt }`
2. `POST /api/sos/cancel`
   - Auth: tourist who created it
   - Marks `status='cancelled'` if not yet acknowledged.
3. `GET /api/sos?touristId=` — tourist?sos list (paginated)
4. `POST /api/efir/generate`
   - Auth: authority or admin (but tourist view will have GET)
   - Body: `{ sosId }` → creates `efir_records` draft + generates PDF (pdfkit) stored in storage → returns `efirId, pdfUrl`
5. `GET /api/efir?touristId=` — get list of efirs for tourist
6. `GET /api/safety/score?lat=&lng=&touristId=` — optional for on-demand score

**Security & privacy notes**

- Never store raw Aadhaar or passport on-chain or unencrypted.
- Only store hashes on-chain; raw PII encrypted in DB with KMS keys.
- All endpoints must enforce minimal data returned (selective disclosure).
- Log access to sensitive data in `audit_log`.

---

# 3 — Client Structure (files to create/update)

Place files under `src/pages/tourist/` and `src/components/sos/` per your repo:

<pre class="overflow-visible!" data-start="4034" data-end="4521"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>src/pages/tourist/dashboard.tsx
src/components/sos/SOSButton.tsx
src/components/sos/SOSOverlay.tsx
src/components/sos/SOSHistoryCard.tsx
src/components/id/DigitalIdCard.tsx
src/components/stats/SafetyStats.tsx
src/pages/tourist/profile.tsx
src/pages/tourist/sos-history.tsx
src/pages/tourist/efir-records.tsx
src/services/sosService.ts
src/services/efirService.ts
src/services/offlineQueue.ts
src/lib/safetyScore.ts
src/integrations/supabaseClient.ts
src/i18n/tourist.json (keys)
</span></span></code></div></div></pre>

---

# 4 — UI & UX: Tourist Dashboard (detailed)

**Layout** : `TouristLayout` wraps pages; dashboard left column map+cards, right column quick actions + history preview; floating SOS bottom-right.

## Key components & behavior

### SOSButton (always visible)

- `src/components/sos/SOSButton.tsx`
- Visual: large circular button — SOS icon — Nagaland Sunset Orange border with red fill on hover.
- On click: opens `SOSOverlay` modal; supports keyboard (Enter) & aria `aria-label="Trigger SOS"`.
- Persistent: visible on all tourist pages (include in `TouristLayout`).

### SOSOverlay (full-screen modal)

- Countdown 5s with Cancel button. If canceled within 5s, nothing sent.
- After countdown:
  - Acquire high-accuracy location (`navigator.geolocation.getCurrentPosition`), fallback to last known location.
  - Collect battery (`navigator.getBattery()`), network (`navigator.connection.effectiveType`) and device details.
  - Optional: record 10-15s ambient audio (ask consent) via `MediaRecorder`; show clear consent UI.
  - Show progress spinner + "Sending SOS..." and progressive steps (Location → Preparing evidence → Notifying authorities).
  - On success: show success card with `sosId`, `blockchainHash` (shortened), "Authorities notified", ETA if provided by backend.

Accessibility notes:

- Overlay traps focus, ESC closes with cancel, voice-only users have keyboard support.
- Offer large contrast buttons.

### SafetyStats (quick stats)

- `src/components/stats/SafetyStats.tsx`
- Shows:
  - `Last SOS` timestamp & status badge.
  - Personal `Safety Score` (0–100 or 1–5 scale, visual radial meter).
  - `Active Geo-Fence` (name + short description if inside any).
- Fetch data from `/api/safety/score` and `/api/sos?touristId=`.

### DigitalIdCard

- `src/components/id/DigitalIdCard.tsx`
- Shows QR of DID/VC; expiry dates; button “Show selective disclosure” to reveal minimal fields (permit status) for offline verification.
- QR links to `verify` endpoint (or is encoded DID data).

### Profile Page

- `src/pages/tourist/profile.tsx`
- Multi-section form:
  - Personal info (name, phone, email — minimal).
  - Emergency contacts (2–3) with validation.
  - Document upload: passport/ID (client-side validate file type & size < 5MB).
  - Privacy toggles (share location with authorities: ON/OFF; share audio: ON/OFF).
- Document upload: upload to Supabase storage via signed URL; store sanitized metadata in DB.
- After upload, generate DID hash & show DigitalIdCard.

### SOS History Page

- `src/pages/tourist/sos-history.tsx`
- Paginated list of past SOS cards: status, map thumbnail, created_at, actions (view e-FIR if exists, cancel/refund if applicable).
- Implement filter (status), search by date, and export button (CSV/PDF).

### E-FIR Records Page

- `src/pages/tourist/efir-records.tsx`
- List of efir_records for the tourist, view PDF (modal or separate tab), timestamps, status (draft/filed).
- Allow tourist to download PDF.

---

# 5 — Services (client wrappers)

### `src/services/sosService.ts`

Functions:

- `createSos(payload): Promise<{ sosId, escalation, blockchainHash }>`
- `cancelSos(sosId)`
- `getSosHistory(touristId, page, limit)`
- Use `supabase` client or fetch to Edge Functions.
- On network failure, throw `OfflineError` for offlineQueue to catch.

### `src/services/offlineQueue.ts`

IndexedDB-based queue (use `idb` library)

- Methods: `enqueue(type, payload)`, `flush()`, `list()`, `remove(id)`
- When offline, `SOSButton` should call `offlineQueue.enqueue('sos', payload)` and show queued UI.

### `src/lib/safetyScore.ts`

- `computeSafetyScore({inDangerFence, battery, stationaryMinutes, sosType, crowdDensity}): number`
- Provide rule-based weights and exported function for server & client shared logic.

---

# 6 — Geofence & Map integration for Tourist

- Tourist dashboard includes small map preview (Mapbox).
- Show current location, active geo-fence overlays (fetch `/api/geo_fences`).
- If tourist crosses into danger zone: show modal alert with guidance and link to nearby exit routes or contacts.
- Map clicking shows nearest help points.

File: `src/components/map/TouristMap.tsx`

---

# 7 — Offline behavior & queued delivery

- If offline when SOS triggered: queue the SOS payload with timestamp + metadata.
- Background sync/Service Worker flush:
  - On `online` event or periodic background sync, attempt to flush queued SOSs with priority.
  - If server unreachable, attempt SMS fallback: call server endpoint `POST /api/notifications/sms-fallback` which sends SMS via Twilio to emergency contacts or ERSS-112.
- UI: show top-right indicator "Queued: 1 SOS — will send when online" with manual Retry button.

---

# 8 — Notifications & Authority feedback

- After backend processes SOS, send push (Web Push or FCM) back to tourist with:
  - "Your SOS [ID] acknowledged by `<station>` at `<ETA>`" or "Your SOS resolved."
- Show recent authority messages in dashboard notification center.

---

# 9 — AI Chatbot (tourist)

- Chat button on tourist dashboard (bottom-left).
- Integration:
  - `POST /api/chat` server function wraps Gemini API with system prompt tuned for tourist safety & local NE knowledge, multilingual fallback.
  - Chat actions: bot can suggest: "Call SOS" with one-click action; "Show Digital ID" quick action.
- Provide quick help templates: health tips, local emergency numbers, local language phrases.

---

# 10 — Security, Privacy & Compliance

- Do **not** store raw Aadhaar/passport fields on-chain or unencrypted.
- Store PII encrypted using KMS (Supabase secrets + server-side encryption) and limit retention.
- Obtain explicit consent for audio recording and storage; show expiry and deletion options.
- Provide privacy page and easy revoke credentials: tourist can revoke DID (change status to revoked) which logs revocation on chain.
- Rate-limit SOS creation per tourist to prevent abuse (e.g., one SOS per minute with cancel allowance).

---

# 11 — i18n keys (example keys: `src/i18n/tourist.json`)

Provide keys for critical text. Example:

<pre class="overflow-visible!" data-start="10551" data-end="11060"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-json"><span><span>{</span><span>
  </span><span>"dashboard"</span><span>:</span><span></span><span>{</span><span>
    </span><span>"lastSOS"</span><span>:</span><span></span><span>"Last SOS"</span><span>,</span><span>
    </span><span>"safetyScore"</span><span>:</span><span></span><span>"Safety Score"</span><span>,</span><span>
    </span><span>"activeGeoFence"</span><span>:</span><span></span><span>"Active Zone"</span><span>,</span><span>
    </span><span>"profile"</span><span>:</span><span></span><span>"Profile"</span><span>,</span><span>
    </span><span>"sosHistory"</span><span>:</span><span></span><span>"SOS History"</span><span>,</span><span>
    </span><span>"efirRecords"</span><span>:</span><span></span><span>"E-FIR Records"</span><span>,</span><span>
    </span><span>"sendSOS"</span><span>:</span><span></span><span>"Send SOS"</span><span>,</span><span>
    </span><span>"cancel"</span><span>:</span><span></span><span>"Cancel"</span><span>,</span><span>
    </span><span>"queued"</span><span>:</span><span></span><span>"Queued"</span><span>
  </span><span>}</span><span>,</span><span>
  </span><span>"sos"</span><span>:</span><span></span><span>{</span><span>
    </span><span>"confirm"</span><span>:</span><span></span><span>"Confirm SOS?"</span><span>,</span><span>
    </span><span>"countdown"</span><span>:</span><span></span><span>"Sending in {seconds}s"</span><span>,</span><span>
    </span><span>"sending"</span><span>:</span><span></span><span>"Sending SOS..."</span><span>,</span><span>
    </span><span>"sentSuccess"</span><span>:</span><span></span><span>"Help is on the way"</span><span>,</span><span>
    </span><span>"sentFail"</span><span>:</span><span></span><span>"Failed to send — queued"</span><span>
  </span><span>}</span><span>
</span><span>}</span><span>
</span></span></code></div></div></pre>

---

# 12 — Tests & QA (what to test)

## Unit tests

- `safetyScore.test.ts` — various scenarios produce correct score.
- `sosService.test.ts` — success & network failure responses; offline queue behavior.

## Integration tests

- Create SOS via client → DB row exists → notification_log entry created.
- Cancel SOS pre-ack → status updated.

## E2E tests (Playwright or Cypress)

Scenario: Register tourist → login → Dashboard → Press SOS → overlay cancels & sends → Authority receives realtime event → Authority acknowledges → Tourist receives push ack → tourist downloads eFIR.

---

# 13 — Seed data & demo scripts

Add `scripts/seedDemo.js` to insert:

- one tourist user + DID
- one sample danger geofence polygon near a demo coordinate
- optionally a pre-created SOS for authority demo.

**Sample CURL to create SOS** (demo / testing):

<pre class="overflow-visible!" data-start="11902" data-end="12174"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>curl -X POST https://yourdomain/api/sos \
  -H </span><span>"Authorization: Bearer <TOURIST_JWT>"</span><span> \
  -H </span><span>"Content-Type: application/json"</span><span> \
  -d '{
    "touristId":"<uuid>",
    "lat":26.2,
    "lng":92.9,
    "type":"panic",
    "battery":12,
    "network_strength":2
  }'
</span></span></code></div></div></pre>

---

# 14 — Deliverables & file-level TODOs (ordered)

1. `src/components/sos/SOSButton.tsx` — implement UI + open overlay (commit: `feat(ui): add SOSButton and overlay`)
2. `src/components/sos/SOSOverlay.tsx` — geolocation, audio consent, send/cancel flows (commit: `feat(ui): add SOSOverlay with countdown and sending flow`)
3. `src/services/sosService.ts` — client API wrapper (commit: `feat(api): add sosService client wrapper`)
4. `supabase/functions/sos/create.ts` — create SOS function (commit: `feat(api): add SOS create edge function`)
5. `src/services/offlineQueue.ts` — queue & flush (commit: `feat(offline): add offlineQueue`)
6. `src/pages/tourist/dashboard.tsx` — layout combining map, stats, DID (commit: `feat(tourist): create dashboard skeleton`)
7. `src/components/stats/SafetyStats.tsx` — last SOS, score, active geofence (commit: `feat(stats): safety stats component`)
8. `src/pages/tourist/profile.tsx` — profile + document upload (commit: `feat(profile): add profile with doc upload`)
9. `supabase/functions/efir/generate.ts` — generate eFIR (commit: `feat(efir): auto draft generation`)
10. Tests & seed data (commit: `test: add tests and seed data for tourist flow`)

---

# 15 — PR & Demo checklist (for each PR)

- [ ] Lint & build pass
- [ ] Unit tests pass
- [ ] Demo seed included (or clear run steps)
- [ ] i18n keys added
- [ ] Accessibility check: tab order, aria labels
- [ ] Privacy notices & consent flows implemented for audio & documents
- [ ] Clear commit message and PR description with demo steps.

---

# 16 — Time-boxed Implementation Plan (suggested)

- Day 1 (3–5 hrs): SOSButton + Overlay UI + client-side sending (stubbed endpoint) + offlineQueue stub.
- Day 2 (4–6 hrs): Build `POST /api/sos` edge function, server geofence check, safety_score compute, notification_log entry.
- Day 3 (3–4 hrs): Profile page + document upload + Digital ID display.
- Day 4 (3–5 hrs): SOS History & E-FIR view + eFIR generate endpoint and PDF generation stub.
- Day 5 (2–4 hrs): Tests, Polish, i18n, and accessibility fixes.

---

# 17 — Example code snippets (starter)

### SOSButton (skeleton)

<pre class="overflow-visible!" data-start="14300" data-end="14895"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>// src/components/sos/SOSButton.tsx</span><span>
</span><span>import</span><span></span><span>React</span><span>, { useState } </span><span>from</span><span></span><span>'react'</span><span>;
</span><span>import</span><span></span><span>SOSOverlay</span><span></span><span>from</span><span></span><span>'./SOSOverlay'</span><span>;

</span><span>export</span><span></span><span>default</span><span></span><span>function</span><span></span><span>SOSButton</span><span>(</span><span></span><span>) {
  </span><span>const</span><span> [open, setOpen] = </span><span>useState</span><span>(</span><span>false</span><span>);
  </span><span>return</span><span> (
    </span><span><span class="language-xml"><></span></span><span>
      </span><span><button</span><span>
        </span><span>aria-label</span><span>=</span><span>"Trigger SOS"</span><span>
        </span><span>onClick</span><span>=</span><span>{()</span><span> => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-20 h-20 flex items-center justify-center shadow-lg bg-gradient-to-br from-[#F57C00] to-[#D32F2F] text-white"
      >
        SOS
      </span><span></button</span><span>>
      {open && </span><span><SOSOverlay</span><span></span><span>onClose</span><span>=</span><span>{()</span><span> => setOpen(false)} />}
    </span><span></></span><span>
  );
}
</span></span></code></div></div></pre>

### Minimal server logic pseudo (create.ts)

<pre class="overflow-visible!" data-start="14941" data-end="16075"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>// supabase/functions/sos/create.ts (pseudocode)</span><span>
</span><span>import</span><span> { supabase } </span><span>from</span><span></span><span>'@/lib/supabaseServer'</span><span>;
</span><span>import</span><span> turf </span><span>from</span><span></span><span>'@turf/turf'</span><span>;

</span><span>export</span><span></span><span>default</span><span></span><span>async</span><span></span><span>function</span><span></span><span>handler</span><span>(</span><span>req</span><span>) {
  </span><span>const</span><span> user = </span><span>await</span><span></span><span>authFromReq</span><span>(req);
  </span><span>const</span><span> body = </span><span>await</span><span> req.</span><span>json</span><span>();
  </span><span>validate</span><span>(body);
  </span><span>// geofence check</span><span>
  </span><span>const</span><span> fences = </span><span>await</span><span> supabase.</span><span>from</span><span>(</span><span>'geo_fences'</span><span>).</span><span>select</span><span>(</span><span>'*'</span><span>).</span><span>eq</span><span>(</span><span>'active'</span><span>, </span><span>true</span><span>);
  </span><span>let</span><span> escalation = </span><span>'police'</span><span>;
  </span><span>for</span><span> (</span><span>const</span><span> f </span><span>of</span><span> fences.</span><span>data</span><span>) {
    </span><span>if</span><span> (</span><span>booleanPointInPolygon</span><span>([body.</span><span>lng</span><span>, body.</span><span>lat</span><span>], f.</span><span>polygon_geojson</span><span>)) {
      </span><span>if</span><span> (f.</span><span>type</span><span> === </span><span>'danger'</span><span> || f.</span><span>type</span><span> === </span><span>'restricted'</span><span>) escalation = </span><span>'ranger'</span><span>;
    }
  }
  </span><span>const</span><span> safetyScore = </span><span>computeSafetyScore</span><span>(</span><span>/*...*/</span><span>);
  </span><span>// store audio if provided</span><span>
  </span><span>// create blockchain hash</span><span>
  </span><span>const</span><span> { data } = </span><span>await</span><span> supabase.</span><span>from</span><span>(</span><span>'sos_alerts'</span><span>).</span><span>insert</span><span>({
    </span><span>tourist_id</span><span>: body.</span><span>touristId</span><span>,
    </span><span>lat</span><span>: body.</span><span>lat</span><span>, </span><span>lng</span><span>: body.</span><span>lng</span><span>, </span><span>type</span><span>: body.</span><span>type</span><span>,
    </span><span>battery</span><span>: body.</span><span>battery</span><span>, </span><span>network_strength</span><span>: body.</span><span>network_strength</span><span>,
    escalation, </span><span>safety_score</span><span>: safetyScore, </span><span>blockchain_hash</span><span>: </span><span>'0xabc'</span><span>
  }).</span><span>select</span><span>().</span><span>single</span><span>();
  </span><span>// enqueue notifications</span><span>
  </span><span>return</span><span></span><span>new</span><span></span><span>Response</span><span>(</span><span>JSON</span><span>.</span><span>stringify</span><span>({ </span><span>sosId</span><span>: data.</span><span>id</span><span>, escalation }), { </span><span>status</span><span>: </span><span>200</span><span> });
}</span></span></code></div></div></pre>
