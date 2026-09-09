package dev.qlcstream.downloads.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Collection;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface SpringDataDownloadRepository extends CrudRepository<DownloadRow, UUID> {

    @Query(value = "SELECT id FROM movie WHERE tmdb_id = :tmdbId", nativeQuery = true)
    Long findMovieIdByTmdbId(long tmdbId);

    List<DownloadRow> findByStatusNotIn(Collection<String> statuses);

    @Query(value = """
            SELECT d.id, COALESCE(m.tmdb_id, d.series_tmdb_id) AS movie_tmdb_id,
                   COALESCE(m.title, d.series_title) AS movie_title,
                   COALESCE(m.poster_path, d.series_poster_path) AS poster_path,
                   d.media_type, d.release_title, d.resolution_height, d.source_type, d.dynamic_range, d.status,
                   d.progress, d.total_bytes, d.downloaded_bytes, d.download_speed_bps, d.eta_seconds, d.created_at
            FROM download d LEFT JOIN movie m ON m.id = d.movie_id
            WHERE d.status NOT IN ('COMPLETED', 'CANCELED', 'REMOVED')
            ORDER BY d.created_at DESC
            """, nativeQuery = true)
    List<DownloadProjection> findActive();

    interface DownloadProjection {
        UUID getId();
        long getMovieTmdbId();
        String getMovieTitle();
        String getPosterPath();
        String getMediaType();
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
