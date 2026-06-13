# StreamLab - VSCode Style Streaming Platform v2.0

A personal streaming platform with VSCode-inspired UI, powered by 8 high-quality streaming servers with smart detection and auto-fallback.

## ✨ Key Features

- 🎨 **VSCode-inspired UI** - Dark theme with activity bar, sidebar, tabs, and status bar
- 🔍 **TMDB Search** - Search millions of movies and TV shows
- 🎬 **Movies** - Stream movies with 8 server options
- 📺 **TV Shows** - Browse seasons and episodes
- 🌐 **8 Streaming Servers** - VidSrc Pro, VidSrc, VidSrc XYZ, Embed.su, AutoEmbed, MoviesAPI, SuperEmbed, 2Embed
- 🎯 **Smart Server Selection** - Priority-based, reliability-ranked (60-95%)
- ⚡ **Auto-Detection** - 15s timeout detection, instant error detection
- 🔄 **Smart Fallback** - Auto-switch on failure, quality-based grouping
- 📊 **Connection Monitoring** - Real-time network speed detection
- 🚀 **Next.js 14** - Built with the latest Next.js App Router
- 📱 **Responsive** - Works on desktop browsers

## 🎯 Performance Features

### Server Reliability Ranking
- 🟢 **High Quality** (85-95% uptime) - VidSrc Pro, VidSrc, VidSrc XYZ, Embed.su
- 🟡 **Medium Quality** (70-85% uptime) - AutoEmbed, MoviesAPI, SuperEmbed
- 🔴 **Low Quality** (60-70% uptime) - 2Embed

### Smart Detection
- ⏳ Loading indicator with 15s timeout
- ❌ Automatic error detection
- ⏱️ Timeout warnings with suggestions
- 🟢🟡🔴 Network speed monitoring (4G/3G/2G)

### Buffer Prevention
- Best server loads first automatically
- Quality badges show reliability
- One-click server switching
- Connection speed-aware recommendations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd streamlab-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Search Mode (Recommended)

1. Click on the **🔍 Search** icon in the activity bar (left side)
2. Type any movie or TV show name
3. Click on any result to start streaming
4. Video loads with best server automatically
5. If slow or error, switch servers using buttons above video

### Watching Movies

1. Click on the **📁 Explorer** icon in the activity bar (left side)
2. Expand the **🎬 Movies** folder
3. Click on any movie to start streaming

### Watching TV Shows

1. Click on the **📁 Explorer** icon in the activity bar
2. Expand the **📺 TV Shows** folder
3. Click on a show to expand seasons and episodes
4. Click on any episode to start streaming

### Server Switching

- Servers appear above the video player grouped by quality
- 🟢 **High** - Try these first (most reliable)
- 🟡 **Medium** - Good fallback options
- 🔴 **Low** - Last resort if others fail
- Click any server button to switch instantly
- Failed servers show ❌ or ⏱️ indicators

### Status Bar

Watch the status bar above servers for:
- ✅ Streaming / ⏳ Connecting / ❌ Error / ⏱️ Timeout
- 🟢 Fast / 🟡 Medium / 🔴 Slow connection
- Current server name

## Adding Your Own Content

### Adding Movies

Edit `app/data/media.ts` and add to the `movies` array:

```typescript
{
  id: 'MOVIE_ID',  // The Vidfast movie ID
  title: 'Movie Title',
  type: 'movie'
}
```

### Adding TV Shows

Edit `app/data/media.ts` and add to the `tvShows` array:

```typescript
{
  id: 'SHOW_ID',  // The Vidfast show ID
  title: 'Show Title',
  type: 'tv',
  seasons: [
    { season: 1, episodes: 10 },
    { season: 2, episodes: 12 }
  ]
}
```

## Vidfast API

This app uses Vidfast's embed endpoints:

- **Movies**: `https://vidfast.pro/movie/{id}?autoPlay=true`
- **TV Shows**: `https://vidfast.pro/tv/{id}/{season}/{episode}?autoPlay=true`

## Project Structure

```
streamlab-nextjs/
├── app/
│   ├── components/          # React components
│   │   ├── ActivityBar.tsx  # Left activity bar
│   │   ├── Sidebar.tsx      # File explorer
│   │   ├── VideoPlayer.tsx  # Video player with tabs
│   │   └── StatusBar.tsx    # Bottom status bar
│   ├── data/
│   │   └── media.ts         # Movies and TV shows data
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── package.json
├── tsconfig.json
└── next.config.js
```

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling
- **Vidfast** - Streaming source

## Customization

### Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --bg-dark: #1e1e1e;
  --bg-sidebar: #252526;
  --accent: #0e639c;
  /* ... more colors */
}
```

### Layout

- Adjust sidebar width in `Sidebar.module.css`
- Change activity bar width in `ActivityBar.module.css`
- Modify status bar height in `StatusBar.module.css`

## License

MIT

## Notes

- This is for personal use only
- Vidfast URLs may change over time
- Some content may be region-locked
- Ensure you have rights to stream content in your region
# streamlabs
