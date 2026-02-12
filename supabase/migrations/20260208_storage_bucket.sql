-- Enable storage if not enabled (usually enabled by default)

-- Create bucket 'support-attachments'
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'support-attachments'
-- Allow public read access to everyone (or authenticated)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'support-attachments' );

-- Allow authenticated users to upload
CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'support-attachments'
    AND auth.role() = 'authenticated'
);
