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

// Global variable to store activity data and ds value
let activityData = null;
let datasetDate = null;

// App configuration
export const APP_CONFIG = {
  name: 'YouthMappers Activity Dashboard',
  version: '0.1.0',
  baseUrl: import.meta.env.VITE_BASE_URL || '/',
  
  // CDN configuration
  cdn: {
    baseUrl: 'https://d1tgv18374hiy.cloudfront.net',
    assetsPath: '/assets',
    activityDashboardPath: '/activity-dashboard',
    activityJsonPath: '/activity-dashboard/activity.json',
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

// ============================================================================
// ASSET PATH FUNCTIONS - The only 3 we need!
// ============================================================================

/**
 * 1. Local assets from public folder (respects VITE base URL)
 * @param {string} path - Path to asset (e.g., '/activity.json')
 * @returns {string} Full URL to local asset
 */
export const getLocalAssetUrl = (path) => {
  const baseUrl = APP_CONFIG.baseUrl.endsWith('/') 
    ? APP_CONFIG.baseUrl.slice(0, -1) 
    : APP_CONFIG.baseUrl
  const assetPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${assetPath}`
}

/**
 * 2. Static CDN assets from cdn/assets folder
 * @param {string} filename - Filename (e.g., 'logo.png')
 * @returns {string} Full CDN assets URL
 */
export const getStaticCdnUrl = (filename) => {
  return `${APP_CONFIG.cdn.baseUrl}${APP_CONFIG.cdn.assetsPath}/${filename}`
}

/**
 * 3. Latest assets from activity-dashboard/ds=<ds> path
 * @param {string} filename - Filename (e.g., 'res8.pmtiles')
 * @param {string} ds - Optional dataset date, uses current datasetDate if not provided
 * @returns {string} Full CDN URL with ds path
 */
export const getLatestAssetUrl = (filename, ds = null) => {
  const currentDs = ds || datasetDate || APP_CONFIG.cdn.defaultDs
  return `${APP_CONFIG.cdn.baseUrl}${APP_CONFIG.cdn.activityDashboardPath}/ds=${currentDs}/${filename}`
}

// ============================================================================
// DATA LOADING AND INITIALIZATION
// ============================================================================

/**
 * Fetch and cache activity data from public/activity.json
 * @returns {Promise<Object>} Activity data containing chapters and ds
 */
export const fetchActivityData = async () => {
  if (activityData) {
    return activityData;
  }

  try {
    const response = await fetch(`${APP_CONFIG.cdn.baseUrl}${APP_CONFIG.cdn.activityJsonPath}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.status}`);
    }
    activityData = await response.json();
    datasetDate = activityData.ds;
    return activityData;
  } catch (error) {
    console.error('Error fetching activity data:', error);
    // Fallback to a default date if fetch fails
    datasetDate = APP_CONFIG.cdn.defaultDs;
    activityData = { chapters: [], ds: datasetDate };
    return activityData;
  }
};

/**
 * Initialize configuration by fetching activity data
 * @returns {Promise<Object>} Activity data
 */
export const initializeConfig = async () => {
  const data = await fetchActivityData();
  return data;
};

// ============================================================================
// DATA ACCESS HELPERS
// ============================================================================

/**
 * Get the current dataset date (ds value)
 * @returns {string|null} Dataset date or null if not loaded yet
 */
export const getDatasetDate = () => datasetDate;

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

// ============================================================================
// DATA FILES - Using our 3 asset URL functions
// ============================================================================

export const DATA_FILES = {
  // Local public assets
  activity: () => `${APP_CONFIG.cdn.baseUrl}${APP_CONFIG.cdn.activityJsonPath}`,
  weeklyChapterActivity: () => getLatestAssetUrl('weekly_chapter_activity.csv'),
  monthlyActivityAllTime: () => getLatestAssetUrl('monthly_activity_all_time.json'),
  topEditedCountries: () => getLatestAssetUrl('top_edited_countries.json'),
  
  // Latest CDN assets (PMTiles with current ds)
  tiles: {
    res4: () => getLatestAssetUrl('res4.pmtiles'),
    res6: () => getLatestAssetUrl('res6.pmtiles'), 
    res8: () => getLatestAssetUrl('res8.pmtiles'),
    res8Bboxes: () => getLatestAssetUrl('res8_bboxes.pmtiles'),
  }
};

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || '',
  enableDebugMode: import.meta.env.VITE_DEBUG === 'true',
}

// ============================================================================
// SIMPLIFIED EXPORT - Just what we need!
// ============================================================================

export const CONFIG = {
  app: APP_CONFIG,
  env: ENV_CONFIG,
  data: DATA_FILES,
  colors: APP_CONFIG.colors,
  animations: APP_CONFIG.animations,
  // Configuration functions
  initialize: initializeConfig,
  getChapters: getChaptersData,
  getChapter: getChapterById,
  getDatasetDate: getDatasetDate,
  fetchActivity: fetchActivityData,
  // The 3 asset URL functions
  getLocalAssetUrl: getLocalAssetUrl,
  getStaticCdnUrl: getStaticCdnUrl,
  getLatestAssetUrl: getLatestAssetUrl,
}

export default CONFIG
