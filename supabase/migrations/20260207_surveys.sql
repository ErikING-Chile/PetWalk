-- Create surveys table
CREATE TABLE IF NOT EXISTS public.walk_surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.walk_bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    check_punctuality BOOLEAN DEFAULT false,
    check_care BOOLEAN DEFAULT false,
    check_communication BOOLEAN DEFAULT false,
    comment TEXT,
    reported_issue BOOLEAN DEFAULT false,
    issue_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.walk_surveys ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own surveys
CREATE POLICY "Clients can create surveys for their bookings" ON public.walk_surveys
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.walk_bookings
            WHERE id = booking_id
            AND client_id = auth.uid()
        )
    );

-- Clients can view their own surveys
CREATE POLICY "Clients can view their own surveys" ON public.walk_surveys
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.walk_bookings
            WHERE id = booking_id
            AND client_id = auth.uid()
        )
    );

-- Walkers can view surveys for their bookings (optional, maybe only average rating)
-- For now allow read to calculate stats
CREATE POLICY "Walkers can view surveys for their bookings" ON public.walk_surveys
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.walk_bookings
            WHERE id = booking_id
            AND walker_id = auth.uid()
        )
    );
