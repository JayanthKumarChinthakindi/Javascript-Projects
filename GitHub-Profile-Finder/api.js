/**
 * GitHub Profile Finder
 * API Module: Handles REST communication with GitHub API
 */

"use strict";

const GITHUB_API_BASE_URL = "https://api.github.com";

// In-Memory cache maps with 5-minute TTL to optimize performance
const profileCache = new Map();
const repositoriesCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Checks if a cached response is valid (not expired).
 * @param {Map} cacheMap - Target cache map
 * @param {string} key - Cache lookup key
 * @returns {Object|null} - Cached data or null if not found/expired
 */
function getCachedData(cacheMap, key) {
  if (!cacheMap.has(key)) return null;
  const entry = cacheMap.get(key);
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cacheMap.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Saves response data to cache map with timestamp.
 * @param {Map} cacheMap - Target cache map
 * @param {string} key - Cache key
 * @param {Object} data - Response payload
 */
function setCachedData(cacheMap, key, data) {
  cacheMap.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Maps HTTP response statuses to user-friendly messages.
 * @param {Response} response - Fetch API Response object
 * @param {string} username - Target username
 * @returns {string} - Human-readable error message
 */
function mapHttpStatusToError(response, username) {
  if (response.status === 404) {
    return `User "${username}" not found. Please verify the spelling.`;
  }
  if (response.status === 403 || response.status === 429) {
    return "GitHub API rate limit exceeded. Please try again later.";
  }
  if (response.status >= 500) {
    return "GitHub service is temporarily unavailable. Please try again later.";
  }
  return `API Error: Received status ${response.status}`;
}

/**
 * Fetches user profile data from the GitHub REST API.
 * @param {string} username - Validated GitHub username
 * @returns {Promise<Object>} - Promise resolving to the user profile JSON object
 * @throws {Error} - Propagates network errors and specific API failures
 */
async function getUserProfile(username) {
  const cacheKey = username.toLowerCase();
  const cached = getCachedData(profileCache, cacheKey);
  if (cached) {
    console.log(`[api.js] Profile Cache Hit for: "${username}"`);
    return cached;
  }

  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(mapHttpStatusToError(response, username));
    }
    
    const data = await response.json();
    
    // Validate that we received a valid user profile object
    if (!data || typeof data !== "object" || !data.login) {
      throw new Error("Received an unexpected response format from GitHub. Please try again.");
    }
    
    setCachedData(profileCache, cacheKey, data);
    return data;
  } catch (error) {
    if (error.message.includes("not found") || error.message.includes("rate limit") || error.message.includes("temporarily unavailable") || error.message.includes("unexpected response")) {
      throw error;
    }
    throw new Error("Network error occurred. Please check your internet connection.");
  }
}

/**
 * Fetches user repositories from the GitHub REST API.
 * @param {string} username - Validated GitHub username
 * @returns {Promise<Array>} - Promise resolving to an array of repository objects
 * @throws {Error} - Propagates network errors and specific API failures
 */
async function getUserRepositories(username) {
  const cacheKey = username.toLowerCase();
  const cached = getCachedData(repositoriesCache, cacheKey);
  if (cached) {
    console.log(`[api.js] Repositories Cache Hit for: "${username}"`);
    return cached;
  }

  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(mapHttpStatusToError(response, username));
    }
    
    const data = await response.json();
    
    // Validate that we received a valid repository array
    if (!Array.isArray(data)) {
      throw new Error("Received an unexpected response format from GitHub. Please try again.");
    }
    
    setCachedData(repositoriesCache, cacheKey, data);
    return data;
  } catch (error) {
    if (error.message.includes("not found") || error.message.includes("rate limit") || error.message.includes("temporarily unavailable") || error.message.includes("unexpected response")) {
      throw error;
    }
    throw new Error("Network error occurred while fetching repositories. Please check your connection.");
  }
}
