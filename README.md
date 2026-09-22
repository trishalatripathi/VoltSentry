# VoltSentry

VoltSentry is a battery health and safety monitoring dashboard for electric vehicles. It helps users track state of health (SOH), thermal and electrical risk, charging trends, and battery passport information in a clean dashboard experience.

Live demo: https://volt-sentry.vercel.app

## Overview

VoltSentry brings together:

- EV battery health monitoring
- Safety risk assessment for thermal, electrical, and charging conditions
- Battery passport / lifecycle information
- Historical battery tracking
- A landing page + dashboard workflow for analysis

The app is built with React and Vite, and is designed to be deployed as a front-end experience for EV battery monitoring.

## Features

- Dashboard overview with core battery metrics
- Analyze Battery flow for deeper inspection of EV battery conditions
- Battery Passport view for second-life or lifecycle tracking
- History / My Batteries page for saved battery records
- Risk indicators for:
  - Thermal risk
  - Electrical risk
  - Charging risk
  - Cell imbalance risk
- Responsive UI optimized for browser-based monitoring

## Tech Stack

- React
- Vite
- React Router DOM
- CSS
- localStorage for saved battery data

## Project Structure

```text
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── main-website/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── test_battery_data.csv
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

This will start the Vite development server, usually at:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev       # start development server
npm run build     # build production bundle
npm run preview   # preview production build
npm run lint      # run ESLint
```

## Deployment

This repository is configured for deployment on Vercel. A `vercel.json` file is included, and the app is intended to be served as a frontend application.

## Notes

- Battery safety and health values shown in the UI are estimated indicators and should not replace certified battery testing or professional diagnostic workflows.
- Saved battery data is stored in the browser via `localStorage` for demo/prototype usage.

## License

This project currently does not specify a license.

## Author

Trishala Tripathi
