
# BoardReady — Live Leaderboard as a Service

A real-time, embeddable leaderboard system. Any site can integrate live, ranked
scoreboards without building their own backend or WebSocket infrastructure.

**Positioning:** most leaderboard tools (e.g. BoardQ) gate API/developer access
behind a premium tier. BoardReady flips that — the API-first, developer-facing
integration is the core product from day one, not an upsell.

---

## Status: v1 (MVP)

v1 proves the core real-time loop: submit a score, rank it instantly, broadcast
the update live to everyone watching. Deliberately minimal — see
[Scope](#scope) below for what's in and what's deferred.

---

## Architecture

```
Client (React / any WebSocket client)
        │
        │  ws://...  (single persistent connection)
        │
┌───────▼────────────────────────────┐
│         Node.js backend             │
│                                      │
│  config/     → connection setup     │
│    ├─ redis.js   (ioredis client,   │
│    │   exponential backoff retry)   │
│    └─ ws.js      (WebSocketServer,  │
│        wires connection/message/    │
│        close events)                │
│                                      │
│  services/   → behavior             │
│    ├─ redis.service.js              │
│    │   addScore(), getTopScores()   │
│    └─ websocket.service.js          │
│        handleConnection/Message/    │
│        Close, broadcastLeaderboard  │
└───────┬──────────────────────────┬──┘
        │                          │
        ▼                          ▼
   Redis (sorted set)      All connected clients
   ZADD / ZREVRANGE          (broadcast on update)
```

**Why WebSocket-only (no REST) for writes:** early design used REST for score
submission with WebSocket for push-only updates. For high-frequency use cases
(e.g. a live typing-race leaderboard updating on every keystroke), a
persistent WebSocket connection avoids repeated HTTP handshake/header overhead
per submission. Since the connection is already open for broadcast, submitting
through the same channel removes a redundant REST layer entirely.

**Why Redis sorted sets:** `ZADD` / `ZREVRANGE` give O(log N) ranked inserts
and reads natively — no manual sorting, no `ORDER BY` re-computation per
request.

---

## Message protocol

**Client → Server**

```json
{ "type": "submit_score", "name": "alice", "score": 87 }
```

**Server → Client** (on connect, and after any submission)

```json
{ "type": "leaderboard_update", "data": [{ "name": "alice", "score": 87 }] }
```

**Server → Client** (on invalid input)

```json
{ "type": "error", "message": "Invalid score" }
```

A new connection immediately receives the current leaderboard state — no
separate REST call needed before the socket starts delivering live data.

---

## Running locally

**Requirements:** Node 20+, Docker (for Redis)

```bash
# 1. Start Redis
docker compose up -d

# 2. Backend
cd backend
npm install
npm run dev        # http://localhost:3000 (WebSocket + static files)

# 3. Frontend
cd frontend
npm install
npm run dev         # Vite dev server, default http://localhost:5173
```

Copy `.env.example` to `.env` in `backend/` before starting (see below).

---

## Scope

### v1 (this version)

- Single leaderboard (`leaderboard:main`)
- WebSocket-only: connect, submit score, receive live broadcasts
- No auth — any client can submit a score for any name
- Redis only — no persistence layer beyond Redis's own AOF
- Score submission is set-based (`ZADD`), not incremental

### Deferred to v2

- Multiple boards, each with an API key
- `join` message type (adds player at score 0) + subsequent `submit_score`
  messages using `ZINCRBY` (incremental) instead of `ZADD` (overwrite)
- Auth on score submission (prevent impersonation)
- Postgres for durable score history / board metadata
- Subdomain-based hosted frontend per client
- Rate limiting

---

## Tech stack

- **Backend:** Node.js, Express (static file serving), `ws` (WebSocket),
  `ioredis`
- **Data:** Redis (sorted sets)
- **Frontend:** React (Vite)
- **Infra (dev):** Docker Compose (Redis)
