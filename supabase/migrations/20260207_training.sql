-- Create courses table
CREATE TABLE IF NOT EXISTS public.walker_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT, -- Link to video or markdown content
    duration_minutes INTEGER,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy courses
INSERT INTO public.walker_courses (title, description, duration_minutes, level) VALUES
('Fundamentos del Paseo', 'Aprende lo básico sobre seguridad y correa.', 45, 'beginner'),
('Primeros Auxilios Caninos', 'Cómo reaccionar ante emergencias comunes.', 60, 'intermediate'),
('Comportamiento Canino', 'Entiende el lenguaje corporal de los perros.', 90, 'advanced');

-- Create enrollments/progress table
CREATE TABLE IF NOT EXISTS public.walker_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    walker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.walker_courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('enrolled', 'completed')) DEFAULT 'enrolled',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(walker_id, course_id)
);

-- RLS
ALTER TABLE public.walker_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walker_enrollments ENABLE ROW LEVEL SECURITY;

-- Everyone can read courses
CREATE POLICY "Everyone can read courses" ON public.walker_courses
    FOR SELECT USING (true);

-- Walkers can manage their own enrollments
CREATE POLICY "Walkers can view own enrollments" ON public.walker_enrollments
    FOR SELECT USING (auth.uid() = walker_id);

CREATE POLICY "Walkers can enroll themselves" ON public.walker_enrollments
    FOR INSERT WITH CHECK (auth.uid() = walker_id);

CREATE POLICY "Walkers can update own enrollments" ON public.walker_enrollments
    FOR UPDATE USING (auth.uid() = walker_id);
