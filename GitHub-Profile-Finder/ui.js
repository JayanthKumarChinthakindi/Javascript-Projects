/**
 * GitHub Profile Finder
 * UI Module: Handles DOM rendering and state transitions
 */

"use strict";

// Static language color mapping used across repo renders
const LANGUAGE_COLORS = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  python: "#3572a5",
  c: "#555555",
  "c++": "#f34b7d",
  java: "#b07219",
  go: "#00add8",
  rust: "#dea584",
  html: "#e34c26",
  css: "#563d7c",
  ruby: "#701516",
  php: "#4f5d95",
  shell: "#89e051"
};

/**
 * Renders user profile information dynamically into the DOM card elements.
 * Handles missing fields gracefully and formats creation dates.
 * @param {Object} profile - API response payload for user profile
 */
function renderProfile(profile) {
  // 1. Transition State Switcher from Empty to Dashboard View
  const stateResultsRadio = document.getElementById("state-results");
  if (stateResultsRadio) {
    stateResultsRadio.checked = true;
  }

  // 2. Render Avatar Image
  const avatarContainer = document.querySelector(".avatar-container");
  if (avatarContainer) {
    // Retain gradient border wrapper, replace placeholder SVG with image
    avatarContainer.innerHTML = `
      <div class="avatar-gradient-border"></div>
      <img src="${profile.avatar_url}" alt="${profile.name || profile.login} avatar" class="avatar-image">
    `;
  }

  // 3. Render Name and Username (linkable profile)
  const profileName = document.querySelector(".profile-name");
  if (profileName) {
    profileName.textContent = profile.name || profile.login;
  }

  const profileUsername = document.querySelector(".profile-username");
  if (profileUsername) {
    profileUsername.textContent = `@${profile.login}`;
    profileUsername.href = profile.html_url;
    profileUsername.target = "_blank";
    profileUsername.rel = "noopener noreferrer";
  }

  // 4. Render Bio (handle null)
  const profileBio = document.querySelector(".profile-bio");
  if (profileBio) {
    if (profile.bio) {
      profileBio.textContent = profile.bio;
      profileBio.classList.remove("not-available");
    } else {
      profileBio.textContent = "This profile has no bio.";
      profileBio.classList.add("not-available");
    }
  }

  // 5. Render Detail Fields (Location, Company, Website, Joined Date)
  const detailsContainer = document.querySelector(".profile-details");
  if (detailsContainer) {
    // Format creation date: "Joined Jan 25, 2011"
    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", dateOptions);

    // Sanitize website link format (ensure standard HTTP protocols)
    let websiteUrl = profile.blog;
    if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
      websiteUrl = `https://${websiteUrl}`;
    }

    detailsContainer.innerHTML = `
      <div class="detail-item ${!profile.location ? "not-available" : ""}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${profile.location || "Not Available"}</span>
      </div>
      
      <div class="detail-item ${!profile.company ? "not-available" : ""}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <span>${profile.company || "Not Available"}</span>
      </div>
      
      <div class="detail-item ${!profile.blog ? "not-available" : ""}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        ${
          profile.blog
            ? `<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">${profile.blog}</a>`
            : "<span>Not Available</span>"
        }
      </div>
      
      <div class="detail-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Joined ${joinedDate}</span>
      </div>
    `;
  }

  // 6. Render Numeric Statistics Cards
  const statItems = document.querySelectorAll(".profile-stats .stat-item");
  if (statItems.length === 3) {
    // Followers
    statItems[0].querySelector(".stat-value").textContent = formatNumber(profile.followers);
    // Following
    statItems[1].querySelector(".stat-value").textContent = formatNumber(profile.following);
    // Repositories count
    statItems[2].querySelector(".stat-value").textContent = formatNumber(profile.public_repos);
  }

  // 7. Update CTA Button Link to GitHub
  const githubProfileBtn = document.querySelector(".github-profile-btn");
  if (githubProfileBtn) {
    githubProfileBtn.href = profile.html_url;
    githubProfileBtn.target = "_blank";
    githubProfileBtn.rel = "noopener noreferrer";
  }

  // 8. Update Copy Profile Link Button
  const copyProfileBtn = document.getElementById("copy-profile-btn");
  if (copyProfileBtn) {
    copyProfileBtn.setAttribute("data-url", profile.html_url);
    copyProfileBtn.classList.remove("success");
    const copyIcon = copyProfileBtn.querySelector(".copy-icon");
    const checkIcon = copyProfileBtn.querySelector(".check-icon");
    const btnText = copyProfileBtn.querySelector(".btn-text");
    if (copyIcon) copyIcon.style.display = "block";
    if (checkIcon) checkIcon.style.display = "none";
    if (btnText) btnText.textContent = "Copy Link";
  }

  // 9. Update Share Profile Button
  const shareProfileBtn = document.getElementById("share-profile-btn");
  if (shareProfileBtn) {
    shareProfileBtn.setAttribute("data-url", profile.html_url);
    shareProfileBtn.setAttribute("data-name", profile.name || profile.login);
    shareProfileBtn.classList.remove("success");
    const shareIcon = shareProfileBtn.querySelector(".share-icon");
    const checkIcon = shareProfileBtn.querySelector(".check-icon");
    const btnText = shareProfileBtn.querySelector(".btn-text");
    if (shareIcon) shareIcon.style.display = "block";
    if (checkIcon) checkIcon.style.display = "none";
    if (btnText) btnText.textContent = "Share Profile";
  }
}

/**
 * Format large metric numbers into clean strings (e.g. 24890 -> 24.9k)
 * @param {number} num - Raw metric value
 * @returns {string} - Formatted label string
 */
function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

/**
 * Safely escapes special HTML characters to prevent XSS vulnerability from API strings.
 * @param {string} str - Raw string
 * @returns {string} - Escaped HTML string
 */
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders repository details dynamically inside the repository container.
 * Handles empty repos arrays and format fallbacks for descriptions and languages.
 * @param {Array} repositories - List of repository objects
 */
function renderRepositories(repositories) {
  const reposGrid = document.querySelector(".repos-grid");
  if (!reposGrid) return;

  // 1. Show empty state card if no public repositories are present
  if (!repositories || repositories.length === 0) {
    const searchInput = document.getElementById("repos-search");
    const query = searchInput ? searchInput.value.trim() : "";
    const emptyMessage = query 
      ? `No repositories match search "${escapeHTML(query)}"` 
      : "This user has no public repositories.";
      
    reposGrid.innerHTML = `
      <div class="repos-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>${emptyMessage}</p>
      </div>
    `;
    return;
  }

  // 3. Build Card Items
  const cardsHtml = repositories
    .map((repo) => {
      const escapedName = escapeHTML(repo.name);
      const escapedDesc = repo.description
        ? escapeHTML(repo.description)
        : `<span class="not-available">No description provided</span>`;

      // Date Format: "Jan 25, 2026"
      const dateOptions = { month: "short", day: "numeric", year: "numeric" };
      const formattedDate = new Date(repo.updated_at).toLocaleDateString("en-US", dateOptions);

      // Render Language Circle only if repository language is provided
      const langHtml = repo.language
        ? `
          <span class="repo-lang">
            <span class="lang-color" style="background-color: ${
              LANGUAGE_COLORS[repo.language.toLowerCase()] || "#94a3b8"
            }"></span>
            <span>${escapeHTML(repo.language)}</span>
          </span>
        `
        : "";

      return `
        <article class="repo-card">
          <div class="repo-card-main">
            <div class="repo-title-row">
              <h3 class="repo-name">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapedName}</a>
              </h3>
              <span class="repo-visibility">${repo.private ? "Private" : "Public"}</span>
            </div>
            <p class="repo-desc">${escapedDesc}</p>
          </div>
          
          <div class="repo-card-meta">
            <div class="repo-metrics">
              ${langHtml}
              <span class="repo-metric">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="stars">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>${formatNumber(repo.stargazers_count)}</span>
              </span>
              <span class="repo-metric">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="forks">
                  <line x1="6" y1="3" x2="6" y2="15"></line>
                  <circle cx="18" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M18 9a9 9 0 0 1-9 9"></path>
                </svg>
                <span>${formatNumber(repo.forks_count)}</span>
              </span>
            </div>
            
            <div class="repo-footer">
              <span class="repo-updated">Updated on ${formattedDate}</span>
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link-btn" aria-label="View ${escapedName} repository code">
                <span>View Code</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  reposGrid.innerHTML = cardsHtml;
}

