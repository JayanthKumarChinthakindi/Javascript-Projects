/**
 * GitHub Profile Finder
 * Client-Side Validation and Search Interaction
 */

"use strict";

// Initialize theme preference immediately to prevent visual flash
(function() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
})();

// DOM Element Selectors
const searchForm = document.querySelector(".search-form");
const usernameInput = document.getElementById("username-input");
const searchError = document.getElementById("search-error");
const loadingOverlay = document.getElementById("loading-overlay");
const reposSortSelect = document.getElementById("repos-sort");
const reposSearchInput = document.getElementById("repos-search");
const reposLangSelect = document.getElementById("repos-lang");
const themeToggleBtn = document.getElementById("theme-toggle");
const recentList = document.getElementById("recent-list");
const clearRecentBtn = document.getElementById("clear-recent");
let copyProfileBtn = null;
let shareProfileBtn = null;

// Application State Variables
let isLoading = false;
let currentRepositories = [];
let repoSearchQuery = "";
let repoLanguageFilter = "all";
let currentlyLoadedUser = "";

const RECENT_SEARCHES_KEY = "recent_searches";
let recentSearches = [];

/**
 * Initializes form event listeners.
 */
function init() {
  copyProfileBtn = document.getElementById("copy-profile-btn");
  shareProfileBtn = document.getElementById("share-profile-btn");

  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchSubmit);
  }

  if (usernameInput) {
    // Clear error states dynamically as the user types
    usernameInput.addEventListener("input", clearError);
  }

  if (reposSortSelect) {
    reposSortSelect.addEventListener("change", handleSortChange);
  }

  if (reposSearchInput) {
    reposSearchInput.addEventListener("input", handleRepoSearch);
  }

  if (reposLangSelect) {
    reposLangSelect.addEventListener("change", handleLangFilterChange);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  if (recentList) {
    recentList.addEventListener("click", handleRecentItemClick);
  }

  if (clearRecentBtn) {
    clearRecentBtn.addEventListener("click", handleClearRecentClick);
  }

  if (copyProfileBtn) {
    copyProfileBtn.addEventListener("click", handleCopyProfileClick);
  }

  if (shareProfileBtn) {
    shareProfileBtn.addEventListener("click", handleShareProfileClick);
  }

  loadRecentSearches();
  renderRecentSearches(recentSearches);
}

/**
 * Triggers the sanitize, validation, and search process for a username.
 * @param {string} rawUsername - Username to search
 * @param {boolean} force - Force executing fetch even if username is currently loaded
 */
function performSearch(rawUsername, force = false) {
  if (isLoading) return; // Prevent duplicate requests while loading

  const username = sanitizeInput(rawUsername);
  
  // Prevent redundant requests if the user is already loaded and we are not forcing a refresh
  if (!force && currentlyLoadedUser && currentlyLoadedUser.toLowerCase() === username.toLowerCase()) {
    console.log(`[script.js] User "${username}" is already loaded. Skipping search.`);
    return;
  }

  const isValid = validateUsername(username);
  if (isValid) {
    processSearch(username);
  }
}

/**
 * Handles search submit event, preventing default page reload,
 * sanitizing input, and driving validation/processing.
 * @param {Event} event - Form submission event
 */
function handleSearchSubmit(event) {
  event.preventDefault();
  const rawUsername = usernameInput ? usernameInput.value : "";
  performSearch(rawUsername, true); // Allow force refreshing on manual submit
}

/**
 * Event handler for clicking a recent search username tag.
 * @param {Event} event - Click event
 */
function handleRecentItemClick(event) {
  const target = event.target;
  if (target && target.classList.contains("recent-item-btn")) {
    const username = target.getAttribute("data-username");
    if (username) {
      if (usernameInput) {
        usernameInput.value = username;
      }
      performSearch(username, false); // Skip redundant fetches
    }
  }
}

/**
 * Event handler for clearing recent searches history.
 */
function handleClearRecentClick() {
  clearRecentSearches();
}

