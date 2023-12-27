YouthMappers Activity Dashboard
===

This repository contains the static files behind [activity.youthmappers.org](https://activity.youthmappers.org), deployed via Github Pages.

The main map is powered by [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) with by [PMTiles](https://docs.protomaps.com/pmtiles/) created with [tippecanoe](https://github.com/felt/tippecanoe). 

### Local Development
Since this page requires PMTiles, you'll need a local webserver that supports http-range lookup and CORS. [http-server](https://github.com/http-party/http-server) works great (`brew install http-server`): 

```bash
http-server --cors
```

### Data files
The files under the `data` directory are built from scripts and queries in the [activity-dashboard-backend](https://github.com/youthmappers/activity-dashboard-backend) repository.

[![Deploy static content to Pages](https://github.com/youthmappers/activity-dashboard/actions/workflows/static.yml/badge.svg)](https://github.com/youthmappers/activity-dashboard/actions/workflows/static.yml)
