-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    walks_per_week INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans
INSERT INTO public.plans (name, description, price, walks_per_week) VALUES
('Básico Mensual', '2 paseos por semana', 35000, 2),
('Estándar Mensual', '3 paseos por semana', 50000, 3),
('Premium Mensual', '5 paseos por semana (Lun-Vie)', 80000, 5);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    preferred_days TEXT[], -- e.g. ['Monday', 'Wednesday']
    preferred_time TIME,
    pet_ids UUID[], -- Array of pet IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans
CREATE POLICY "Everyone can read active plans" ON public.plans
    FOR SELECT USING (is_active = true);

-- Clients can manage their own subscriptions
CREATE POLICY "Clients can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = client_id);
