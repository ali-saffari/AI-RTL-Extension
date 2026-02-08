// API endpoint for sites configuration
// const API_BASE_URL = 'https://api.chatgpt-rtl.ir';
// const PRODUCTION_EXTENSION_ID = 'pjpmebofipgpjaincgoboibbmicccbne';

// Cache
// let cachedConfig = null;
// let configPromise = null;

// Get environment: production if ID matches, otherwise development
// function getEnvironment() {
//     if (chrome?.runtime?.id === PRODUCTION_EXTENSION_ID) {
//         return 'production';
//     }
//     return 'development';
// }

// Fetch sites configuration from API (sites-config commented out)
// async function fetchSitesConfig(forceRefresh = false) {
//     if (cachedConfig && !forceRefresh) {
//         return cachedConfig;
//     }
//     if (configPromise && !forceRefresh) {
//         return configPromise;
//     }
//     configPromise = (async () => {
//         try {
//             const env = getEnvironment();
//             const url = `${API_BASE_URL}/api/sites-config?env=${env}`;
//             const response = await fetch(url);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             const data = await response.json();
//             if (data.success && data.data) {
//                 cachedConfig = data.data;
//                 return cachedConfig;
//             }
//             throw new Error('Invalid response from API');
//         } catch (error) {
//             console.error('Error fetching sites config:', error);
//             return {};
//         } finally {
//             configPromise = null;
//         }
//     })();
//     return configPromise;
// }

// Export async function to get config
// export async function getSitesConfig(forceRefresh = false) {
//     return await fetchSitesConfig(forceRefresh);
// }

// Export environment
// export function getEnvironmentName() {
//     return getEnvironment();
// }

// Stubs so imports don't break (entire file commented out)
export async function getSitesConfig() {
    return {};
}
export function getEnvironmentName() {
    return 'development';
}
