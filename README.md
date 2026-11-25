# Life Simulator

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S31XB030)

Tune your daily habits — sleep, work, fun, exercise, social life, diet, education, money skills and risk tolerance — and watch a whole simulated life unfold as a timeline of events, with final scores for health, wealth, happiness, career and relationships.

**Live:** https://hellenicdev.eu/life-simulator/frontend/

## Features

- 10 habit sliders that shape a randomised, weighted life timeline
- Event timeline with icons (career, health, relationships, setbacks, milestones…)
- Final scoreboard, an overall life score and a written life summary
- Reroll the same habits for a different life
- Global anonymous stats (average scores, top/bottom score, most common event)
- Rate limiting, CORS allow-list and an admin-only stats reset

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript (GitHub Pages)
- **Backend:** Node.js, Express, express-rate-limit (in-memory sessions, no database)

## Setup

```bash
git clone https://github.com/hellenicdev/life-simulator.git
cd life-simulator/backend
npm install
npm start      # http://localhost:3000
```

Serve `frontend/` with any static server and point `API_URL` in `frontend/script.js` at your backend.

### Environment variables

| Name | Description |
| --- | --- |
| `CORS_ORIGIN` | Allowed browser origin (default `https://hellenicdev.eu`) |
| `ADMIN_TOKEN` | Token for `POST /stats/reset` (disabled when unset) |
| `MAX_SESSIONS` | Max sessions kept in memory (default 1000) |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window (default 60000) |
| `RATE_LIMIT_MAX` | Requests per window (default 60) |
| `PORT` | HTTP port (default 3000) |

### API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/simulate` | Simulate a life from habit inputs |
| POST | `/reroll` | Re-simulate with `{ input }` without recording stats |
| GET | `/stats` | Global aggregate stats |
| GET | `/history?limit=10` | Most recent simulations (max 50) |
| GET | `/api/health` | Health check |

## Project structure

```
├── backend/
│   └── server.js     # Express API + simulation engine
└── frontend/
    ├── index.html
    ├── script.js
    └── style.css
```

## License

MIT — see [LICENSE](LICENSE).

---

Made by [HellenicDev](https://hellenicdev.eu).
