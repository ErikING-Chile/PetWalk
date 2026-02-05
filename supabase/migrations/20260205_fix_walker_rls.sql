-- RLS Policies for Walker Documents Storage Bucket

-- 1. Drop existing incomplete/incorrect policies
DROP POLICY IF EXISTS "Individual Walker Read Docs" ON storage.objects;
DROP POLICY IF EXISTS "Individual Walker Update Docs" ON storage.objects;
DROP POLICY IF EXISTS "Individual Walker Delete Docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Walker Upload Docs" ON storage.objects;

-- 2. Allow authenticated users to upload to 'walker-documents'
-- Note: It is recommended to restrict uploads further if possible, but this matches the fix.
CREATE POLICY "Authenticated Walker Upload Docs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'walker-documents');

-- 3. Allow owners to READ their own documents
-- Matches files like: [folder]/[user_id]_[timestamp].[ext]
CREATE POLICY "Individual Walker Read Docs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'walker-documents' AND name LIKE '%/' || auth.uid()::text || '_%');

-- 4. Allow owners to UPDATE their own documents
CREATE POLICY "Individual Walker Update Docs" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'walker-documents' AND name LIKE '%/' || auth.uid()::text || '_%');

-- 5. Allow owners to DELETE their own documents
CREATE POLICY "Individual Walker Delete Docs" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'walker-documents' AND name LIKE '%/' || auth.uid()::text || '_%');
