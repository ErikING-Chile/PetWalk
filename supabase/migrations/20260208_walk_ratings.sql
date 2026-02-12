-- Add ended_at to walk_bookings if it doesn't exist
ALTER TABLE public.walk_bookings 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Create walk_ratings table
CREATE TABLE IF NOT EXISTS public.walk_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    walk_id UUID NOT NULL REFERENCES public.walk_bookings(id) ON DELETE CASCADE,
    walker_id UUID NOT NULL REFERENCES auth.users(id),
    client_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    pet_condition TEXT NOT NULL CHECK (pet_condition IN ('happy', 'sad', 'injured')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(walk_id) -- Only one rating per walk
);

-- RLS
ALTER TABLE public.walk_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Clients can view their own ratings" ON public.walk_ratings
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Walkers can view ratings assigned to them" ON public.walk_ratings
    FOR SELECT USING (auth.uid() = walker_id);

CREATE POLICY "Clients can create ratings for their completed walks" ON public.walk_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM public.walk_bookings 
            WHERE id = walk_id 
            AND status = 'completed' 
            AND client_id = auth.uid()
        )
    );
