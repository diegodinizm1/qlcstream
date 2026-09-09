CREATE TABLE library_favorite (
    media_type TEXT NOT NULL CHECK (media_type IN ('MOVIE', 'SERIES')),
    tmdb_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    subtitle TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (media_type, tmdb_id)
);

CREATE INDEX ix_library_favorite_added_at ON library_favorite(added_at DESC);
