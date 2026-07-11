-- Supabase Database Normalization and Migration Script
-- Run this in the Supabase SQL Editor

BEGIN;

-- 1. Create `macros` table
CREATE TABLE IF NOT EXISTS public.macros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- 2. Create `subjects` table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    macro_id UUID NOT NULL REFERENCES public.macros(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, macro_id, name)
);

-- 3. Add necessary columns to existing `sessions` table
-- Add user_id first
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- If you only have one user right now, we can assign all existing sessions to the first user in auth.users
-- IMPORTANT: This assigns ALL existing data to the FIRST user created in your system.
UPDATE public.sessions
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing rows
ALTER TABLE public.sessions ALTER COLUMN user_id SET NOT NULL;

-- Add subject_id column
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE;

-- 4. Migrate Data: Extract unique macros
INSERT INTO public.macros (user_id, name)
SELECT DISTINCT user_id, macro 
FROM public.sessions 
WHERE macro IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

-- 5. Migrate Data: Extract unique subjects and link to macros
INSERT INTO public.subjects (user_id, macro_id, name)
SELECT DISTINCT s.user_id, m.id, s.subject
FROM public.sessions s
JOIN public.macros m ON m.name = s.macro AND m.user_id = s.user_id
WHERE s.subject IS NOT NULL
ON CONFLICT (user_id, macro_id, name) DO NOTHING;

-- 6. Link sessions to their new subjects
UPDATE public.sessions s
SET subject_id = sub.id
FROM public.subjects sub
JOIN public.macros m ON m.id = sub.macro_id
WHERE s.subject = sub.name 
  AND s.macro = m.name 
  AND s.user_id = sub.user_id;

-- Make subject_id NOT NULL after updating
ALTER TABLE public.sessions ALTER COLUMN subject_id SET NOT NULL;

-- 7. Drop the old raw string columns now that data is migrated
ALTER TABLE public.sessions 
DROP COLUMN IF EXISTS macro,
DROP COLUMN IF EXISTS subject;

-- 8. Set up Row Level Security (RLS)
ALTER TABLE public.macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies for macros
CREATE POLICY "Users can manage their own macros"
ON public.macros FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create Policies for subjects
CREATE POLICY "Users can manage their own subjects"
ON public.subjects FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create Policies for sessions
-- (Drop existing if any to avoid conflict, but assuming none exists that conflicts)
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
CREATE POLICY "Users can manage their own sessions"
ON public.sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;
