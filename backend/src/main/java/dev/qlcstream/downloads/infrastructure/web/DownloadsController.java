package dev.qlcstream.downloads.infrastructure.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.qlcstream.downloads.application.port.in.BrowseDownloadsUseCase;
import dev.qlcstream.downloads.domain.DownloadSummary;

@RestController
@RequestMapping("/api/downloads")
public class DownloadsController {

    private final BrowseDownloadsUseCase browseDownloads;

    public DownloadsController(BrowseDownloadsUseCase browseDownloads) {
        this.browseDownloads = browseDownloads;
    }

    @GetMapping
    List<DownloadResponse> active() {
        return browseDownloads.active().stream().map(DownloadResponse::from).toList();
    }

    record DownloadResponse(UUID id, long movieTmdbId, String movieTitle, String posterPath, String releaseTitle,
            Integer resolutionHeight, String sourceType, String dynamicRange, String status, double progress,
            Long totalBytes, long downloadedBytes, long downloadSpeedBps, Long etaSeconds, Instant createdAt) {
        static DownloadResponse from(DownloadSummary download) {
            return new DownloadResponse(download.id(), download.movieTmdbId(), download.movieTitle(), download.posterPath(),
                    download.releaseTitle(), download.resolutionHeight(), download.sourceType(), download.dynamicRange(),
                    download.status().name(), download.progress(), download.totalBytes(), download.downloadedBytes(),
                    download.downloadSpeedBps(), download.etaSeconds(), download.createdAt());
        }
    }
}
