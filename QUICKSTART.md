# StreamLab Quick Start Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd streamlab-nextjs
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: **http://localhost:3000**

## First Time Usage

### Explorer Mode (Pre-configured Content)
1. The app opens in **Explorer mode** by default
2. Click on **🎬 Movies** to expand
3. Click any movie title to start streaming
4. For TV shows, click **📺 TV Shows** → Select show → Click episode

### Search Mode (Search Any Content)
1. Click the **🔍 Search** icon in the left activity bar
2. Type any movie or TV show name (e.g., "Spider-Man", "The Office")
3. Click on any search result
4. Video will start playing automatically

### Switching Servers
- When video loads, you'll see 5 server buttons above the player
- If one server doesn't work, click another
- Server 1 (Vidfast) is selected by default

## Features Showcase

### Try These:
1. **Search**: Type "Avatar" and watch Avatar: The Way of Water
2. **TV Shows**: Browse Breaking Bad episodes
3. **Server Switch**: Click different servers to find best quality
4. **Quick Access**: Pre-loaded movies in Explorer for instant streaming

## Troubleshooting

### Video won't play?
- Try switching to a different server
- Some content may be region-locked
- Check your internet connection

### Search not working?
- Check if you have internet connection
- TMDB API has rate limits (should be fine for personal use)

### Build for Production
```bash
npm run build
npm start
```

## What's Working

✅ Movie streaming from search
✅ TV show streaming from search  
✅ Pre-configured media library
✅ 5 different streaming servers
✅ TMDB search integration
✅ VSCode-style UI
✅ Auto-play functionality
✅ Server switching

## Enjoy Streaming! 🎬