/**
 * Sanitizes input text by trimming trailing/leading whitespaces.
 * @param {string} input - Raw input string
 * @returns {string} - Trimmed input string
 */
function sanitizeInput(input) {
  return input ? input.trim() : "";
}

/**
 * Validates the username. Shows visual and text errors if invalid.
 * @param {string} username - Sanitized username string
 * @returns {boolean} - True if validation passes
 */
function validateUsername(username) {
  if (!username) {
    showError("Please enter a GitHub username.");
    return false;
  }

  // GitHub Username rules:
  // - Alphanumeric characters or single hyphens
  // - Cannot begin or end with a hyphen
  // - Max 39 characters
  const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

  if (!githubUsernameRegex.test(username)) {
    showError("Please enter a valid GitHub username (alphanumeric and single hyphens).");
    return false;
  }

  clearError();
  return true;
}

/**
 * Displays error message and applies error styles to search container.
 * @param {string} message - Error description to display
 */
function showError(message) {
  if (searchError) {
    searchError.textContent = message;
    searchError.classList.add("visible");
  }

  if (searchForm) {
    searchForm.classList.add("has-error");
  }
}

/**
 * Clears active error styles and text.
 */
function clearError() {
  if (searchError) {
    searchError.textContent = "";
    searchError.classList.remove("visible");
  }

  if (searchForm) {
    searchForm.classList.remove("has-error");
  }
}

/**
 * Fetches user profile data from the API, logs the response,
 * and handles potential failures (errors).
 * @param {string} username - Sanitized and validated username
 */
/**
 * Displays the loading spinner overlay and disables form elements.
 */
function showLoading() {
  isLoading = true;
  if (loadingOverlay) {
    loadingOverlay.classList.add("visible");
    loadingOverlay.setAttribute("aria-hidden", "false");
  }

  const searchBtn = searchForm ? searchForm.querySelector(".search-btn") : null;
  if (usernameInput) usernameInput.disabled = true;
  if (searchBtn) {
    searchBtn.disabled = true;
    const btnSpan = searchBtn.querySelector("span");
    if (btnSpan) btnSpan.textContent = "Searching...";
  }
}

/**
 * Hides the loading spinner overlay and re-enables form elements.
 */
function hideLoading() {
  isLoading = false;
  if (loadingOverlay) {
    loadingOverlay.classList.remove("visible");
    loadingOverlay.setAttribute("aria-hidden", "true");
  }

  const searchBtn = searchForm ? searchForm.querySelector(".search-btn") : null;
  if (usernameInput) usernameInput.disabled = false;
  if (searchBtn) {
    searchBtn.disabled = false;
    const btnSpan = searchBtn.querySelector("span");
    if (btnSpan) btnSpan.textContent = "Search";
  }
}

/**
 * Fetches user profile data from the API, logs the response,
 * and handles potential failures (errors).
 * @param {string} username - Sanitized and validated username
 */
async function processSearch(username) {
  console.log(`GitHub Profile Finder: Initiating search for "${username}"...`);
  
  // Clear any previous error before request
  clearError();

  // Reset repository filter/sort inputs
  if (reposSearchInput) reposSearchInput.value = "";
  if (reposSortSelect) reposSortSelect.value = "stars";
  if (reposLangSelect) reposLangSelect.value = "all";
  repoSearchQuery = "";
  repoLanguageFilter = "all";

  // Show loading indicator & lock form inputs
  showLoading();

  let profileData = null;

  try {
    // 1. Fetch user profile data
    profileData = await getUserProfile(username);
    console.log("GitHub Profile Finder API Profile Success response:", profileData);
    
    // Render profile details to the UI immediately
    renderProfile(profileData);

    // Save successfully searched GitHub username in localStorage
    addRecentSearch(profileData.login);

    // Update currently loaded user state to prevent redundant clicks re-fetches
    currentlyLoadedUser = profileData.login;
  } catch (error) {
    console.error("GitHub Profile Finder Profile API Error:", error.message);
    showError(error.message);
    hideLoading();
    return; // Halt execution if the profile itself fails to load
  }

  // 2. Fetch repository data (handles failures separately without breaking the profile card)
  try {
    const repoData = await getUserRepositories(username);
    console.log("GitHub Profile Finder API Repos Success response:", repoData);
    
    // Store repository dataset in memory to allow client-side sorting/filtering
    currentRepositories = repoData;

    // Build the dynamic language options list in the dropdown
    populateLanguageDropdown(repoData);

    // Apply active filter and sort together on the fresh repository dataset
    filterAndSortRepositories();
  } catch (error) {
    console.error("GitHub Profile Finder Repos API Error:", error.message);
    renderRepositoryError(error.message);
  } finally {
    // Hide loading indicator & unlock inputs
    hideLoading();
  }
}
/**
 * Event handler for sorting control change.
 * @param {Event} event - Dropdown selection change event
 */
