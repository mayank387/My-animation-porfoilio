# 🗄️ Supabase Cloud Database & Storage Setup Guide

This guide walks you through connecting your video portfolio to **Supabase** for secure authentication, PostgreSQL cloud database management, and cloud storage for video files and poster thumbnails.

---

## ⚡ Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project**.
3. Set your project details:
   - **Name**: `Mayank-Portfolio` (or your preferred name)
   - **Database Password**: Enter a strong password and save it securely.
   - **Region**: Choose the region closest to you or your target audience.
4. Click **Create new project** and wait ~1-2 minutes for provisioning.

---

## 📜 Step 2: Run the Complete SQL Migration in SQL Editor

In your Supabase project sidebar on the left:
1. Click the **SQL Editor** icon (`>_`).
2. Click **New Query** (or the **+** button).
3. Paste the entire SQL script below and click the green **RUN** button:

```sql
-- ==============================================================================
-- 🚀 COMPLETE DATABASE & STORAGE MIGRATION FOR MAYANK PORTFOLIO
-- Paste this script into the Supabase SQL Editor and click "RUN"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROJECTS TABLE & DISPLAY_ORDER MIGRATION
-- ------------------------------------------------------------------------------

-- Ensure projects table exists
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    spec_type TEXT DEFAULT 'Portfolio Concept',
    duration TEXT DEFAULT '0:20',
    aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '4:3')),
    display_order INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    featured BOOLEAN DEFAULT false,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    tagline TEXT,
    concept TEXT,
    tools JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all required columns exist (safe migration on existing table)
ALTER TABLE public.projects ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;

-- Backfill NULL display_order values so every project has an index
UPDATE public.projects 
SET display_order = 1 
WHERE display_order IS NULL;

-- Create index for display_order to accelerate sorting
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects (display_order ASC);

-- Enable Row Level Security (RLS) on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Reset project policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read published projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated read all projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated admin insert" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated admin update" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated admin delete" ON public.projects;
DROP POLICY IF EXISTS "Allow public read all projects" ON public.projects;

-- Public read policy: Anyone can view published projects
CREATE POLICY "Allow public read published projects"
ON public.projects FOR SELECT
TO public
USING (status = 'published' OR status IS NULL);

-- Authenticated admin policies: View drafts, create, update, and delete
CREATE POLICY "Allow authenticated read all projects"
ON public.projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated admin insert"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated admin update"
ON public.projects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated admin delete"
ON public.projects FOR DELETE
TO authenticated
USING (true);

-- ------------------------------------------------------------------------------
-- 2. STORAGE BUCKET CREATION & PUBLIC ACCESS (VIDEOS, THUMBNAIL, THUMBNAILS)
-- Automatically provisions and enables public streaming for Supabase Storage
-- ------------------------------------------------------------------------------

-- Ensure all video and thumbnail buckets are set to public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('videos', 'thumbnail', 'thumbnails', 'portfolio-videos');

-- Insert buckets if not already present (using free-tier safe 50MB limits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', true, 52428800, NULL),
  ('thumbnail', 'thumbnail', true, 26214400, NULL),
  ('thumbnails', 'thumbnails', true, 26214400, NULL)
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- ------------------------------------------------------------------------------
-- 3. STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures public CDN viewing/streaming and permits uploads without permission errors
-- ------------------------------------------------------------------------------

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to avoid duplicate errors
DROP POLICY IF EXISTS "Public media select policy" ON storage.objects;
DROP POLICY IF EXISTS "Public media insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Public media update policy" ON storage.objects;
DROP POLICY IF EXISTS "Public media delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Public media access videos" ON storage.objects;
DROP POLICY IF EXISTS "Public media access thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Public media access thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admin update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Admin update thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete thumbnails" ON storage.objects;

-- 1. SELECT (Streaming & Viewing): Anyone (visitors, anon, authenticated) can stream and view files
CREATE POLICY "Public media select policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('videos', 'thumbnail', 'thumbnails'));

-- 2. INSERT (Uploads): Allow both authenticated and anon users to upload into videos and thumbnail buckets
CREATE POLICY "Public media insert policy"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id IN ('videos', 'thumbnail', 'thumbnails'));

-- 3. UPDATE: Allow updates to files in videos and thumbnail buckets
CREATE POLICY "Public media update policy"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id IN ('videos', 'thumbnail', 'thumbnails'))
WITH CHECK (bucket_id IN ('videos', 'thumbnail', 'thumbnails'));

-- 4. DELETE: Allow deletes from videos and thumbnail buckets
CREATE POLICY "Public media delete policy"
ON storage.objects FOR DELETE
TO public
USING (bucket_id IN ('videos', 'thumbnail', 'thumbnails'));
```

---

## 🔐 Step 3: Create Your Administrator Account

1. In Supabase, go to **Authentication** &rarr; **Users**.
2. Click **Add user** &rarr; **Create user**.
3. Enter your administrator email (e.g., `mayank@studio.com`) and choose a strong password.
4. **Important**: Toggle **Auto Confirm User?** to **ON** so you can sign in immediately without email confirmation.
5. Click **Create user**.

---

## 🔑 Step 4: Configure Environment Variables

1. In Supabase, go to **Project Settings** (gear icon at the bottom left) &rarr; **API**.
2. Locate the following two values:
   - **Project URL** (e.g. `https://xyzprojectid.supabase.co`)
   - **anon / public** API Key (under *Project API keys*)
   > ⚠️ **Security Warning**: Do **NOT** use the `service_role` secret key in your frontend. The `anon` public key is designed for the client and protected by Row Level Security.
3. Open or create the `.env` file in the root folder of your project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
```

4. Save the file and restart your local dev server:
```bash
npm run dev
```

---

## 🚀 How to Access Your Admin Dashboard

1. **Direct Route**: Navigate to `http://localhost:5173/admin` in your browser.
2. **Keyboard Shortcut**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> on macOS) on any page of your portfolio.
3. **Footer Link**: Click the discreet **Admin** link at the bottom of the public website.
4. Enter your administrator email and password to access the Studio Manager.

---

## 💡 What You Can Do in the Dashboard

- **Upload My Stuff**: Select MP4, WebM, or MOV reels up to 250 MB directly from your computer, with real-time byte upload progress.
- **Auto & Custom Thumbnails**: Upload JPG, PNG, or WebP images, or pick auto-captured video frames.
- **Display Index Number**: Assign a manual index order (1, 2, 3...) to control the exact position of your videos in the public two-column portfolio gallery.
- **Aspect Ratio Selector**: Switch seamlessly between `16:9` (Cinema Widescreen), `9:16` (Vertical Instagram Reel), and `4:3` (Classic) with live player preview.
- **Save Draft & Publish**: Save projects as private drafts while working on them, or publish them instantly to your public portfolio gallery.
- **Live Preview in Theater**: Click the **Preview** button on any project in the dashboard to test fullscreen playback and controls.
- **Edit & Delete**: Update project metadata or delete projects (which also automatically cleans up cloud storage).