/**
 * Populates the language filter dropdown menu dynamically based on loaded repositories.
 * @param {Array} repositories - Array of repository data from API
 */
function populateLanguageDropdown(repositories) {
  const langSelect = document.getElementById("repos-lang");
  if (!langSelect) return;

  // Save the currently selected value if any
  const previousValue = langSelect.value;

  // Start with default option
  langSelect.innerHTML = '<option value="all">All Languages</option>';

  if (!repositories || repositories.length === 0) return;

  // Extract unique languages
  const languages = new Set();
  let hasNullLanguage = false;

  repositories.forEach((repo) => {
    if (repo.language) {
      languages.add(repo.language);
    } else {
      hasNullLanguage = true;
    }
  });

  // Sort languages alphabetically
  const sortedLanguages = Array.from(languages).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  // Append option tags
  sortedLanguages.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang.toLowerCase();
    opt.textContent = lang;
    langSelect.appendChild(opt);
  });

  // Add "Other" if there are any repos with null language
  if (hasNullLanguage) {
    const otherOpt = document.createElement("option");
    otherOpt.value = "other";
    otherOpt.textContent = "Other";
    langSelect.appendChild(otherOpt);
  }

  // Restore previous selection if it's still available, else default to "all"
  const optionValues = Array.from(langSelect.options).map((opt) => opt.value);
  if (optionValues.includes(previousValue)) {
    langSelect.value = previousValue;
  } else {
    langSelect.value = "all";
  }
}

/**
 * Renders a repository fetch failure state card inside the repositories container.
 * @param {string} errorMessage - User-friendly error message description
 */
function renderRepositoryError(errorMessage) {
  const reposGrid = document.querySelector(".repos-grid");
  if (!reposGrid) return;
  
  reposGrid.innerHTML = `
    <div class="repos-error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>${escapeHTML(errorMessage)}</p>
    </div>
  `;
}

/**
 * Renders the recent searches container and list of items.
 * @param {Array<string>} searches - List of recent search usernames
 */
function renderRecentSearches(searches) {
  const container = document.getElementById("recent-searches-container");
  const list = document.getElementById("recent-list");
  if (!container || !list) return;

  if (!searches || searches.length === 0) {
    container.style.display = "none";
    list.innerHTML = "";
    return;
  }

  container.style.display = "flex";
  list.innerHTML = searches
    .map(
      (username) => `
      <button class="recent-item-btn" data-username="${escapeHTML(username)}" aria-label="Search for ${escapeHTML(username)}">
        ${escapeHTML(username)}
      </button>
    `
    )
    .join("");
}
