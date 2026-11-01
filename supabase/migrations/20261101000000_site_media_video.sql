-- CMS media may now include looping background videos (homepage hero). MP4 and WebM, up to 50 MB.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
where id = 'site-media';
