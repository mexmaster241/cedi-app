# Mobile app integration and testing – CEDI API Gateway

Use this as the prompt/spec for implementing and testing the gateway in the React Native (or other) mobile app.

---

## 1. Base URL and context

- **Base URL:** `https://<gateway-host>/gateway` (e.g. `https://api.soycedi.com/gateway` or `http://localhost:8080/gateway` in dev).
- **Context path:** The gateway is always mounted under `/gateway`. All URLs below are relative to that base.

## 2. Gateway API – encrypted requests

All **business** calls (users, movements, etc.) go through a single gateway endpoint with an **encrypted** body.

### 3.1 Endpoint

- **Method:** `POST`
- **URL pattern:** `POST {base}/{service}/{path}`
  Examples:
  - `POST {base}/core/v1/users`
  - `POST {base}/ledger/v1/movements`
  - `GET` is not supported for gateway proxy; the gateway expects a JSON body, so use POST with the same path for reads if your backend supports it, or align with backend design.

**Important:** The gateway is configured with context path `/gateway`, so the full URL is always `https://<host>/gateway/core/v1/...`, not `https://<host>/core/...`.

### 2.2 Request body (outer – what you send over the wire)

Send a **single** JSON object with two fields:

```json
{
  "payload": "<base64-encoded-encrypted-payload>",
  "iv": "<base64-encoded-IV>"
}
```

- **payload:** The encrypted inner payload (see below), then Base64-encoded.
- **iv:** The IV used for AES-256-GCM encryption, Base64-encoded.

### 2.3 Inner payload (before encryption)

Before encrypting, the body you send to the gateway must be a JSON object with this shape:

```json
{
  "timestamp": 1710000000,
  "nonce": "optional-uuid-if-you-use-it",
  "access_token": "<JWT from your auth (e.g. Supabase/Keycloak)>",
  "data": { ... your actual request body for the downstream service ... }
}
```

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| `timestamp`    | number | Yes      | Unix seconds. Used for replay protection (e.g. max 60s skew). |
| `nonce`        | string | No       | Optional unique value (e.g. UUID) if you use it. |
| `access_token` | string | Yes      | JWT used to call downstream services and identify the user. |
| `data`         | object | Yes      | The JSON you want to send to the backend (e.g. core, ledger). |

**Encryption:**
- Algorithm: **AES-256-GCM**.
- Key: Same shared secret as the gateway (`GATEWAY_ENCRYPTION_KEY`). The app must receive this key via secure config (e.g. env or secure storage), never hardcoded.
- IV: Random per request; send it in the outer body as `iv` (Base64).
- Encode the **stringified** inner JSON, then Base64 the ciphertext and put it in `payload`.

### 2.4 Response (outer – what you receive)

```json
{
  "payload": "<base64-encoded-encrypted-response>",
  "iv": "<base64-encoded-IV>"
}
```

- Decrypt using the same key and the `iv` from the response.
- The decrypted content is the **downstream service response** (JSON or whatever the service returns).

### 2.5 Errors

On validation or server errors, the gateway may return a non-2xx status and sometimes a **plain** JSON body (not encrypted), e.g.:

```json
{
  "status": 400,
  "message": "invalid_payload",
  "correlationId": "uuid"
}
```

Possible `message` values (align with backend): e.g. `invalid_payload`, `decryption_failed`, `invalid_token`, `unauthorized_service`, `downstream_service_error`.
Handle both encrypted success body and plain error body in the app.

---

## 3. Allowed services (first path segment)

The first segment after `/gateway` is the **service name**. Only these are allowed (configurable on the server):

- `core`
- `teams`
- `invoice`
- `onboarding`

Example: `POST {base}/core/v1/users` → routed to the **core** service at `/v1/users`.

---

## 4. How to implement in the mobile app

1. **Config**
   - Store gateway base URL: `https://<host>/gateway` (derived from `EXPO_PUBLIC_API_URL` in the app).
   - Store the shared encryption key: `EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY` (Base64 32-byte AES key, same as gateway `GATEWAY_ENCRYPTION_KEY`).

2. **Health**
   - `GET {base}/actuator/health` → no encryption, no auth. Use for “is the gateway up?”.

3. **API client**
   - Build inner payload: `{ timestamp, nonce?, access_token, data }`.
   - Encrypt with AES-256-GCM (random IV), then Base64 `payload` and `iv`.
   - Send `POST {base}/{service}/{path}` with body `{ "payload", "iv" }`, `Content-Type: application/json`.
   - Parse response: if 2xx, decrypt `payload` with response `iv`; otherwise treat as error and parse optional plain JSON `message` / `correlationId`.

4. **Auth**
   - Use your existing auth (e.g. Supabase) to obtain a JWT and put it in `access_token`. The gateway validates the JWT and forwards it to the backend.

5. **Timestamp**
   - Use current Unix time in seconds; keep device time reasonably in sync (gateway uses a max clock skew, e.g. 60s).

---

## 5. How to test

### 5.1 Manual – health

```bash
# Gateway up (should return 200 + JSON)
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:8080/gateway/actuator/health"

# Direct actuator closed (should 403 or 404)
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:8080/actuator/health"
```

### 5.2 Manual – gateway API (with encryption)

You need the same encryption key as the server and a valid JWT.

1. Build inner JSON, e.g.
   `{"timestamp":<now>,"access_token":"<jwt>","data":{}}`
2. Encrypt with AES-256-GCM, random IV; Base64 payload and IV.
3. Call:
   ```bash
   curl -X POST "http://localhost:8080/gateway/core/v1/your-path" \
     -H "Content-Type: application/json" \
     -d '{"payload":"<base64>","iv":"<base64>"}'
   ```

Or use a small script (Node/Python) that shares the encryption logic with the app and does one sample request.

### 5.3 In the app

- **Health:** On app start or a “Check connection” button, call `GET {base}/actuator/health`. Assert 200 and optional `status: "UP"`.
- **Gateway API:** For each flow (e.g. login, fetch user, fetch movements), run through the app and assert:
  - Request is sent as encrypted `{ payload, iv }`.
  - On success, response is decrypted and parsed correctly.
  - On error, status code and optional `message`/`correlationId` are handled (no crash, user sees a clear message).

### 5.4 Automated tests (optional)

- **E2E:** Use Detox (or similar) to open the app, trigger a screen that calls the gateway, and assert success or known error.
- **Integration:** In a test suite, mock the gateway base URL and either:
  - Use a test build that points to a stub server that returns fixed encrypted payloads, or
  - Point to a test gateway instance with a test key and test JWT and assert decrypted responses.

---

## 6. Summary checklist

- [ ] Base URL is `https://<host>/gateway` (include `/gateway`).
- [ ] All other API: `POST {base}/{service}/{path}` with body `{ "payload": "<base64>", "iv": "<base64>" }`.
- [ ] Inner payload: `timestamp`, `access_token`, `data`; optional `nonce`.
- [ ] AES-256-GCM + Base64; same key as gateway; random IV per request/response.
- [ ] Handle encrypted success body and plain JSON error body.
- [ ] Test health and at least one gateway call manually and from the app.
