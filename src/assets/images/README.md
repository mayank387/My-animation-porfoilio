# 🖼️ Images & Graphic Assets Directory

Place your custom image assets in this folder.

### 1. Profile Picture
- Place your photo here: `src/assets/images/profile.jpg`
- To use it, you can either:
  - Option A: Set `profileImage: "/src/assets/images/profile.jpg"` in `src/data/contraConfig.js`
  - Option B: Use an image hosted online (e.g., Unsplash, Cloudinary, AWS S3) and paste the URL in `src/data/contraConfig.js`.

### 2. Project Poster Thumbnails
- Place your 16:9 and 9:16 video posters here, for example:
  - `src/assets/images/meta-smart-glasses.jpg`
  - `src/assets/images/boat-nirvana-ion.jpg`
  - `src/assets/images/fastrack-eyewear.jpg`
  - `src/assets/images/luxury-jewellery.jpg`
  - `src/assets/images/premium-perfume.jpg`
  - `src/assets/images/3d-animated-nature.jpg`
  - `src/assets/images/platinum-motocorp.jpg`
  - `src/assets/images/indian-family-comedy-reel.jpg`
- Update the `thumbnail` property in `src/data/projects.js` to point to your new image.

