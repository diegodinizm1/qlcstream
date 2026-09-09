ALTER TABLE download ALTER COLUMN movie_id DROP NOT NULL;
ALTER TABLE download ADD COLUMN media_type TEXT NOT NULL DEFAULT 'MOVIE'
    CHECK (media_type IN ('MOVIE', 'SERIES'));
ALTER TABLE download ADD COLUMN series_tmdb_id BIGINT;
ALTER TABLE download ADD COLUMN series_title TEXT;
ALTER TABLE download ADD COLUMN series_poster_path TEXT;
ALTER TABLE download ADD COLUMN season_number INTEGER CHECK (season_number > 0);
ALTER TABLE download ADD COLUMN episode_number INTEGER CHECK (episode_number > 0);
CREATE INDEX ix_download_series ON download(series_tmdb_id, season_number, episode_number)
    WHERE series_tmdb_id IS NOT NULL;
