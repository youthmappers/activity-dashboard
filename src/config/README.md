# Configuration Module

This configuration module provides centralized management of static assets, data files, and application settings for the YouthMappers Activity Dashboard.

## Features

- **Asset Path Management**: Centralized paths for images, data files, CSS, and JavaScript
- **Environment Configuration**: Development/production settings and environment variables
- **Theme and Color Management**: Consistent color schemes and branding
- **Map and Timeline Defaults**: Default settings for map and timeline components
- **Utility Functions**: Helper functions for asset URL generation

## Usage

### Basic Import

```javascript
import { CONFIG, DATA_FILES, IMAGES, APP_CONFIG } from './config'
```

### Loading Data Files

```javascript
import { DATA_FILES } from './config'

// Load chapters data
fetch(DATA_FILES.chapters)
  .then(response => response.json())
  .then(data => console.log(data))

// Load tile data
const tileUrl = DATA_FILES.tiles.res8
```

### Using Images

```javascript
import { IMAGES, getImageUrl } from './config'

// Predefined image paths
<img src={IMAGES.dashboards.africa} alt="Africa Dashboard" />

// Dynamic image paths
<img src={getImageUrl('custom-image.png')} alt="Custom" />
```

### App Configuration

```javascript
import { APP_CONFIG } from './config'

// Use app settings
const mapCenter = APP_CONFIG.map.defaultCenter
const brandColor = APP_CONFIG.colors.brand.primary
const appName = APP_CONFIG.name
```

### Environment Settings

```javascript
import { ENV_CONFIG } from './config'

if (ENV_CONFIG.isDevelopment) {
  console.log('Running in development mode')
}

const apiUrl = ENV_CONFIG.apiUrl
```

## Data Service

The included data service provides consistent data loading with caching:

```javascript
import { dataService } from './services/dataService'

// Load specific data
const chapters = await dataService.loadChapters()

// Load all data at once
const allData = await dataService.loadAllData()

// Cache management
dataService.clearCache()
```

## React Hooks

Use the provided hooks for consistent data loading in React components:

```javascript
import { useChapters, useMonthlyActivity } from './hooks/useData'

function MyComponent() {
  const { data: chapters, loading, error } = useChapters()
  const { data: monthlyData } = useMonthlyActivity('lastYear')
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{/* Your component */}</div>
}
```

## Configuration Structure

### DATA_FILES
- `chapters`: Chapter and UID data
- `dailyActivity`: Daily activity CSV
- `monthlyActivityAllTime`: All-time monthly activity
- `monthlyActivityLastYear`: Last year's monthly activity
- `monthlyActivityLast1200Days`: Last 1200 days monthly activity
- `topEditedCountries`: Top edited countries data
- `tiles`: PMTiles data at different resolutions

### IMAGES
- `dashboards`: Regional dashboard screenshots
  - `africa`, `asia`, `centralAmerica`, `northAmerica`
  - `screenshot`: Main dashboard screenshot

### APP_CONFIG
- `name`: Application name
- `version`: Application version
- `map`: Default map settings (center, zoom levels)
- `timeline`: Timeline configuration
- `colors`: Color scheme and branding
- `animations`: Animation duration and easing settings

## Environment Variables

The config supports these environment variables:

- `VITE_BASE_URL`: Base URL for the application
- `VITE_API_URL`: API endpoint URL
- `VITE_DEBUG`: Enable debug mode (`true`/`false`)

## Migration Guide

### From Direct Fetch Calls

Before:
```javascript
fetch('/data/chapters_and_uids.json')
```

After:
```javascript
import { DATA_FILES } from './config'
fetch(DATA_FILES.chapters)
```

### From Hardcoded Paths

Before:
```javascript
<img src="/assets/img/africa-dashboard.png" />
```

After:
```javascript
import { IMAGES } from './config'
<img src={IMAGES.dashboards.africa} />
```

### From Inline Configuration

Before:
```javascript
const mapConfig = { center: [0, 20], zoom: 2 }
```

After:
```javascript
import { APP_CONFIG } from './config'
const mapConfig = {
  center: APP_CONFIG.map.defaultCenter,
  zoom: APP_CONFIG.map.defaultZoom
}
```

## Best Practices

1. **Always use the config**: Don't hardcode asset paths or configuration values
2. **Use data hooks**: Prefer `useChapters()` over direct fetch calls
3. **Handle loading states**: Always check for loading and error states
4. **Leverage caching**: The data service automatically caches responses
5. **Environment awareness**: Use `ENV_CONFIG` for environment-specific behavior
6. **Consistent theming**: Use colors from `APP_CONFIG.colors` for consistent styling