function handleSortChange(event) {
  filterAndSortRepositories();
}

/**
 * Event handler for repository search input keystrokes.
 * @param {Event} event - Input change event
 */
function handleRepoSearch(event) {
  repoSearchQuery = event.target.value.toLowerCase().trim();
  filterAndSortRepositories();
}

/**
 * Event handler for language filter control change.
 * @param {Event} event - Dropdown selection change event
 */
function handleLangFilterChange(event) {
  repoLanguageFilter = event.target.value;
  filterAndSortRepositories();
}

/**
 * Filters the cached repository dataset using the active query, 
 * sorts the result using the active dropdown selection, and renders cards.
 * Does not mutate the original cached response array.
 */
function filterAndSortRepositories() {
  if (!currentRepositories) return;

  // 1. Filter locally stored repositories by name and language
  let processedRepos = [...currentRepositories];
  
  // Filter by search query
  if (repoSearchQuery) {
    processedRepos = processedRepos.filter((repo) =>
      repo.name.toLowerCase().includes(repoSearchQuery)
    );
  }

  // Filter by language criteria (safely handling null as "Other")
  if (repoLanguageFilter !== "all") {
    processedRepos = processedRepos.filter((repo) => {
      if (repoLanguageFilter === "other") {
        return !repo.language;
      }
      return repo.language && repo.language.toLowerCase() === repoLanguageFilter;
    });
  }

  // 2. Sort the filtered subset using the active select value
  const criteria = reposSortSelect ? reposSortSelect.value : "stars";
  if (criteria === "stars") {
    processedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (criteria === "newest") {
    processedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } else if (criteria === "oldest") {
    processedRepos.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
  }

  // 3. Render dynamically to UI
  renderRepositories(processedRepos);
}

/**
 * Toggles the application between light and dark visual themes.
 * Stores selection in localStorage.
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "light") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
}

/**
 * Safely loads recent searches history from localStorage.
 */
function loadRecentSearches() {
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    recentSearches = data ? JSON.parse(data) : [];
    if (!Array.isArray(recentSearches)) {
      recentSearches = [];
    }
  } catch (error) {
    console.error("Failed to load recent searches from localStorage:", error);
    recentSearches = [];
  }
}

/**
 * Safely saves recent searches history to localStorage.
 */
function saveRecentSearches() {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  } catch (error) {
    console.error("Failed to save recent searches to localStorage:", error);
  }
}

/**
 * Adds a username to the recent searches list, enforcing uniqueness and the 5-item cap.
 * @param {string} username - Successfully searched GitHub username
 */
function addRecentSearch(username) {
  if (!username) return;

  const lowerUsername = username.toLowerCase();
  
  // Remove duplicates case-insensitively
  recentSearches = recentSearches.filter(
    (name) => name.toLowerCase() !== lowerUsername
  );
  
  // Prepend new search to history list
  recentSearches.unshift(username);
  
  // Cap at the 5 most recent items
  if (recentSearches.length > 5) {
    recentSearches = recentSearches.slice(0, 5);
  }
  
  saveRecentSearches();
  renderRecentSearches(recentSearches);
}

