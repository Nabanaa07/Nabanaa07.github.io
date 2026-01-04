# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **static HTML/CSS/JavaScript website** for a gaming & comedy content creator (Nabana07). It's a single-page application with multiple pages that showcases YouTube videos, Twitch streams, music, and social links. The site is hosted on GitHub Pages.

**Tech Stack:**
- Pure HTML5, CSS3, and vanilla JavaScript (no frameworks)
- Responsive design with mobile-first approach
- Dynamic content loading via YouTube RSS feeds
- Twitch API integration for live stream detection

## Development Commands

### Local Development
```powershell
# Start a local server (Windows)
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js http-server (if installed)
npx http-server -p 8000

# Then open http://localhost:8000 in your browser
```

### Deployment
This site is deployed via GitHub Pages automatically on push to `main` branch. No build step required.

```powershell
# Commit and push changes
git add .
git commit -m "Your commit message"
git push origin main
```

### Testing
There is no automated test suite. Manual testing required:
1. Test all pages in browser: `index.html`, `videos.html`, `live.html`, `music.html`, `contact.html`
2. Test mobile responsiveness (Chrome DevTools or real device)
3. Verify theme switcher works across all 6 themes
4. Check that YouTube videos load correctly
5. Verify Twitch live detection works

## Project Architecture

### File Structure
```
├── index.html          # Homepage with hero, social links, about section
├── videos.html         # Displays regular videos + shorts from YouTube
├── live.html           # Twitch stream embed with live detection
├── music.html          # Music showcase (placeholder content)
├── contact.html        # Contact information with email and social links
├── styles.css          # All CSS including themes and responsive design
├── script.js           # All JavaScript functionality
├── logo.png            # Main logo with background
├── logo_nobg.png       # Logo without background (used in nav)
├── UX_ANALYSIS.md      # UX documentation and design decisions
└── WARP.md            # This file
```

### Key Architecture Patterns

#### 1. **Multi-Theme System**
The site supports 6 themes via CSS custom properties (CSS variables):
- Dark Mode (default)
- Extra Dark
- Light Mode
- E-Girl Mode (pink/purple)
- Banana Mode (yellow)
- Milk Chocolate (brown)

**Implementation:**
- Theme state stored in `localStorage` as `nabana-theme`
- Themes applied via `data-theme` attribute on `<body>`
- CSS variables defined in `:root` and overridden per theme
- Visual effects (falling emojis) triggered on theme change

**Key Code Locations:**
- `script.js`: `initThemeSwitcher()`, `createFallingEffect()`
- `styles.css`: Lines 10-84 (theme variable definitions)

#### 2. **Dynamic YouTube Video Loading**
Videos are fetched from YouTube RSS feed and rendered client-side.

**Flow:**
1. `fetchLatestVideos()` fetches RSS feed via CORS proxy (`allorigins.win`)
2. Parse XML response to extract video IDs, titles, thumbnails
3. Separate videos into regular videos vs. shorts (based on `KNOWN_SHORTS` array)
4. Render video cards with click-to-play thumbnails
5. On thumbnail click: replace with embedded YouTube iframe

**Key Code Locations:**
- `script.js`: Lines 210-403
- Videos page: `videos.html`, grids with IDs `#regular-videos` and `#shorts-videos`

**Important:** Update `KNOWN_SHORTS` array (line 315) when new shorts are published.

#### 3. **Twitch Live Status Detection**
The site checks if the Twitch stream is live using a public API (`decapi.me`).

**Flow:**
1. `checkTwitchLiveStatus()` runs on page load and every 60 seconds
2. Fetch from `https://decapi.me/twitch/uptime/nabana07`
3. If response includes "offline", show offline state
4. If live, show "LIVE NOW" badge on homepage and embed stream on live page

**Key Code Locations:**
- `script.js`: Lines 82-175
- Configuration: `TWITCH_USERNAME` (line 4), `CHECK_INTERVAL` (line 5)

#### 4. **Mobile-First Responsive Design**
The site uses a hamburger menu and heavily optimized layouts for mobile.

**Breakpoints:**
- `max-width: 768px`: Tablet and mobile
- `max-width: 480px`: Small mobile devices

**Mobile Features:**
- Fixed position slide-in navigation menu (from right side)
- Overlay backdrop when menu is open
- Theme selector repositioned to left of hamburger
- Compact social icons and video grids
- Horizontal scroll prevention measures

**Key Code Locations:**
- `script.js`: `initMobileMenu()` (lines 492-546)
- `styles.css`: Lines 1274-1649 (mobile responsive styles)

#### 5. **Navigation and Smooth Scrolling**
All pages share a fixed navigation bar with logo and links.

**Features:**
- Fixed navbar with blur backdrop effect
- Active state highlighting for current page
- Smooth scroll for anchor links (homepage only)
- Mobile hamburger menu with slide-in animation

