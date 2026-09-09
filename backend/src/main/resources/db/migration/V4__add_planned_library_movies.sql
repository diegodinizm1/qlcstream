CREATE TABLE planned_library_movie (
    movie_id BIGINT PRIMARY KEY REFERENCES movie(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_planned_library_movie_added_at
    ON planned_library_movie(added_at DESC);
