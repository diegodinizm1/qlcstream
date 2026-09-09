package dev.qlcstream.downloads.infrastructure.persistence;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "download")
public class DownloadRow {
    @Id
    private UUID id;

    @Column(name = "movie_id", nullable = false)
    private long movieId;

    @Column(name = "storage_root_id", nullable = false)
    private long storageRootId;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private UUID idempotencyKey;

    @Column(nullable = false)
    private String engine;

    @Column(name = "indexer_name")
    private String indexerName;

    @Column(name = "release_title", nullable = false)
    private String releaseTitle;

    @Column(name = "acquisition_ref", nullable = false)
    private String acquisitionRef;

    @Column(name = "relative_directory", nullable = false)
    private String relativeDirectory;

    @Column(name = "resolution_height")
    private Integer resolutionHeight;

    @Column(name = "source_type")
    private String sourceType;

    @Column(name = "dynamic_range")
    private String dynamicRange;

    @Column(nullable = false)
    private String status;

    @Column(precision = 6, scale = 5, nullable = false)
    private BigDecimal progress;

    @Column(name = "downloaded_bytes", nullable = false)
    private long downloadedBytes;

    @Column(name = "download_speed_bps", nullable = false)
    private long downloadSpeedBps;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DownloadRow() {
    }

    public static DownloadRow queued(long movieId, UUID id, String releaseTitle, String acquisitionRef, String indexerName,
            Integer resolutionHeight, String sourceType, String dynamicRange) {
        var now = Instant.now();
        var row = new DownloadRow();
        row.id = id;
        row.movieId = movieId;
        row.storageRootId = 1;
        row.idempotencyKey = UUID.randomUUID();
        row.engine = "QBITTORRENT";
        row.indexerName = indexerName;
        row.releaseTitle = releaseTitle;
        row.acquisitionRef = acquisitionRef;
        row.relativeDirectory = "incoming/" + id;
        row.resolutionHeight = resolutionHeight;
        row.sourceType = sourceType;
        row.dynamicRange = dynamicRange;
        row.status = "QUEUED";
        row.progress = BigDecimal.ZERO;
        row.downloadedBytes = 0;
        row.downloadSpeedBps = 0;
        row.attemptCount = 1;
        row.createdAt = now;
        row.updatedAt = now;
        return row;
    }
}
