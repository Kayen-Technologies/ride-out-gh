-- Enforce the upload rules in docs/03-data-model.md at the bucket, so browser uploads
-- by admins cannot skip them. 8 MB = 8388608 bytes.
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('vehicle-images', 'sell-photos', 'id-documents');

-- CMS images may also be SVG (rendered through <img> only).
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
where id = 'site-media';
