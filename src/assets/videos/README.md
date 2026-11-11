# 🎬 Centralized Video & Media Assets Guide for Mayank's Portfolio

This guide explains how to replace the demo video placeholders with your own original 3D animated videos, cinematic product commercials, promotional videos, and creative reels.

---

## 📁 Centralized Projects Registry (`src/data/projects.js`)

All 8 initial sample projects are configured in **`src/data/projects.js`**. Each project has its own dedicated `id`, `videoUrl`, `thumbnail`, `localVideoPath`, and `localThumbnailPath`:

| # | Project Title | Category | Aspect Ratio | Dedicated Local Video Path |
|---|---|---|---|---|
| 1 | **Meta Smart Glasses – Technology Advertisement** | 3D Product Advertisements | 16:9 | `src/assets/videos/meta-smart-glasses.mp4` |
| 2 | **boAt Nirvana Ion ANC – Earbuds Commercial** | 3D Product Advertisements | 16:9 | `src/assets/videos/boat-nirvana-ion.mp4` |
| 3 | **Fastrack Eyewear – Product Advertisement** | 3D Product Advertisements | 16:9 | `src/assets/videos/fastrack-eyewear.mp4` |
| 4 | **Luxury Jewellery – Cinematic 3D Commercial** | Cinematic Brand Commercials | 16:9 | `src/assets/videos/luxury-jewellery.mp4` |
| 5 | **Premium Perfume – Cinematic Advertisement** | Cinematic Brand Commercials | 16:9 | `src/assets/videos/premium-perfume.mp4` |
| 6 | **3D Animated Nature – Wildlife Cinematic** | Nature & Wildlife Animations | 16:9 | `src/assets/videos/3d-animated-nature.mp4` |
| 7 | **Platinum Motocorp – Automotive Promotional Video** | Promotional Videos | 16:9 | `src/assets/videos/platinum-motocorp.mp4` |
| 8 | **Cinematic Indian Family Comedy – AI Reel** | Instagram Reels & Short-form | 9:16 (Vertical) | `src/assets/videos/indian-family-comedy-reel.mp4` |

---

## ⚡ 2 Ways to Add Your Videos

### Method 1: Using Cloud/CDN Hosting (Recommended for Maximum Speed & Fast Loading)
Video files can be heavy (50MB - 500MB). Hosting them on a high-speed CDN ensures instant streaming, quick buffering, and silky-smooth playback for your clients on any device.

1. Upload your `.mp4` video to your preferred video host or cloud storage:
   - **Vimeo** (Pro direct `.mp4` video link)
   - **Cloudinary** (Free video CDN with automatic optimization)
   - **AWS S3 / Supabase Storage / Cloudflare R2**
   - **Google Drive / Dropbox** (direct stream link)
2. Open `src/data/projects.js`.
3. Locate the project and replace the `videoUrl` property with your link:
   ```javascript
   {
     id: "meta-smart-glasses",
     title: "Meta Smart Glasses – Technology Advertisement",
     videoUrl: "https://your-cdn.com/videos/meta-glasses.mp4",
     thumbnail: "https://your-cdn.com/posters/meta-glasses-poster.jpg",
     ...
   }
   ```

### Method 2: Local Video Files (Inside `src/assets/videos/`)
1. Export your video as an optimized `.mp4` file (H.264 codec, AAC audio).
2. Drop the video file inside this folder (`src/assets/videos/`), for example:
   `src/assets/videos/meta-smart-glasses.mp4`
3. In `src/data/projects.js`, import the video file or reference it:
   ```javascript
   // At the top of src/data/projects.js:
   import metaGlassesVideo from '../assets/videos/meta-smart-glasses.mp4';

   // In the project item:
   videoUrl: metaGlassesVideo,
   ```

---

## ⚖️ Portfolio Concept Transparency
Every project is labeled with a clear **`specType`** (e.g. *Portfolio Concept Commercial*, *Directorial Treatment*) and an honest disclaimer notice. This ensures transparent, professional presentation for potential clients without claiming unconfirmed official partnerships.

---

## 💼 Connecting Your Behance & Freelance Profiles
Open `src/data/siteConfig.js` and update your Behance profile and email links:
```javascript
export const siteConfig = {
  behanceUrl: "https://www.behance.net/mayankkarn3",
  email: "mayankk3n@gmail.com",
  artistName: "Mayank",
  ...
};
```
Every CTA button ("Hire Me on Behance", "Send Project Brief") across the portfolio will direct potential clients to your verified profiles and direct communication channels.
