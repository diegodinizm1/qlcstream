CREATE TABLE library_collection (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE library_collection_item (
    collection_id BIGINT NOT NULL REFERENCES library_collection(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('MOVIE', 'SERIES')),
    tmdb_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    subtitle TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, media_type, tmdb_id)
);

CREATE INDEX ix_library_collection_item_collection ON library_collection_item(collection_id, added_at DESC);