**Key Code Locations:**
- `script.js`: Lines 7-21 (smooth scroll), 42-64 (active nav links)
- `styles.css`: Lines 107-252 (navbar styles)

## Important Code Patterns

### Adding a New Page
1. Copy an existing HTML file (e.g., `music.html`)
2. Update `<title>`, meta tags, and main content section
3. Add link to navigation in all pages (search for `.nav-links`)
4. Ensure consistent nav structure and active state class

### Updating Social Links
Social links appear in multiple places:
- Homepage hero section (large icons with labels)
- Footer (all pages)
- Contact page (dedicated section)

Search for these strings to find all locations:
- `youtube.com/@Nabana07`
- `twitch.tv/nabana07`
- `discord.gg/x64BRW4RNa`
- `tiktok.com/@nabanaa07`
- `instagram.com/nabanaa07`
- `businessfornabana@gmail.com`

### Adding New YouTube Videos
Videos are loaded automatically from RSS feed. To ensure proper categorization:
1. If adding shorts, update `KNOWN_SHORTS` array in `script.js` (line 315)
2. If RSS feed fails, update `FALLBACK_VIDEOS` array (line 216)

### Modifying Themes
1. Define CSS variables in `styles.css` under `body[data-theme="theme-name"]`
2. Add theme option button in all HTML files (search for `theme-option`)
3. Optionally add emoji effects in `themeEffects` object (line 406)

## Design Guidelines

### Color System
- **Primary (Green)**: Main CTAs, important actions (e.g., "Watch Videos" button)
- **Discord Purple**: Community actions (e.g., "Join Discord")
- **Yellow**: Headings, highlights, brand accent
- **Outline buttons**: Secondary actions

### Typography
- Font: Inter (loaded from Google Fonts)
- Hero title: 5rem (desktop), 2rem (mobile)
- Section headings: 3rem
- Body text: 1rem

### Button Sizing
- Desktop: `1rem` padding, full width: `auto`
- Mobile: `0.875rem` padding, full width: `300px` max

### Grid Layouts
- Regular videos: `minmax(280px, 1fr)` auto-fit grid
- Shorts: `minmax(200px, 250px)` grid, centered
- Mobile: Single column for videos, 2-column grid for shorts

## Common Tasks

### Updating Contact Email
Search for `businessfornabana@gmail.com` and replace in:
- `contact.html`
- Any other promotional materials

### Changing Stream Schedule
Currently there's no schedule shown. To add:
1. Add a section in `live.html` or homepage
2. Use static HTML or consider external calendar embed

### Customizing Hero Section
The homepage hero is in `index.html` lines 72-131:
- Logo: `hero-logo` class
- Title: `hero-title gradient-text`
- CTA buttons: `hero-cta` section
- Social icons: `social-icons` section

## Browser Support

Targets modern browsers (Chrome, Firefox, Safari, Edge):
- CSS Grid and Flexbox
- CSS Custom Properties
- ES6 JavaScript (async/await, arrow functions)
- Fetch API

**No IE11 support.**

## Performance Considerations

- Images served directly (no CDN)
- YouTube embeds lazy-loaded (only on click)
- Twitch API calls throttled (60-second intervals)
- CSS animations use `transform` and `opacity` for performance
- Mobile-first CSS reduces unnecessary desktop styles on small screens

## Known Limitations

1. **No backend**: All content is client-side
2. **CORS dependency**: YouTube RSS requires CORS proxy (`allorigins.win`)
3. **Manual short categorization**: Must update `KNOWN_SHORTS` array manually
4. **No video thumbnails caching**: Fetched on every page load
5. **Twitch API limitations**: Uses free public API (no official OAuth)

## Debugging Tips

### Videos Not Loading
1. Check browser console for CORS errors
2. Verify RSS feed URL: `https://www.youtube.com/feeds/videos.xml?channel_id=UCxKj_T4p0HvGpvL8YMvMqEw`
3. Check if `allorigins.win` proxy is operational
4. Fallback videos should display if RSS fails

### Twitch Live Detection Not Working
1. Check console for API errors
2. Manually test: `https://decapi.me/twitch/uptime/nabana07`
3. Verify `TWITCH_USERNAME` constant (line 4 in `script.js`)

### Mobile Menu Not Opening
1. Verify JavaScript is loaded (`script.js` at end of `<body>`)
2. Check for JavaScript errors in console
3. Ensure `mobile-menu-toggle` and `nav-links` IDs exist

### Theme Not Persisting
1. Check `localStorage` in browser DevTools
2. Verify `nabana-theme` key exists
3. Clear browser cache and test again

## External Dependencies

- **Google Fonts**: Inter font family
- **CORS Proxy**: `api.allorigins.win` (for YouTube RSS)
- **Twitch API Proxy**: `decapi.me` (for live status)
- **Twitch Embed SDK**: `https://embed.twitch.tv/embed/v1.js`

If any external service is down, fallback behavior should activate automatically.