/**
 * Clears the stored recent searches list from state and localStorage.
 */
function clearRecentSearches() {
  recentSearches = [];
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
  renderRecentSearches(recentSearches);
}

/**
 * Copies the specified text payload to the user's system clipboard.
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Resolves to true if copy succeeded
 */
async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
    return false;
  }
}

/**
 * Updates a button's visual elements temporarily to reflect success or error feedback.
 * @param {HTMLButtonElement} btn - Target button element
 * @param {Object} config - Config parameters
 */
function showButtonFeedback(btn, { isSuccess, message, originalText, originalIconSelector, successIconSelector }) {
  if (!btn) return;
  
  const activeClass = isSuccess ? "success" : "has-error";
  btn.classList.add(activeClass);
  
  const origIcon = btn.querySelector(originalIconSelector);
  const successIcon = btn.querySelector(successIconSelector);
  const btnText = btn.querySelector(".btn-text");
  
  if (origIcon) origIcon.style.display = "none";
  if (successIcon) successIcon.style.display = isSuccess ? "block" : "none";
  if (btnText) btnText.textContent = message;
  
  setTimeout(() => {
    // Only revert if we are still displaying the current message
    if (btnText && btnText.textContent === message) {
      btn.classList.remove("success", "has-error");
      if (origIcon) origIcon.style.display = "block";
      if (successIcon) successIcon.style.display = "none";
      if (btnText) btnText.textContent = originalText;
    }
  }, 2000);
}

/**
 * Event handler for copying the current profile link to the clipboard.
 * Uses the Clipboard API and provides visual feedback.
 */
async function handleCopyProfileClick() {
  if (!copyProfileBtn) return;
  
  const profileUrl = copyProfileBtn.getAttribute("data-url");
  if (!profileUrl) return;

  const success = await copyTextToClipboard(profileUrl);
  showButtonFeedback(copyProfileBtn, {
    isSuccess: success,
    message: success ? "Profile link copied!" : "Failed to copy",
    originalText: "Copy Link",
    originalIconSelector: ".copy-icon",
    successIconSelector: ".check-icon"
  });
}

/**
 * Event handler for sharing the current profile.
 * Uses the Web Share API when supported, falling back to copying the profile URL.
 */
async function handleShareProfileClick() {
  if (!shareProfileBtn) return;

  const profileUrl = shareProfileBtn.getAttribute("data-url");
  const profileName = shareProfileBtn.getAttribute("data-name");
  if (!profileUrl) return;

  const shareData = {
    title: `${profileName || "GitHub User"} - GitHub Profile`,
    text: `Check out ${profileName || "this user"}'s GitHub profile!`,
    url: profileUrl
  };

  // 1. If Web Share API is supported, trigger native dialog
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      showButtonFeedback(shareProfileBtn, {
        isSuccess: true,
        message: "Profile shared!",
        originalText: "Share Profile",
        originalIconSelector: ".share-icon",
        successIconSelector: ".check-icon"
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Web Share API failed:", error);
        await fallbackCopyProfileLink();
      }
    }
  } else {
    // 2. Fall back to copying the profile URL if Web Share is unsupported
    await fallbackCopyProfileLink();
  }
}

/**
 * Fallback helper that copies the profile link to the clipboard and shows feedback on the share button.
 */
async function fallbackCopyProfileLink() {
  const profileUrl = shareProfileBtn.getAttribute("data-url");
  const success = await copyTextToClipboard(profileUrl);
  showButtonFeedback(shareProfileBtn, {
    isSuccess: success,
    message: success ? "Profile link copied!" : "Failed to copy link",
    originalText: "Share Profile",
    originalIconSelector: ".share-icon",
    successIconSelector: ".check-icon"
  });
}

// Bind load handler to boot initialization
document.addEventListener("DOMContentLoaded", init);
