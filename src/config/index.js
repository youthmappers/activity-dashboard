/**
 * Configuration module for YouthMappers Activity Dashboard
 * Centralized configuration for asset paths, API endpoints, and app settings
 * 
 * Key Features:
 * - Dynamic loading of activity.json with chapters and dataset date (ds)
 * - Automatic path resolution based on ds value
 * - Support for both /public and /data asset locations
 * - Utility functions for chapter management and URL generation
 */

// Base paths for different types of assets
const ASSET_PATHS = {
  data: '/data',        // Legacy data files and tiles
  images: '/assets/img', // Image assets
  css: '/assets/css',    // Stylesheets
  js: '/assets/js',      // JavaScript assets
  public: '/public',     // New location for core data files
}

// Global variable to store activity data and ds value
let activityData = null;
let datasetDate = null;

/**
 * Fetch and cache activity data from public/activity.json
 * @returns {Promise<Object>} Activity data containing chapters and ds
 */
export const fetchActivityData = async () => {
  if (activityData) {
    return activityData;
  }

  try {
    const response = await fetch(`${ASSET_PATHS.public}/activity.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.status}`);
    }
    activityData = await response.json();
    datasetDate = activityData.ds;
    return activityData;
  } catch (error) {
    console.error('Error fetching activity data:', error);
    // Fallback to a default date if fetch fails
    datasetDate = '2025-08-04';
    activityData = { chapters: [], ds: datasetDate };
    return activityData;
  }
};

/**
 * Get the current dataset date (ds value)
 * @returns {string|null} Dataset date or null if not loaded yet
 */
export const getDatasetDate = () => datasetDate;

/**
 * Generate data file paths using the ds value from activity.json
 * @param {string} ds - Dataset date string
 * @returns {Object} Data file paths object
 */
const generateDataFiles = (ds) => {
  // Base CloudFront URL for PMTiles with dynamic ds
  const cdnBaseUrl = ds 
    ? `https://d1tgv18374hiy.cloudfront.net/activity-dashboard/ds=${ds}`
    : `https://d1tgv18374hiy.cloudfront.net/activity-dashboard/ds=2025-08-04`; // fallback

  return {
    // Use activity.json from public folder for chapters (includes ds)
    activity: `${ASSET_PATHS.public}/activity.json`,
    // Legacy chapters path for backwards compatibility
    chapters: `${ASSET_PATHS.data}/chapters_and_uids.json`,
    // Core data files now in public folder
    dailyActivity: `${ASSET_PATHS.public}/daily_activity.csv`,
    monthlyActivityAllTime: `${ASSET_PATHS.public}/monthly_activity_all_time.json`,
    // Remaining data files with ds-based paths (still in /data if needed)
    monthlyActivityLastYear: `${ASSET_PATHS.data}/monthly_activity_last_year.json`,
    monthlyActivityLast1200Days: `${ASSET_PATHS.data}/monthly_activity_last_1200_days.json`,
    topEditedCountries: `${ASSET_PATHS.data}/top_edited_countries.json`,
    // PMTiles now served from CloudFront CDN with dynamic ds
    tiles: {
      res4: `${cdnBaseUrl}/res4.pmtiles`,
      res6: `${cdnBaseUrl}/res6.pmtiles`,
      res8: `${cdnBaseUrl}/res8.pmtiles`,
      res8Bboxes: `${cdnBaseUrl}/res8_bboxes.pmtiles`,
    }
  };
};

// Default data files (will be updated once activity data is loaded)
export let DATA_FILES = generateDataFiles(null);

/**
 * Update DATA_FILES with the actual ds value from activity.json
 * This should be called after fetching activity data
 * @param {string} ds - Dataset date string
 */
export const updateDataFiles = (ds) => {
  DATA_FILES = generateDataFiles(ds);
  datasetDate = ds;
};

/**
 * Initialize configuration by fetching activity data and updating paths
 * @returns {Promise<Object>} Activity data
 */
export const initializeConfig = async () => {
  const data = await fetchActivityData();
  if (data.ds) {
    updateDataFiles(data.ds);
  }
  return data;
};

/**
 * Get chapters data from the loaded activity data
 * @returns {Array} Array of chapter objects
 */
export const getChaptersData = () => {
  return activityData?.chapters || [];
};

/**
 * Get a specific chapter by ID
 * @param {number} chapterId - The chapter ID to find
 * @returns {Object|null} Chapter object or null if not found
 */
export const getChapterById = (chapterId) => {
  const chapters = getChaptersData();
  return chapters.find(chapter => chapter.chapter_id === chapterId) || null;
};

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
  
  // CDN configuration
  cdn: {
    baseUrl: 'https://d1tgv18374hiy.cloudfront.net/activity-dashboard',
    defaultDs: '2025-08-04', // fallback dataset date
  },
  
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

export const getPublicUrl = (filename) => {
  return getAssetUrl(`${ASSET_PATHS.public}/${filename}`)
}

/**
 * Generate CDN URL for tiles and other CDN assets
 * @param {string} filename - The filename to append to the CDN URL
 * @param {string} ds - Optional dataset date, uses current datasetDate if not provided
 * @returns {string} Full CDN URL
 */
export const getCdnUrl = (filename, ds = null) => {
  const currentDs = ds || datasetDate || APP_CONFIG.cdn.defaultDs
  return `${APP_CONFIG.cdn.baseUrl}/ds=${currentDs}/${filename}`
}

/**
 * Get the current CDN base URL with the loaded ds value
 * @returns {string} CDN base URL with current ds
 */
export const getCurrentCdnBase = () => {
  const currentDs = datasetDate || APP_CONFIG.cdn.defaultDs
  return `${APP_CONFIG.cdn.baseUrl}/ds=${currentDs}`
}

// Export all configurations as a single object for convenience
export const CONFIG = {
  app: APP_CONFIG,
  env: ENV_CONFIG,
  data: DATA_FILES,
  images: IMAGES,
  colors: APP_CONFIG.colors,
  animations: APP_CONFIG.animations,
  // Configuration functions
  initialize: initializeConfig,
  getChapters: getChaptersData,
  getChapter: getChapterById,
  getDatasetDate: getDatasetDate,
  fetchActivity: fetchActivityData,
  // URL utilities
  getCdnUrl: getCdnUrl,
  getCurrentCdnBase: getCurrentCdnBase,
}

export default CONFIG
