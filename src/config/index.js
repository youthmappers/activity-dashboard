/**
 * Configuration module for YouthMappers Activity Dashboard
 * Centralized configuration for asset paths, API endpoints, and app settings
 */

// Base paths for different types of assets
const ASSET_PATHS = {
  data: '/data',
  images: '/assets/img',
  css: '/assets/css',
  js: '/assets/js',
}

// Data file paths
export const DATA_FILES = {
  chapters: `${ASSET_PATHS.data}/chapters_and_uids.json`,
  dailyActivity: `${ASSET_PATHS.data}/daily_activity.csv`,
  monthlyActivityAllTime: `${ASSET_PATHS.data}/monthly_activity_all_time.json`,
  monthlyActivityLastYear: `${ASSET_PATHS.data}/monthly_activity_last_year.json`,
  monthlyActivityLast1200Days: `${ASSET_PATHS.data}/monthly_activity_last_1200_days.json`,
  topEditedCountries: `${ASSET_PATHS.data}/top_edited_countries.json`,
  tiles: {
    res4: `${ASSET_PATHS.data}/res4.pmtiles`,
    res6: `${ASSET_PATHS.data}/res6.pmtiles`,
    res8: `${ASSET_PATHS.data}/res8.pmtiles`,
    res8Bboxes: `${ASSET_PATHS.data}/res8_bboxes.pmtiles`,
  }
}

// Image assets
export const IMAGES = {
  dashboards: {
    africa: `${ASSET_PATHS.images}/africa-dashboard.png`,
    asia: `${ASSET_PATHS.images}/asia-dashboard.png`,
    centralAmerica: `${ASSET_PATHS.images}/central-america-dashboard.png`,
    northAmerica: `${ASSET_PATHS.images}/north-america-dashboard.png`,
    screenshot: `${ASSET_PATHS.images}/dashboard_screenshot.png`,
  },
  // Add other image categories as needed
}

// App configuration
export const APP_CONFIG = {
  name: 'YouthMappers Activity Dashboard',
  version: '0.1.0',
  baseUrl: import.meta.env.VITE_BASE_URL || '/',
  
  // Map configuration
  map: {
    defaultCenter: [0, 20], // longitude, latitude
    defaultZoom: 2,
    maxZoom: 18,
    minZoom: 1,
  },
  
  // Timeline configuration
  timeline: {
    defaultTimeRange: 365, // days
    maxTimeRange: 1200, // days
  },
  
  // Chart colors and themes
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    // YouthMappers brand colors (adjust as needed)
    brand: {
      primary: '#FF6B35',
      secondary: '#004E89',
      accent: '#1A659E',
    }
  },
  
  // Animation and transition settings
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: 'ease-in-out',
  },
}

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || '',
  enableDebugMode: import.meta.env.VITE_DEBUG === 'true',
}

// Utility functions for asset management
export const getAssetUrl = (path) => {
  const baseUrl = APP_CONFIG.baseUrl.endsWith('/') 
    ? APP_CONFIG.baseUrl.slice(0, -1) 
    : APP_CONFIG.baseUrl
  const assetPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${assetPath}`
}

export const getDataUrl = (filename) => {
  return getAssetUrl(`${ASSET_PATHS.data}/${filename}`)
}

export const getImageUrl = (filename) => {
  return getAssetUrl(`${ASSET_PATHS.images}/${filename}`)
}

// Export all configurations as a single object for convenience
export const CONFIG = {
  app: APP_CONFIG,
  env: ENV_CONFIG,
  data: DATA_FILES,
  images: IMAGES,
  colors: APP_CONFIG.colors,
  animations: APP_CONFIG.animations,
}

export default CONFIG
