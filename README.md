# Deposits

> Deposit tracking app — track bank deposits, calculate interest, forecast earnings.

Built with **React + TypeScript + Vite** and **[Gravity UI](https://gravity-ui.com/)** (Yandex UI kit).

## Features

- **Deposit dashboard** — total amount, monthly interest, yearly forecast
- **CRUD deposits** — add, edit, close, and delete deposits
- **Smart calculations** — monthly/quarterly/yearly/end-of-term interest periods
- **Custom themes** — light & dark mode with a blue-purple palette
- **Mobile-first** — works well on phones
- **Local storage** — all data stays on your device

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite |
| UI Kit | Gravity UI (Yandex) |
| Date picker | @gravity-ui/date-components |
| Routing | React Router v7 |
| Storage | localStorage |
| Styling | CSS + Gravity UI theme variables |

## Usage

Open the app: [https://sinclaw-bot.github.io/deposits/](https://sinclaw-bot.github.io/deposits/)

No backend, no signup. All data stays in your browser (localStorage).

## Development

```bash
git clone git@github.com:sinclaw-bot/deposits.git
cd deposits
npm install
npm run dev     # dev server at localhost:5173
npm run build   # production build → dist/
```

## License

MIT
