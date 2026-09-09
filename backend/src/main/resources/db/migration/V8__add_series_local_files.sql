ALTER TABLE local_file ALTER COLUMN movie_id DROP NOT NULL;
ALTER TABLE local_file DROP CONSTRAINT local_file_download_id_movie_id_fkey;
ALTER TABLE local_file ADD COLUMN series_tmdb_id BIGINT;
ALTER TABLE local_file ADD COLUMN series_title TEXT;
ALTER TABLE local_file ADD COLUMN series_poster_path TEXT;
ALTER TABLE local_file ADD COLUMN season_number INTEGER;
ALTER TABLE local_file ADD COLUMN episode_number INTEGER;
CREATE INDEX ix_local_file_series ON local_file(series_tmdb_id, season_number, episode_number);
