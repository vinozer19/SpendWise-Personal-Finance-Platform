# CivicFix – Smart City Issue Reporting & Resolution Platform

CivicFix is a realistic, responsive citizen-operations web application for reporting public infrastructure problems, tracking service progress, and understanding city-level issue trends.

## Features

- Citizen dashboard with total, open, in-progress, resolved and high-priority metrics
- Issue reporting workflow with category, location, severity, affected population and safety risk
- Smart priority engine that converts multiple risk signals into High / Medium / Low priority
- Status workflow: **Reported → Assigned → In Progress → Resolved**
- Report detail modal with department, resolution date and timeline
- Interactive Leaflet city map with category-based markers
- Search, category, priority and status filters
- Newest/oldest sorting
- Analytics for category, area, resolution time, monthly volume and status distribution
- Optional image preview/storage using LocalStorage
- Responsive government-tech/SaaS UI
- Light/dark mode
- Toast notifications and modal dialogs
- Seeded realistic Chennai-style demo city data

## Files

```text
civicfix/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

Because the application is client-side only, no backend is required.

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — Recommended local server

From the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

A local server is recommended for predictable browser behavior and external CDN loading.

## Technology

- HTML5 semantic structure
- CSS3 responsive layout and design system
- Vanilla JavaScript ES6+
- Browser LocalStorage for persistence
- FileReader API for local image preview/storage
- Leaflet.js 1.9.4 via CDN
- OpenStreetMap tiles

## Data model

Each report contains:

- `id`
- `title`
- `description`
- `category`
- `location`
- `date`
- `priority`
- `severity`
- `affected`
- `safety`
- `status`
- `department`
- `resolutionDate`
- `lat`
- `lng`
- `history`
- `createdAt`
- optional `image`

Reports are persisted under:

```text
civicfix_reports_v1
```

Theme preference is persisted under:

```text
civicfix_theme
```

## Smart priority logic

Priority is intentionally transparent rather than being a black-box ML prediction.

The score combines:

1. Category risk weight
2. Severity
3. Number of affected people
4. Safety risk

Higher combined risk produces a High priority classification. The interface also explains which factors drove the classification.

## Demo data

The first launch seeds the browser with realistic city issue records across areas such as Anna Salai, Adyar, T. Nagar, Velachery, Nungambakkam, Besant Nagar, Guindy, Mylapore and other Chennai-area locations.

To reset the demo dataset, open the browser developer console and run:

```js
localStorage.removeItem("civicfix_reports_v1");
location.reload();
```

## Production roadmap

For a production deployment, the LocalStorage layer can be replaced by an API and database while retaining the existing UI:

- Citizen authentication and role-based access
- PostgreSQL/PostGIS for reports and geospatial queries
- REST/GraphQL API
- Image storage with signed URLs
- Department/operator console
- Real-time status notifications
- SLA breach detection
- Duplicate issue clustering
- GPS capture and address geocoding
- Audit logs
- Privacy controls and moderation
- Accessibility testing against WCAG 2.2 AA
- Observability, automated tests and CI/CD

## Accessibility

The UI uses semantic controls, visible focus states, accessible labels, responsive layouts, sufficient text hierarchy and modal dialog semantics. A production release should still be validated with keyboard-only navigation, screen readers and automated accessibility testing.

## License

Use and adapt this demo project for portfolio, learning and prototyping purposes.
