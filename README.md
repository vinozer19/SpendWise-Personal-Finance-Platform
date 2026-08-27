# SpendWise – Personal Finance Intelligence Dashboard

SpendWise is a premium, local-first personal finance dashboard designed to make spending, budgeting and financial health easy to understand.

## Features

- Modern fintech SaaS dashboard with light/dark themes
- Dynamic balance, income, expenses, savings and savings-rate KPIs
- Transaction CRUD with validation
- Search, filter and sort transactions
- CSV export to `spendwise-transactions.csv`
- Monthly and category budgets with overspending detection
- Chart.js analytics for cash flow, category mix, expenses, savings and payment methods
- Dynamic financial intelligence insights
- Financial Health Score out of 100
- 30–40 realistic Indian demo transactions on first launch
- LocalStorage persistence
- Responsive desktop, tablet and mobile navigation
- Accessible labels, focus states, semantic controls and modal behavior
- No framework or backend required

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript ES6+
- Chart.js 4 via CDN
- LocalStorage
- Browser Blob API for CSV export

## UI/UX Design

The interface follows a premium fintech direction: generous spacing, rounded surfaces, restrained gradients, subtle borders/shadows, high-contrast typography, clear financial status colors and lightweight micro-interactions.

Light mode uses white surfaces and soft gray backgrounds. Dark mode uses deep charcoal surfaces with subtle borders. Green represents positive financial movement, red represents expense/warning states, while blue/purple support analytics.

## Project Structure

```text
spendwise/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Setup

1. Download or clone the project.
2. Keep the four files in the same folder.
3. Open `index.html` in a modern browser.
4. No build step or server is required.

Chart.js is loaded from its CDN, so an internet connection is required for charts. The rest of the application is client-side.

## LocalStorage Architecture

SpendWise stores one JSON object under the key `spendwise_v1`:

- `transactions`
- `budget`
- `categoryBudgets`
- `theme`

Transactions are never replaced by demo data after the first stored state exists. Refreshing the browser keeps the user's data.

## Chart.js Usage

Chart.js powers:

- Income vs Expenses
- Monthly Expenses
- Category Spending
- Savings Trend
- Payment Method Distribution

Analytics are recalculated from the selected time range and transaction dataset. Charts are destroyed and recreated when the period or theme changes to keep the UI synchronized.

## Demo Data

On the first launch, SpendWise creates 38 realistic transactions using Indian scenarios such as salary, Swiggy, Zomato, Amazon, Uber, groceries, utilities, Netflix, pharmacy, fuel, college fees and shopping.

The demo data is only created when no SpendWise LocalStorage state exists.

## Future Improvements

- Recurring transaction automation
- Import transactions from bank CSV files
- Multiple accounts and wallets
- Financial goals
- Subscription detection
- Budget rollover
- PWA/offline caching
- More advanced forecasting
- Optional cloud sync with authentication

## Screenshots

Add portfolio screenshots here after capturing the dashboard:

```text
![SpendWise Dashboard](dashboard.png)
```

## License

Free to adapt for personal portfolios and learning projects.
