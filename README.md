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
npm test          # run battery CSV validation and metric tests
```

## Battery CSV sample

`test_battery_data.csv` is the synthetic demonstration dataset used by the
Analyze Battery page's **Download Sample CSV** and **Load Sample Dataset**
actions. The values are illustrative only; they are not real EV measurements.
The file includes timestamped temperature (°C), pack current (A; positive is
discharge and negative is charging/energy recovery), pack voltage (V),
cell-voltage delta (mV), cycle index, state of charge (%), and a provenance
label. Its changing measurements are provided to demonstrate the import,
preview, and history charts.

Upload it through **Choose CSV File**, or use **Load Sample Dataset** to preview
it without downloading first. Custom CSV files must include the same five
required measurement columns; `Timestamp`, `Pack Voltage (V)`, `Battery ID`,
and `Data Provenance` are optional. CSV parsing checks numeric values, SOC
range, units in headers, row structure, timestamps, and single-battery data
before enabling analysis. SOH is not inferred; it remains unavailable unless a
valid capacity-based method is supported. To calculate SOH, include either
`Measured Capacity` or `Current Capacity` and either `Rated Capacity` or
`Design Capacity` columns with matching units, for example
`Measured Capacity (kWh)` and `Rated Capacity (kWh)` (also supports `Ah` and
`Wh`). SOH is measured capacity divided by rated/design capacity, multiplied
by 100; values must be positive and measured capacity cannot exceed rated
capacity.

## Deployment

This repository is configured for deployment on Vercel. A `vercel.json` file is included, and the app is intended to be served as a frontend application.

## Notes

- Battery safety and health values shown in the UI are estimated indicators and should not replace certified battery testing or professional diagnostic workflows.
- Saved battery data is stored in the browser via `localStorage` for demo/prototype usage.

## License

This project currently does not specify a license.

## Author

Trishala Tripathi
