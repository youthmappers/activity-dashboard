YouthMappers Activity Dashboard
===

A React + Vite web application that powers [activity.youthmappers.org](https://activity.youthmappers.org). The dashboard renders interactive maps, charts, and timelines from weekly YouthMappers activity outputs published to S3.

### Tech overview
- **Frontend**: React, Vite, React Router, Bootstrap.
- **Mapping**: MapLibre GL JS + PMTiles (built by tippecanoe in the data pipeline).
- **Charts**: D3 + Recharts.

### Data sources
Dashboard data (PMTiles + JSON/CSV/Parquet) is generated weekly by the YouthMappers changesets pipeline and published to S3. This repo consumes those published artifacts at runtime.

### Local development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```
