# Snowfall Forecast App

A simple, beautiful web application that displays expected snowfall in the user's area.

## Features

- 🌍 Automatic location detection via browser geolocation
- ✏️ Manual location input as fallback
- ❄️ Animated snowfall background
- 📊 Real-time weather data from Open-Meteo API
- 🔄 Auto-refresh every minute

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety with strict mode
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
cd snowfall-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to Cloudflare Pages

1. Push this repository to GitHub
2. Connect the repository to Cloudflare Pages
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 18 (or newer)

## APIs Used

- **[Open-Meteo](https://open-meteo.com/)** - Weather data (free, no API key required)
- **[Nominatim](https://nominatim.openstreetmap.org/)** - Reverse geocoding for location names
