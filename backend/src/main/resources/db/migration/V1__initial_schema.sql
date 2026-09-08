CREATE TABLE movie (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tmdb_id BIGINT NOT NULL UNIQUE,
    imdb_id TEXT,
    title TEXT NOT NULL,
    original_title TEXT,
    release_date DATE,
    overview TEXT,
    poster_path TEXT,
    vote_average NUMERIC(4, 2) CHECK (vote_average BETWEEN 0 AND 10),
    metadata_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE storage_root (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    container_path TEXT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE download (
    id UUID PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movie(id),
    storage_root_id BIGINT NOT NULL REFERENCES storage_root(id),
    idempotency_key UUID NOT NULL UNIQUE,
    engine TEXT NOT NULL DEFAULT 'QBITTORRENT',
    external_id TEXT,
    info_hash TEXT,
    indexer_name TEXT,
    release_title TEXT NOT NULL,
    acquisition_ref TEXT NOT NULL,
    relative_directory TEXT NOT NULL,
    resolution_height INTEGER CHECK (resolution_height > 0),
    source_type TEXT,
    video_codec TEXT,
    dynamic_range TEXT,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'SUBMITTING', 'METADATA', 'QUEUED', 'DOWNLOADING',
        'PAUSED', 'STALLED', 'CHECKING', 'COMPLETED', 'SEEDING',
        'ERROR', 'CANCELED', 'REMOVED'
    )),
    engine_state TEXT,
    progress NUMERIC(6, 5) NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 1),
    total_bytes BIGINT CHECK (total_bytes >= 0),
    downloaded_bytes BIGINT NOT NULL DEFAULT 0 CHECK (downloaded_bytes >= 0),
    download_speed_bps BIGINT NOT NULL DEFAULT 0 CHECK (download_speed_bps >= 0),
    eta_seconds BIGINT CHECK (eta_seconds >= 0),
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ,
    last_error TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE (id, movie_id),
    UNIQUE (storage_root_id, relative_directory)
);

CREATE UNIQUE INDEX uq_download_engine_external
    ON download(engine, external_id)
    WHERE external_id IS NOT NULL AND status <> 'REMOVED';
CREATE INDEX ix_download_movie ON download(movie_id);
CREATE INDEX ix_download_worker ON download(status, next_attempt_at);

CREATE TABLE local_file (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movie(id),
    download_id UUID,
    storage_root_id BIGINT NOT NULL REFERENCES storage_root(id),
    relative_path TEXT NOT NULL,
    file_kind TEXT NOT NULL CHECK (file_kind IN ('VIDEO', 'SUBTITLE', 'OTHER')),
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    availability TEXT NOT NULL DEFAULT 'PRESENT'
        CHECK (availability IN ('PRESENT', 'MISSING', 'DELETED')),
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_verified_at TIMESTAMPTZ,
    FOREIGN KEY (download_id, movie_id) REFERENCES download(id, movie_id),
    UNIQUE (storage_root_id, relative_path)
);

CREATE INDEX ix_local_file_movie ON local_file(movie_id);
CREATE INDEX ix_local_file_download ON local_file(download_id);

CREATE TABLE download_event (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    download_id UUID NOT NULL REFERENCES download(id),
    event_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    message TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_download_event_history
    ON download_event(download_id, occurred_at DESC);

INSERT INTO storage_root (name, container_path)
VALUES ('Biblioteca principal', '/data');
