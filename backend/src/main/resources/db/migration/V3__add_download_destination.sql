ALTER TABLE storage_root
    ADD COLUMN download_relative_path TEXT NOT NULL DEFAULT 'incoming';
