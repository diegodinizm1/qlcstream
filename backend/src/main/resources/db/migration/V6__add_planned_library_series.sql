CREATE TABLE planned_library_series (
    tmdb_id BIGINT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500),
    poster_path VARCHAR(500),
    first_air_date DATE,
    vote_average NUMERIC(4,2),
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_planned_library_series_added_at
    ON planned_library_series(added_at DESC);
