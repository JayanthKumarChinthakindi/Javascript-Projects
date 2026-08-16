# GitHub Profile Finder

A minimal, professional developer tool built to search, discover, and inspect GitHub profiles and public repositories in real-time. Designed with a modern, high-contrast flat layout (reminiscent of modern platforms like Vercel and Linear) and fully optimized for performance, accessibility, and responsiveness.

---

## 🔍 Overview

This application communicates directly with the GitHub REST API to retrieve developer details and public repositories. It implements client-side caching, local storage history search tracking, and visual feedback for sharing or copying links.

---

## ✨ Features

- **Real-time REST API Search**: Fetches profile cards and public repositories (up to 100).
- **Client-Side API Caching**: Stores profile details and repository payloads in-memory with a 5-minute Time-to-Live (TTL) to avoid redundant requests.
- **Repository Search & Filters**: Live, case-insensitive repository filter (by name) combined with programming language dropdown filters (including an "Other" category for null states).
- **Repository Sorting**: Sorts repository lists by stars, newest update date, or oldest update date.
- **Recent Searches (History)**: Keeps the last 5 successful unique searches in local storage, allowing quick re-fetching with redundant click-prevention.
- **Copy & Native Share sheet integration**: Uses the native Web Share API to share profiles (with a graceful Clipboard API fallback and green success state checkmarks).
- **Sleek Light/Dark Mode Toggle**: Persistent theme configuration loaded instantly from storage to prevent visual styling flashes.
- **Accessible & Responsive**: Standard system typography, `aria-describedby` focus announcements, and mobile-friendly fluid grid layouts.

---

## 🛠️ Technologies Used

- **Markup**: Semantic HTML5 structures.
- **Styling**: Vanilla CSS3 (Custom design tokens, variables, flexbox/grid layouts, mobile-first media queries).
- **Logic**: Vanilla Modern JavaScript (ES6+ async/await, Array methods, LocalStorage, Clipboard & Web Share APIs).

---

## 📁 Project Structure

```
GitHub-Profile-Finder/
├── index.html     # Application structure and accessibility attributes
├── style.css      # Developer-tool CSS tokens, animations, and responsive queries
├── api.js         # REST endpoints, standard HTTP mappings, and cache logic
├── ui.js          # Dynamic DOM rendering, templates, and escape safety helpers
├── script.js      # App boot initialization, listeners, and event drivers
└── README.md      # Project portfolio documentation
```

---

## 🚀 How It Works

```
[User Search Form Submit] ──> [Sanitize & Validate Input]
                                       │
                                       ▼ (Passed)
                            [Check Loaded User State] ──(Already Loaded)──> [Log & Return]
                                       │ (New User)
                                       ▼
                            [Check In-Memory Cache] ──(Cache Hit)───────> [Render UI]
                                       │ (Cache Miss)
                                       ▼
                            [Call API Module] ──> [Fetch Profile Data] ──> [Cache & Render Profile]
                                       │
                                       ▼
                               [Fetch Repo Data] ──> [Render List, Filters, Sort]
```

---

## 💡 JavaScript Concepts Learned

- **Asynchronous Execution Flow**: Handled loading blocks using `async / await` and fetch routines.
- **Caching Map Tables**: Leveraged ES6 `Map` tables to build lightweight client-side memory caching buffers with timestamp-based TTL expiry checking.
- **Array Transformations**: Combined multiple operations using native methods (`map`, `filter`, `sort`, `reduce`, `Set`).
- **Deferred DOM Resolution**: Restructured selector assignments inside `init()` at `DOMContentLoaded` startup to guarantee element visibility and avoid `null` references on runtime event listeners.
- **Event Delegation**: Optimized recent searches list interactions by binding a single click listener to the parent container.

---

## 📡 API Endpoints

The project retrieves data from the GitHub REST API (v3):
- **User Profile**: `GET https://api.github.com/users/{username}`
- **User Repositories**: `GET https://api.github.com/users/{username}/repos?per_page=100`

---

## 🎨 Design & Responsiveness

The interface adapts dynamically across standard viewports using clean CSS media queries:
- **Mobile** (`320px` to `480px`): Single column vertical layout, full-width search input buttons.
- **Tablet** (`768px`): Stacked sidebar widgets above the repository grid cards.
- **Desktop** (`1024px` to `1440px`): Side-by-side dashboard grid with a sticky profile card on the left.

---

## 🔒 LocalStorage Implementation

- **Theme Storage**: Saves theme choices under `"theme" = "light" | "dark"`, loaded via an immediately invoked function expression (IIFE) at the top of the body to prevent white-flash layout flashes.
- **Search History**: Saves successfully searched unique usernames under `"recent_searches"`, capped at 5 names. History reads and writes are safely enclosed within `try / catch` blocks to handle browser private-browsing quotas gracefully.

---

## ⚠️ Error Handling & Accessibility

- **Standard HTTP Exceptions**: Converts HTTP error codes (e.g. 404, 403, 429, 500) into friendly instructions.
- **Input Error Labels**: Links `#username-input` with `aria-describedby="search-error"`, combined with `aria-live="polite"` tags on the alert box to announce validation errors dynamically.
- **Keyboard Access**: Focus outlines have visible borders, and search forms use standard `form` submissions to support executing queries by pressing **Enter**.

---

## 📸 Screenshots

### Dark Mode (Dashboard View)
`[Placeholder: Dark Mode Dashboard Screenshot showing profile card and repos grid]`

### Light Mode (Dashboard View)
`[Placeholder: Light Mode Dashboard Screenshot showing profile card and repos grid]`

### Search History & Chip Tags
`[Placeholder: Screenshot showing history chip tags and clear buttons]`

---

## 💻 How to Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/GitHub-Profile-Finder.git
   ```
2. **Open index.html**:
   - Because the project is written in vanilla JS without ES modules (preventing local file CORS restrictions), you can open `index.html` directly in any web browser by double-clicking it.
   - Alternatively, you can run a local server using Visual Studio Code's **Live Server** plugin or via Python:
     ```bash
     # Python 3
     python -m http.server 8000
     ```

---

## 🔮 Future Improvements

- **Pagination & Load More**: Add pagination indicators to fetch more than 100 repositories.
- **Debounced Inputs**: Add text search debouncing to throttle repository list re-rendering.
- **Extended Statistics**: Implement charts representing language usage percentages using SVG overlays.

---

## 📝 What I Learned

During this project, I strengthened my skills in writing clean, modular vanilla JavaScript. I learned the importance of organizing codebase files cleanly, implementing defensive memory caching to conserve API quotas, and designing custom focus borders to build highly interactive developer utilities that look clean on mobile-first displays.
