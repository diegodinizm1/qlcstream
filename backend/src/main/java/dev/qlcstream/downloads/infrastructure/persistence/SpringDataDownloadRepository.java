package dev.qlcstream.downloads.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

interface SpringDataDownloadRepository extends Repository<DownloadRow, UUID> {

    @Query(value = """
            SELECT d.id, m.tmdb_id AS movie_tmdb_id, m.title AS movie_title, m.poster_path,
                   d.release_title, d.resolution_height, d.source_type, d.dynamic_range, d.status,
                   d.progress, d.total_bytes, d.downloaded_bytes, d.download_speed_bps, d.eta_seconds, d.created_at
            FROM download d JOIN movie m ON m.id = d.movie_id
            WHERE d.status NOT IN ('COMPLETED', 'SEEDING', 'CANCELED', 'REMOVED')
            ORDER BY d.created_at DESC
            """, nativeQuery = true)
    List<DownloadProjection> findActive();

    interface DownloadProjection {
        UUID getId();
        long getMovieTmdbId();
        String getMovieTitle();
        String getPosterPath();
        String getReleaseTitle();
        Integer getResolutionHeight();
        String getSourceType();
        String getDynamicRange();
        String getStatus();
        double getProgress();
        Long getTotalBytes();
        long getDownloadedBytes();
        long getDownloadSpeedBps();
        Long getEtaSeconds();
        Instant getCreatedAt();
    }
}
